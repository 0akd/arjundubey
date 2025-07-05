// types/types.ts
export interface Todo {
  id: number;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  created_at: string;
  user_email: string;
  is_counter?: boolean;
  counter_value?: number;
    is_timer: boolean; // ✅ new
    timer_value:number;
}

export interface CategoryData {
  name: string;
  icon: React.ReactNode;
  total: number;
  completed: number;
  percentage: number;
}
