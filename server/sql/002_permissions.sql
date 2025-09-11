-- Lista dostępnych uprawnień
CREATE TABLE IF NOT EXISTS permissions (
  key TEXT PRIMARY KEY,                 -- np. 'users:manage'
  description TEXT DEFAULT ''
);

-- Relacja user -> permission (wielu-do-wielu)
CREATE TABLE IF NOT EXISTS user_permissions (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  perm_key TEXT NOT NULL REFERENCES permissions(key) ON DELETE CASCADE,
  PRIMARY KEY (user_id, perm_key)
);

-- Startowe uprawnienia (dopisz własne według potrzeb)
INSERT INTO permissions(key, description) VALUES
  ('social:v1','Dostęp do SocialAutomationV1'),
  ('social:v2','Dostęp do SocialAutomationV2'),
  ('social:v3','Dostęp do SocialAutomationV3'),
  ('users:manage','Zarządzanie użytkownikami')
ON CONFLICT (key) DO NOTHING;