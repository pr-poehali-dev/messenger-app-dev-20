CREATE TABLE chats (
  id SERIAL PRIMARY KEY,
  is_group BOOLEAN DEFAULT FALSE,
  name VARCHAR(100),
  avatar_color VARCHAR(20) DEFAULT '#a855f7',
  description TEXT DEFAULT '',
  created_by INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_members (
  chat_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_admin BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  chat_id INT NOT NULL,
  sender_id INT,
  text TEXT NOT NULL,
  is_removed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE message_reactions (
  id SERIAL PRIMARY KEY,
  message_id INT NOT NULL,
  user_id INT NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(128) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_chat_members_user_id ON chat_members(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
