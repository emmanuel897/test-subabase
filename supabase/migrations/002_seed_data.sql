-- Migration 002 : Données de test
-- Optionnel : données initiales pour tester le projet

-- Insérer des profils de test
INSERT INTO profiles (name, email, age) VALUES
  ('Alice Dupont', 'alice@example.com', 28),
  ('Bob Martin', 'bob@example.com', 34),
  ('Claire Bernard', 'claire@example.com', 22)
ON CONFLICT (email) DO NOTHING;

-- Insérer des tags
INSERT INTO tags (name) VALUES
  ('javascript'),
  ('supabase'),
  ('postgresql'),
  ('tutorial'),
  ('backend')
ON CONFLICT (name) DO NOTHING;

-- Insérer des articles (les UUIDs des auteurs seront récupérés dynamiquement)
INSERT INTO posts (title, content, author_id, published)
SELECT
  'Introduction à Supabase',
  'Supabase est une alternative open-source à Firebase basée sur PostgreSQL.',
  id,
  true
FROM profiles WHERE email = 'alice@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO posts (title, content, author_id, published)
SELECT
  'CRUD avec Supabase et JavaScript',
  'Dans ce tutoriel, nous allons voir comment effectuer des opérations CRUD avec Supabase.',
  id,
  true
FROM profiles WHERE email = 'bob@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO posts (title, content, author_id, published)
SELECT
  'Brouillon : Auth avec Supabase',
  'Article en cours de rédaction sur l''authentification...',
  id,
  false
FROM profiles WHERE email = 'claire@example.com'
ON CONFLICT DO NOTHING;
