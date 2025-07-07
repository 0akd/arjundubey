"use client"
// components/TodoReport.tsx
import React, { useEffect, useState } from 'react';
import supabase from '@/config/supabase';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  category: string;
  is_counter: boolean;
  is_timer: boolean;
  is_website: boolean;
  counter_value?: number;
  timer_value?: number;
  link:string
}

interface Snapshot {
  todo_id: number;
  snapshot_value: number;
  snap_at: string;
}

interface CategoryStats {
  name: string;
  completion: number;
  todos: Todo[];
}

export default function TodoReport() {
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [snapshots, setSnapshots] = useState<Record<number, Snapshot[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      const { data: todos, error: todoError } = await supabase
        .from('todos')
        .select('*');

      if (todoError) {
        console.error('Error fetching todos:', todoError);
        return;
      }

      const grouped = new Map<string, Todo[]>();
      todos.forEach((todo: Todo) => {
        if (!grouped.has(todo.category)) grouped.set(todo.category, []);
        grouped.get(todo.category)?.push(todo);
      });

      const categoryStats: CategoryStats[] = Array.from(grouped.entries()).map(
        ([name, todos]) => {
          const completed = todos.filter(t => t.completed).length;
          const completion = todos.length ? (completed / todos.length) * 100 : 0;
          return { name, completion, todos };
        }
      );

      setCategories(categoryStats);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchSnapshots = async () => {
      if (!selectedCategory) return;

      const todoIds = categories
        .find(cat => cat.name === selectedCategory)?.todos
        .map(t => t.id) ?? [];

      if (todoIds.length === 0) return;

      const { data, error } = await supabase
        .from('counter_snapshots')
        .select('todo_id, snapshot_value, snap_at')
        .in('todo_id', todoIds)
        .gte('snap_at', new Date(Date.now() - 7 * 86400000).toISOString());

      if (error) {
        console.error('Error loading snapshots:', error);
        return;
      }

      const snapMap: Record<number, Snapshot[]> = {};
      data.forEach((snap: Snapshot) => {
        if (!snapMap[snap.todo_id]) snapMap[snap.todo_id] = [];
        snapMap[snap.todo_id].push(snap);
      });

      setSnapshots(snapMap);
    };

    fetchSnapshots();
  }, [selectedCategory, categories]);

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">Todo Category Report</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className="cursor-pointer border rounded-lg p-4 shadow hover:shadow-lg transition-all"
          >
            <h3 className="text-lg font-semibold">{cat.name}</h3>
            <p className="text-sm text-gray-600">
              Completion: {cat.completion.toFixed(0)}%
            </p>
          </div>
        ))}
      </div>

      {selectedCategory && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">
            Todos in “{selectedCategory}”
          </h3>
          <div className="space-y-4">
            {categories
              .find(cat => cat.name === selectedCategory)?.todos
              .map(todo => (
                <div key={todo.id} className="border p-4 rounded-lg shadow">
                  <h4 className="font-medium text-lg">{todo.title}</h4>
                  <p className="text-sm text-gray-600">
                    Status: {todo.completed ? 'Completed' : 'Pending'}
                  </p>
                  {todo.is_counter && (
                    <div className="mt-2 text-sm">
                      <p>Current Counter: {todo.counter_value ?? 0}</p>
                      {snapshots[todo.id]?.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {snapshots[todo.id].map(snap => (
                            <p
                              key={snap.snap_at}
                              className="text-xs text-gray-500 font-mono"
                            >
                              {new Date(snap.snap_at).toLocaleDateString()}:
                              {' '}{snap.snapshot_value}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {todo.is_timer && (
                    <p className="mt-2 text-sm font-mono">
                      Timer: {new Date((todo.timer_value ?? 0) * 1000).toISOString().substr(11, 8)}
                    </p>
                  )}
                  {todo.is_website && (
                    <p className="mt-2 text-sm text-blue-600 underline break-words">
                      Link: {todo.link}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
