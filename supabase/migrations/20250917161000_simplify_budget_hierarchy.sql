-- 1. Drop existing hierarchical tables to replace them
-- We drop category_allocations first because it depends on room_allocations
DROP TABLE IF EXISTS public.category_allocations;
DROP TABLE IF EXISTS public.room_allocations;

-- 2. Create the new simplified category_allocations table
CREATE TABLE public.category_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  global_budget_id UUID NOT NULL REFERENCES public.global_budgets(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  allocated_amount DECIMAL(10,2) NOT NULL CHECK (allocated_amount > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(global_budget_id, category)
);

-- 3. Re-apply RLS policies and triggers
ALTER TABLE public.category_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on category_allocations" ON public.category_allocations FOR ALL USING (true);

CREATE TRIGGER update_category_allocations_updated_at
  BEFORE UPDATE ON public.category_allocations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Re-add indexes
CREATE INDEX idx_category_allocations_global_budget_id ON public.category_allocations(global_budget_id);
CREATE INDEX idx_category_allocations_category ON public.category_allocations(category);
