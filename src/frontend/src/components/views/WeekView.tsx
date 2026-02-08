import { useState } from 'react';
import { startOfWeek, endOfWeek, addDays, format, isSameDay, isBefore } from 'date-fns';
import { useGetTasksByDateRange } from '../../hooks/useQueries';
import TaskCard from '../TaskCard';
import CreateTaskDialog from '../CreateTaskDialog';
import { Task } from '../../backend';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

interface WeekViewProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  onTaskSelect?: (taskId: bigint) => void;
}

export default function WeekView({ selectedDate, setSelectedDate, onTaskSelect }: WeekViewProps) {
  const start = startOfWeek(selectedDate);
  const end = endOfWeek(selectedDate);
  const { data: tasks, isLoading } = useGetTasksByDateRange(start, end);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  const getTasksForDay = (day: Date) => {
    if (!tasks) return [];
    const dayTasks = tasks.filter((task) => {
      const taskDate = new Date(Number(task.dueDate) / 1000000);
      return isSameDay(taskDate, day);
    });

    return dayTasks.sort((a, b) => {
      const priorityOrder = { forge: 0, queue: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 1;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 1;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return Number(a.dueDate - b.dueDate);
    });
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {weekDays.map((day) => {
            const dayTasks = getTasksForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`rounded-lg border bg-card p-4 ${isToday ? 'border-primary ring-2 ring-primary/20' : ''}`}
              >
                <div className="mb-3 pb-2 border-b">
                  <h3 className={`text-sm font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {format(day, 'EEE')}
                  </h3>
                  <p className="text-xs text-muted-foreground">{format(day, 'MMM d')}</p>
                </div>

                <div className="space-y-2">
                  {dayTasks.map((task: Task) => {
                    const taskDate = new Date(Number(task.dueDate) / 1000000);
                    const isOverdue = isBefore(taskDate, new Date()) && !task.completed;
                    return <TaskCard key={task.id.toString()} task={task} isOverdue={isOverdue} onTaskSelect={onTaskSelect} />;
                  })}
                  {dayTasks.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No tasks</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
