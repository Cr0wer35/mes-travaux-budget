-- Create hierarchical budget system tables

-- Global budgets table
CREATE TABLE public.global_budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Room allocations table
CREATE TABLE public.room_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  global_budget_id UUID NOT NULL REFERENCES public.global_budgets(id) ON DELETE CASCADE,
  room TEXT NOT NULL,
  allocated_amount DECIMAL(10,2) NOT NULL CHECK (allocated_amount > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(global_budget_id, room)
);

-- Category allocations table
CREATE TABLE public.category_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_allocation_id UUID NOT NULL REFERENCES public.room_allocations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  allocated_amount DECIMAL(10,2) NOT NULL CHECK (allocated_amount > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_allocation_id, category)
);

-- Enable Row Level Security
ALTER TABLE public.global_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_allocations ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (no auth)
CREATE POLICY "Allow all operations on global_budgets" ON public.global_budgets FOR ALL USING (true);
CREATE POLICY "Allow all operations on room_allocations" ON public.room_allocations FOR ALL USING (true);
CREATE POLICY "Allow all operations on category_allocations" ON public.category_allocations FOR ALL USING (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_global_budgets_updated_at
  BEFORE UPDATE ON public.global_budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_room_allocations_updated_at
  BEFORE UPDATE ON public.room_allocations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_category_allocations_updated_at
  BEFORE UPDATE ON public.category_allocations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_room_allocations_global_budget_id ON public.room_allocations(global_budget_id);
CREATE INDEX idx_room_allocations_room ON public.room_allocations(room);
CREATE INDEX idx_category_allocations_room_allocation_id ON public.category_allocations(room_allocation_id);
CREATE INDEX idx_category_allocations_category ON public.category_allocations(category);
