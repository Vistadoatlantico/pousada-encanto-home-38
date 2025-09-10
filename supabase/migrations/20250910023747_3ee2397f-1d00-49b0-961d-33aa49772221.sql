-- Create bucket for spa videos
INSERT INTO storage.buckets (id, name, public) VALUES ('spa-videos', 'spa-videos', true);

-- Create RLS policies for spa videos bucket
CREATE POLICY "Anyone can view spa videos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'spa-videos');

CREATE POLICY "Admin can upload spa videos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'spa-videos');

CREATE POLICY "Admin can update spa videos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'spa-videos');

CREATE POLICY "Admin can delete spa videos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'spa-videos');