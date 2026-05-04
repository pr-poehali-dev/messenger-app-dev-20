CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_color VARCHAR(20) DEFAULT '#a855f7',
  created_at TIMESTAMPTZ DEFAULT NOW()
)
