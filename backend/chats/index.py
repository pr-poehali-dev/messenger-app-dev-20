"""
Chats API: action=list|create|messages|send|react|users
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
}

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'], cursor_factory=RealDictCursor)

def get_user_by_token(conn, token: str):
    if not token:
        return None
    with conn.cursor() as cur:
        cur.execute(
            "SELECT u.* FROM sessions s JOIN users u ON s.user_id = u.id "
            "WHERE s.token = %s AND s.expires_at > NOW()",
            (token,)
        )
        return cur.fetchone()

def handler(event: dict, context) -> dict:
    """Чаты и сообщения: список чатов, отправка, реакции, список пользователей"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    token = event.get('headers', {}).get('X-Auth-Token', '')
    params = event.get('queryStringParameters') or {}

    body = {}
    if method == 'POST':
        body = json.loads(event.get('body') or '{}')

    action = body.get('action') or params.get('action', '')

    conn = get_db()
    try:
        if action == 'users':
            with conn.cursor() as cur:
                search = params.get('q', '') or body.get('q', '')
                if search:
                    cur.execute(
                        "SELECT id, username, display_name, avatar_color, avatar_initials, is_online, last_seen "
                        "FROM users WHERE username ILIKE %s OR display_name ILIKE %s LIMIT 20",
                        (f'%{search}%', f'%{search}%')
                    )
                else:
                    cur.execute(
                        "SELECT id, username, display_name, avatar_color, avatar_initials, is_online, last_seen "
                        "FROM users ORDER BY display_name LIMIT 50"
                    )
                return {'statusCode': 200, 'headers': CORS,
                        'body': json.dumps({'users': [dict(r) for r in cur.fetchall()]}, default=str)}

        user = get_user_by_token(conn, token)
        if not user:
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Не авторизован'})}
        user_id = user['id']

        if action == 'list':
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT c.id, c.is_group, c.name, c.avatar_color, c.description,
                           (SELECT text FROM messages m WHERE m.chat_id = c.id
                            AND m.is_removed = FALSE ORDER BY m.created_at DESC LIMIT 1) as last_msg,
                           (SELECT created_at FROM messages m WHERE m.chat_id = c.id
                            AND m.is_removed = FALSE ORDER BY m.created_at DESC LIMIT 1) as last_time
                    FROM chats c
                    JOIN chat_members cm ON cm.chat_id = c.id
                    WHERE cm.user_id = %s
                    ORDER BY last_time DESC NULLS LAST
                """, (user_id,))
                chats_raw = [dict(r) for r in cur.fetchall()]

                result = []
                for chat in chats_raw:
                    if not chat['is_group']:
                        cur.execute("""
                            SELECT u.id, u.display_name, u.avatar_color, u.avatar_initials,
                                   u.is_online, u.username
                            FROM chat_members cm JOIN users u ON cm.user_id = u.id
                            WHERE cm.chat_id = %s AND cm.user_id != %s
                            LIMIT 1
                        """, (chat['id'], user_id))
                        other = cur.fetchone()
                        if other:
                            chat['other_user'] = dict(other)
                    result.append(chat)

                return {'statusCode': 200, 'headers': CORS,
                        'body': json.dumps({'chats': result}, default=str)}

        elif action == 'create':
            with conn.cursor() as cur:
                if body.get('is_group'):
                    name = body.get('name', 'Группа')
                    color = body.get('avatar_color', '#a855f7')
                    cur.execute(
                        "INSERT INTO chats (is_group, name, avatar_color, created_by) VALUES (TRUE, %s, %s, %s) RETURNING id",
                        (name, color, user_id)
                    )
                    chat_id = cur.fetchone()['id']
                    cur.execute("INSERT INTO chat_members (chat_id, user_id, is_admin) VALUES (%s, %s, TRUE)", (chat_id, user_id))
                    for uid in body.get('member_ids', []):
                        cur.execute(
                            "INSERT INTO chat_members (chat_id, user_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                            (chat_id, uid)
                        )
                else:
                    other_id = body.get('user_id')
                    if not other_id:
                        return {'statusCode': 400, 'headers': CORS,
                                'body': json.dumps({'error': 'user_id required'})}

                    cur.execute("""
                        SELECT c.id FROM chats c
                        JOIN chat_members cm1 ON cm1.chat_id = c.id AND cm1.user_id = %s
                        JOIN chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id = %s
                        WHERE c.is_group = FALSE LIMIT 1
                    """, (user_id, other_id))
                    existing = cur.fetchone()
                    if existing:
                        conn.commit()
                        return {'statusCode': 200, 'headers': CORS,
                                'body': json.dumps({'chat_id': existing['id']})}

                    cur.execute("INSERT INTO chats (is_group) VALUES (FALSE) RETURNING id")
                    chat_id = cur.fetchone()['id']
                    cur.execute("INSERT INTO chat_members (chat_id, user_id) VALUES (%s, %s)", (chat_id, user_id))
                    cur.execute("INSERT INTO chat_members (chat_id, user_id) VALUES (%s, %s)", (chat_id, other_id))

                conn.commit()
                return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'chat_id': chat_id})}

        elif action == 'messages':
            chat_id = params.get('chat_id') or body.get('chat_id')
            if not chat_id:
                return {'statusCode': 400, 'headers': CORS,
                        'body': json.dumps({'error': 'chat_id required'})}

            with conn.cursor() as cur:
                cur.execute("SELECT 1 FROM chat_members WHERE chat_id = %s AND user_id = %s",
                            (chat_id, user_id))
                if not cur.fetchone():
                    return {'statusCode': 403, 'headers': CORS,
                            'body': json.dumps({'error': 'Нет доступа'})}

                cur.execute("""
                    SELECT m.id, m.text, m.created_at, m.sender_id,
                           u.display_name as sender_name,
                           u.avatar_color as sender_color,
                           u.avatar_initials as sender_initials,
                           u.username as sender_username,
                           (SELECT json_agg(json_build_object('emoji', mr.emoji, 'user_id', mr.user_id))
                            FROM message_reactions mr WHERE mr.message_id = m.id) as reactions
                    FROM messages m
                    LEFT JOIN users u ON m.sender_id = u.id
                    WHERE m.chat_id = %s AND m.is_removed = FALSE
                    ORDER BY m.created_at ASC
                    LIMIT 200
                """, (chat_id,))
                msgs = [dict(r) for r in cur.fetchall()]
                return {'statusCode': 200, 'headers': CORS,
                        'body': json.dumps({'messages': msgs}, default=str)}

        elif action == 'send':
            chat_id = body.get('chat_id')
            text = (body.get('text') or '').strip()
            if not chat_id or not text:
                return {'statusCode': 400, 'headers': CORS,
                        'body': json.dumps({'error': 'chat_id и text обязательны'})}

            with conn.cursor() as cur:
                cur.execute("SELECT 1 FROM chat_members WHERE chat_id = %s AND user_id = %s",
                            (chat_id, user_id))
                if not cur.fetchone():
                    return {'statusCode': 403, 'headers': CORS,
                            'body': json.dumps({'error': 'Нет доступа'})}

                cur.execute(
                    "INSERT INTO messages (chat_id, sender_id, text) VALUES (%s, %s, %s) RETURNING id, created_at",
                    (chat_id, user_id, text)
                )
                row = dict(cur.fetchone())
                conn.commit()
                return {'statusCode': 200, 'headers': CORS,
                        'body': json.dumps({'message_id': row['id'], 'created_at': str(row['created_at'])})}

        elif action == 'react':
            message_id = body.get('message_id')
            emoji = body.get('emoji', '')
            if not message_id or not emoji:
                return {'statusCode': 400, 'headers': CORS,
                        'body': json.dumps({'error': 'message_id и emoji обязательны'})}

            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id FROM message_reactions WHERE message_id = %s AND user_id = %s AND emoji = %s",
                    (message_id, user_id, emoji)
                )
                if cur.fetchone():
                    return {'statusCode': 200, 'headers': CORS,
                            'body': json.dumps({'action': 'already_exists'})}
                cur.execute(
                    "INSERT INTO message_reactions (message_id, user_id, emoji) VALUES (%s, %s, %s)",
                    (message_id, user_id, emoji)
                )
                conn.commit()
                return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'action': 'added'})}

        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Неизвестное действие'})}
    finally:
        conn.close()
