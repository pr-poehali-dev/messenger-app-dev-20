"""
Auth API: action=register|login|me|logout в теле POST, или GET с action в query
"""
import json
import os
import hashlib
import secrets
import psycopg2
from psycopg2.extras import RealDictCursor

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
}

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'], cursor_factory=RealDictCursor)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

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
    """Auth: регистрация, вход, получение профиля, выход"""
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
        if action == 'register':
            username = (body.get('username') or '').strip().lower()
            display_name = (body.get('display_name') or '').strip()
            password = body.get('password') or ''

            if not username or not display_name or not password:
                return {'statusCode': 400, 'headers': CORS,
                        'body': json.dumps({'error': 'Заполните все поля'})}
            if len(password) < 4:
                return {'statusCode': 400, 'headers': CORS,
                        'body': json.dumps({'error': 'Пароль минимум 4 символа'})}

            initials = ''.join([w[0].upper() for w in display_name.split()[:2]])
            colors = ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4']
            color = colors[len(username) % len(colors)]
            node_id = '0x' + secrets.token_hex(8) + '...' + secrets.token_hex(4)
            pubkey = 'ed25519:' + secrets.token_hex(8) + '...' + secrets.token_hex(4)

            with conn.cursor() as cur:
                cur.execute("SELECT id FROM users WHERE username = %s", (username,))
                if cur.fetchone():
                    return {'statusCode': 409, 'headers': CORS,
                            'body': json.dumps({'error': 'Логин уже занят'})}

                cur.execute(
                    """INSERT INTO users (username, display_name, password_hash, avatar_color,
                       avatar_initials, node_id, pubkey, is_online)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, TRUE) RETURNING id""",
                    (username, display_name, hash_password(password), color, initials, node_id, pubkey)
                )
                user_id = cur.fetchone()['id']
                sess_token = secrets.token_hex(32)
                cur.execute("INSERT INTO sessions (user_id, token) VALUES (%s, %s)", (user_id, sess_token))
                conn.commit()

                cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
                user = dict(cur.fetchone())
                user.pop('password_hash', None)
                return {'statusCode': 200, 'headers': CORS,
                        'body': json.dumps({'token': sess_token, 'user': user}, default=str)}

        elif action == 'login':
            username = (body.get('username') or '').strip().lower()
            password = body.get('password') or ''

            with conn.cursor() as cur:
                cur.execute("SELECT * FROM users WHERE username = %s", (username,))
                user = cur.fetchone()
                if not user or user['password_hash'] != hash_password(password):
                    return {'statusCode': 401, 'headers': CORS,
                            'body': json.dumps({'error': 'Неверный логин или пароль'})}

                sess_token = secrets.token_hex(32)
                cur.execute("INSERT INTO sessions (user_id, token) VALUES (%s, %s)", (user['id'], sess_token))
                cur.execute("UPDATE users SET is_online = TRUE, last_seen = NOW() WHERE id = %s", (user['id'],))
                conn.commit()

                user = dict(user)
                user.pop('password_hash', None)
                return {'statusCode': 200, 'headers': CORS,
                        'body': json.dumps({'token': sess_token, 'user': user}, default=str)}

        elif action == 'me' or (method == 'GET' and not action):
            user = get_user_by_token(conn, token)
            if not user:
                return {'statusCode': 401, 'headers': CORS,
                        'body': json.dumps({'error': 'Не авторизован'})}
            user = dict(user)
            user.pop('password_hash', None)
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'user': user}, default=str)}

        elif action == 'logout':
            with conn.cursor() as cur:
                cur.execute("UPDATE sessions SET expires_at = NOW() WHERE token = %s", (token,))
                conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Неизвестное действие'})}
    finally:
        conn.close()