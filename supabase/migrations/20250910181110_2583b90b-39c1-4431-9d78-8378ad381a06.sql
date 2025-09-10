-- Create table for storing visitor analytics by state
CREATE TABLE public.visitor_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  state TEXT,
  city TEXT,
  country TEXT NOT NULL DEFAULT 'BR',
  page_path TEXT NOT NULL DEFAULT '/',
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin can view all analytics" 
ON public.visitor_analytics 
FOR SELECT 
USING (EXISTS ( 
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "System can insert analytics" 
ON public.visitor_analytics 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance on common queries
CREATE INDEX idx_visitor_analytics_state ON public.visitor_analytics(state);
CREATE INDEX idx_visitor_analytics_created_at ON public.visitor_analytics(created_at);
CREATE INDEX idx_visitor_analytics_page_path ON public.visitor_analytics(page_path);