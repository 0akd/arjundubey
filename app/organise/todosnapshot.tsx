import { useEffect, useState } from 'react';
import supabase from '@/config/supabase';

export default function CounterSnapshot({ todoId }: { todoId: number }) {
  const [snapshots, setSnapshots] = useState<number[]>([]);

useEffect(() => {
  const fetchSnapshots = async () => {
    const { data, error } = await supabase
      .from('counter_snapshots')
      .select('snapshot_value, snap_at')
      .eq('todo_id', todoId)
      .order('snap_at', { ascending: false })
      .limit(7);

    if (error) {
      console.error("Snapshot fetch error", error);
    } else if (data) {
      setSnapshots(data.map(s => s.snapshot_value).reverse());
    }
  };

  fetchSnapshots();
}, [todoId]);


  if (snapshots.length === 0) return null;

  return (
    <div className="mt-1 text-xs text-gray-500">
      Last 7: {snapshots.join(', ')}
    </div>
  );
}
