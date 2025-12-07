/*
  # Schema pentru platforma civică de raportare

  1. Tabele Noi
    - `user_profiles`
      - `id` (uuid, primary key, referință la auth.users)
      - `email` (text)
      - `full_name` (text, opțional)
      - `county` (text, opțional)
      - `show_real_name` (boolean, default false)
      - `is_admin` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `posts`
      - `id` (uuid, primary key)
      - `author_id` (uuid, referință la user_profiles)
      - `title` (text, opțional)
      - `body` (text, minim 30 caractere)
      - `hospital_name` (text, numele unității medicale)
      - `locality` (text, oraș/localitate)
      - `county` (text, județ)
      - `incident_date` (date, opțional)
      - `status` (text, enum: pending, approved, rejected)
      - `display_name` (text, numele afișat - real sau "Anonim")
      - `is_anonymous` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `attachments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, referință la posts)
      - `file_path` (text, calea în storage)
      - `file_name` (text)
      - `file_size` (integer)
      - `created_at` (timestamptz)
    
    - `replies`
      - `id` (uuid, primary key)
      - `post_id` (uuid, referință la posts)
      - `author_id` (uuid, referință la user_profiles)
      - `body` (text, max 500 caractere)
      - `display_name` (text)
      - `is_anonymous` (boolean)
      - `created_at` (timestamptz)

  2. Securitate
    - Enable RLS pe toate tabelele
    - Politici pentru citire, scriere și actualizare
    - Doar admin-ii pot aproba/respinge postări
*/

-- Extensii necesare
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabel user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  county text,
  show_real_name boolean DEFAULT false,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Tabel posts
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text,
  body text NOT NULL,
  hospital_name text NOT NULL,
  locality text NOT NULL,
  county text NOT NULL,
  incident_date date,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  display_name text NOT NULL,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Tabel attachments
CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Tabel replies
CREATE TABLE IF NOT EXISTS replies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  body text NOT NULL CHECK (length(body) <= 500),
  display_name text NOT NULL,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE replies ENABLE ROW LEVEL SECURITY;

-- Politici RLS pentru user_profiles
CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Politici RLS pentru posts
CREATE POLICY "Anyone can view approved posts"
  ON posts FOR SELECT
  USING (status = 'approved' OR author_id = auth.uid() OR EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own pending posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id AND status = 'pending')
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Admins can update any post"
  ON posts FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- Politici RLS pentru attachments
CREATE POLICY "Anyone can view attachments of approved posts"
  ON attachments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM posts WHERE posts.id = post_id AND (posts.status = 'approved' OR posts.author_id = auth.uid())
  ));

CREATE POLICY "Users can add attachments to own posts"
  ON attachments FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM posts WHERE posts.id = post_id AND posts.author_id = auth.uid()
  ));

-- Politici RLS pentru replies
CREATE POLICY "Anyone can view replies on approved posts"
  ON replies FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM posts WHERE posts.id = post_id AND posts.status = 'approved'
  ));

CREATE POLICY "Authenticated users can create replies"
  ON replies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Indexuri pentru performanță
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_county ON posts(county);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_replies_post_id ON replies(post_id);
CREATE INDEX IF NOT EXISTS idx_attachments_post_id ON attachments(post_id);

-- Funcție pentru actualizare automată a updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pentru user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pentru posts
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();