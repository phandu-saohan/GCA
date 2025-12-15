
import { createClient } from '@supabase/supabase-js';

// ==========================================
// HƯỚNG DẪN SỬA LỖI UPLOAD ẢNH (QUAN TRỌNG)
// ==========================================
// Nếu bạn gặp lỗi khi upload, hãy Copy đoạn SQL dưới đây và chạy trong Supabase SQL Editor.
/*
-- 1. Cho phép Insert (Upload) cho user đã đăng nhập
DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
CREATE POLICY "Authenticated Insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'resources' );

-- 2. Cho phép Update (Sửa ảnh) cho user đã đăng nhập
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'resources' );

-- 3. Cho phép Delete (Xóa ảnh) cho user đã đăng nhập
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'resources' );

-- 4. Cho phép Public Select (Xem ảnh)
DROP POLICY IF EXISTS "Public Select" ON storage.objects;
CREATE POLICY "Public Select"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'resources' );

-- 5. Đảm bảo Bucket tồn tại và là Public
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO UPDATE SET public = true;
*/

// Ưu tiên đọc từ biến môi trường (Vercel), nếu không có thì dùng fallback (Local/Hardcoded)
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://ygajfbxxrbjlgvqrxxkn.supabase.co';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_KEY || 'sb_publishable_wQMez6jdRAotl3TIwEK7RA_HF3BJQmF';

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase URL or Key is missing. Please check your Environment Variables.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
