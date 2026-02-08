import { useState } from 'react';
import { startOfDay, endOfDay, isBefore } from 'date-fns';
import { useGetTasksByDateRange } from '../../hooks/useQueries';
import TaskCard from '../TaskCard';
import CreateTaskDialog from '../CreateTaskDialog';
import { Task } from '../../backend';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

interface DayViewProps {
  selectedDate: Date;
  onTaskSelect?: (taskId: bigint) => void;
}

export default function DayView({ selectedDate, onTaskSelect }: DayViewProps) {
  const start = startOfDay(selectedDate);
  const end = endOfDay(selectedDate);
  const { data: tasks, isLoading } = useGetTasksByDateRange(start, end);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const sortedTasks = tasks
    ? [...tasks].sort((a, b) => {
        const priorityOrder = { forge: 0, queue: 1 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 1;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 1;
        if (aPriority !== bPriority) return aPriority - bPriority;
        return Number(a.dueDate - b.dueDate);
      })
    : [];

  const incompleteTasks = sortedTasks.filter((task) => !task.completed);
  const completedTasks = sortedTasks.filter((task) => task.completed);
  const overdueTasks = incompleteTasks.filter((task) => {
    const dueDate = new Date(Number(task.dueDate) / 1000000);
    return isBefore(dueDate, new Date()) && !task.completed;
  });
  const upcomingTasks = incompleteTasks.filter((task) => {
    const dueDate = new Date(Number(task.dueDate) / 1000000);
    return !isBefore(dueDate, new Date());
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
        {overdueTasks.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-destructive mb-3">Overdue</h2>
            <div className="space-y-3">
              {overdueTasks.map((task: Task) => (
                <TaskCard key={task.id.toString()} task={task} isOverdue onTaskSelect={onTaskSelect} />
              ))}
            </div>
          </section>
        )}

        {upcomingTasks.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Tasks</h2>
            <div className="space-y-3">
              {upcomingTasks.map((task: Task) => (
                <TaskCard key={task.id.toString()} task={task} onTaskSelect={onTaskSelect} />
              ))}
            </div>
          </section>
        )}

        {completedTasks.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-muted-foreground mb-3">Completed</h2>
            <div className="space-y-3">
              {completedTasks.map((task: Task) => (
                <TaskCard key={task.id.toString()} task={task} onTaskSelect={onTaskSelect} />
              ))}
            </div>
          </section>
        )}

        {tasks && tasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No tasks for this day</p>
            <Button onClick={() => setCreateDialogOpen(true)} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create Task
            </Button>
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-10">
        <Button onClick={() => setCreateDialogOpen(true)} size="lg" className="rounded-full shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <CreateTaskDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} initialDate={selectedDate} />
    </div>
  );
}
