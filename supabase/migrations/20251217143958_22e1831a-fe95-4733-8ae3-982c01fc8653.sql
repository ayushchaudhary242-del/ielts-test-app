-- Create exam_results table to store user exam progress
CREATE TABLE public.exam_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  time_taken_seconds INTEGER NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

-- Users can only view their own results
CREATE POLICY "Users can view their own results"
ON public.exam_results
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own results
CREATE POLICY "Users can insert their own results"
ON public.exam_results
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own results
CREATE POLICY "Users can delete their own results"
ON public.exam_results
FOR DELETE
USING (auth.uid() = user_id);