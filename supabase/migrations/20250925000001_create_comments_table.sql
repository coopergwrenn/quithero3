-- Create post_comments table with proper structure
CREATE TABLE IF NOT EXISTS public.post_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    post_id uuid NOT NULL,
    parent_comment_id uuid,
    content text NOT NULL,
    anonymous_name text NOT NULL,
    streak_days integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraints
DO $$
BEGIN
    -- Add post_id foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_post_comments_post_id'
    ) THEN
        ALTER TABLE public.post_comments 
        ADD CONSTRAINT fk_post_comments_post_id 
        FOREIGN KEY (post_id) REFERENCES public.community_posts(id) ON DELETE CASCADE;
    END IF;
    
    -- Add parent_comment_id foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_post_comments_parent_id'
    ) THEN
        ALTER TABLE public.post_comments 
        ADD CONSTRAINT fk_post_comments_parent_id 
        FOREIGN KEY (parent_comment_id) REFERENCES public.post_comments(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Anyone can read comments" ON public.post_comments;
    DROP POLICY IF EXISTS "Anyone can create comments" ON public.post_comments;
    DROP POLICY IF EXISTS "Users can update own comments" ON public.post_comments;
    DROP POLICY IF EXISTS "Users can delete own comments" ON public.post_comments;
    
    -- Create new policies
    CREATE POLICY "Anyone can read comments"
        ON public.post_comments
        FOR SELECT
        USING (true);

    CREATE POLICY "Anyone can create comments"
        ON public.post_comments
        FOR INSERT
        WITH CHECK (true);

    CREATE POLICY "Users can update own comments"
        ON public.post_comments
        FOR UPDATE
        USING (auth.uid() = user_id OR user_id IS NULL);

    CREATE POLICY "Users can delete own comments"
        ON public.post_comments
        FOR DELETE
        USING (auth.uid() = user_id OR user_id IS NULL);
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON public.post_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON public.post_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);

-- Add comments_count column to community_posts
ALTER TABLE public.community_posts 
ADD COLUMN IF NOT EXISTS comments_count integer DEFAULT 0;

-- Create function to update comment counts
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.community_posts 
        SET comments_count = comments_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.community_posts 
        SET comments_count = GREATEST(comments_count - 1, 0) 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_post_comments_count_trigger ON public.post_comments;
CREATE TRIGGER update_post_comments_count_trigger
    AFTER INSERT OR DELETE ON public.post_comments
    FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();
