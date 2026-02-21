/*
  # Add Gallery Management and YouTube Embed Support

  1. Updates
    - Add `youtube_url` column to `blog_posts`
    - Create `gallery_images` table for website gallery records
    - Add public read policy for published blog posts

  2. Storage
    - Create `gallery-images` storage bucket
    - Add storage policies for public read and content-manager writes

  3. Security
    - Enable RLS for gallery table
    - Allow only approved super_admin/admin/manager/blogger users to manage gallery images
*/

ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS youtube_url text;

CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  image_path text NOT NULL,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gallery_images_status ON gallery_images(status);
CREATE INDEX IF NOT EXISTS idx_gallery_images_created_at ON gallery_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_images_author_id ON gallery_images(author_id);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active gallery images" ON gallery_images;
CREATE POLICY "Anyone can read active gallery images"
  ON gallery_images
  FOR SELECT
  TO public
  USING (status = 'active');

DROP POLICY IF EXISTS "Content managers can read all gallery images" ON gallery_images;
CREATE POLICY "Content managers can read all gallery images"
  ON gallery_images
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'manager', 'blogger')
      AND status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Content managers can insert gallery images" ON gallery_images;
CREATE POLICY "Content managers can insert gallery images"
  ON gallery_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'manager', 'blogger')
      AND status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Content managers can update gallery images" ON gallery_images;
CREATE POLICY "Content managers can update gallery images"
  ON gallery_images
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'manager', 'blogger')
      AND status = 'approved'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'manager', 'blogger')
      AND status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Content managers can delete gallery images" ON gallery_images;
CREATE POLICY "Content managers can delete gallery images"
  ON gallery_images
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'manager', 'blogger')
      AND status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Anyone can read published posts publicly" ON blog_posts;
CREATE POLICY "Anyone can read published posts publicly"
  ON blog_posts
  FOR SELECT
  TO public
  USING (status = 'published');

INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view gallery storage objects" ON storage.objects;
CREATE POLICY "Public can view gallery storage objects"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Content managers can upload gallery storage objects" ON storage.objects;
CREATE POLICY "Content managers can upload gallery storage objects"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'gallery-images'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'manager', 'blogger')
      AND status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Content managers can update gallery storage objects" ON storage.objects;
CREATE POLICY "Content managers can update gallery storage objects"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'gallery-images'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'manager', 'blogger')
      AND status = 'approved'
    )
  )
  WITH CHECK (
    bucket_id = 'gallery-images'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'manager', 'blogger')
      AND status = 'approved'
    )
  );

DROP POLICY IF EXISTS "Content managers can delete gallery storage objects" ON storage.objects;
CREATE POLICY "Content managers can delete gallery storage objects"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'gallery-images'
    AND EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'manager', 'blogger')
      AND status = 'approved'
    )
  );

DROP TRIGGER IF EXISTS update_gallery_images_updated_at ON gallery_images;
CREATE TRIGGER update_gallery_images_updated_at
  BEFORE UPDATE ON gallery_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
