-- ═══════════════════════════════════════════════
-- Storage bucket for document uploads
-- ═══════════════════════════════════════════════

-- Create the documents storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- Allow authenticated users to upload to their student's folder
CREATE POLICY "Users can upload documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] IN (
      SELECT student_id::text FROM student_access WHERE user_id = auth.uid()
    )
  );

-- Allow authenticated users to read their student's documents
CREATE POLICY "Users can read own documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] IN (
      SELECT student_id::text FROM student_access WHERE user_id = auth.uid()
    )
  );

-- Allow authenticated users to delete their student's documents
CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] IN (
      SELECT student_id::text FROM student_access WHERE user_id = auth.uid()
    )
  );
