import { useState } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameDay, isSameMonth, isBefore } from 'date-fns';
import { useGetTasksByDateRange } from '../../hooks/useQueries';
import { cn } from '../../lib/utils';
import { Task } from '../../backend';
import { Flame, ListTodo, Plus } from 'lucide-react';
import CreateTaskDialog from '../CreateTaskDialog';
import { ViewMode } from '../../App';
import { Button } from '../ui/button';

interface MonthViewProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: ViewMode) => void;
  onTaskSelect?: (taskId: bigint) => void;
}

export default function MonthView({ selectedDate, setSelectedDate, setViewMode, onTaskSelect }: MonthViewProps) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const { data: tasks, isLoading } = useGetTasksByDateRange(calendarStart, calendarEnd);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

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

  const handleDayClick = (day: Date, dayTasks: Task[]) => {
    if (dayTasks.length > 0 && onTaskSelect) {
      onTaskSelect(dayTasks[0].id);
    } else {
      setSelectedDate(day);
      setViewMode('day');
    }
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
      <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24">
        <div className="grid grid-cols-7 gap-2 sm:gap-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
            <div key={dayName} className="text-center text-xs sm:text-sm font-semibold text-muted-foreground py-2">
              {dayName}
            </div>
          ))}

          {days.map((day) => {
            const dayTasks = getTasksForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, selectedDate);
            const hasOverdue = dayTasks.some((task) => {
              const taskDate = new Date(Number(task.dueDate) / 1000000);
              return isBefore(taskDate, new Date()) && !task.completed;
            });

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDayClick(day, dayTasks)}
                className={cn(
                  'min-h-[80px] sm:min-h-[120px] p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left',
                  !isCurrentMonth && 'opacity-40',
                  isToday && 'border-primary ring-2 ring-primary/20',
                  hasOverdue && 'border-destructive/50'
                )}
              >
                <div className="text-xs sm:text-sm font-medium text-foreground mb-1">{format(day, 'd')}</div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task: Task) => {
                    const priority = task.priority || 'queue';
                    return (
                      <div
                        key={task.id.toString()}
                        className={cn(
                          'text-xs p-1 rounded truncate flex items-center gap-1',
                          task.completed ? 'bg-muted/50 text-muted-foreground line-through' : 'bg-primary/10 text-foreground'
                        )}
                      >
                        {priority === 'forge' ? (
                          <Flame className="h-2.5 w-2.5 text-orange-500 shrink-0" />
                        ) : (
                          <ListTodo className="h-2.5 w-2.5 text-blue-500 shrink-0" />
                        )}
                        <span className="truncate">{task.title}</span>
                      </div>
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-muted-foreground">+{dayTasks.length - 3} more</div>
                  )}
                </div>
              </button>
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
