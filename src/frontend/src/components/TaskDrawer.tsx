import { useState } from 'react';
import { Sheet, SheetContent } from './ui/sheet';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Search, Plus, Flame, ListTodo, Calendar as CalendarIcon } from 'lucide-react';
import { useGetTasksByCompletionStatus, useCreateTask, useGetAllProjects } from '../hooks/useQueries';
import { Task } from '../backend';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface TaskDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskSelect: (taskId: bigint) => void;
}

export default function TaskDrawer({ isOpen, onOpenChange, onTaskSelect }: TaskDrawerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [quickAddValue, setQuickAddValue] = useState('');
  const { data: tasks, isLoading } = useGetTasksByCompletionStatus(false);
  const { data: projects } = useGetAllProjects();
  const createTask = useCreateTask();

  const filteredTasks = tasks?.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddValue.trim() || !projects || projects.length === 0) return;

    const defaultProject = projects[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    await createTask.mutateAsync({
      title: quickAddValue.trim(),
      description: null,
      dueDate: BigInt(tomorrow.getTime() * 1000000),
      projectId: defaultProject.id,
      priority: 'queue',
    });

    setQuickAddValue('');
  };

  const handleTaskClick = (taskId: bigint) => {
    onTaskSelect(taskId);
  };

  const getProjectForTask = (task: Task) => {
    return projects?.find((p) => p.id.toString() === task.projectId.toString());
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[90vw] sm:w-[400px] p-0 flex flex-col gap-0 bg-background border-r border-border">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-card">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Tasks</h2>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-background text-foreground"
            />
          </div>
        </div>

        {/* Quick Add */}
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <form onSubmit={handleQuickAdd} className="flex gap-2">
            <Input
              placeholder="Quick add task (press Enter)"
              value={quickAddValue}
              onChange={(e) => setQuickAddValue(e.target.value)}
              className="h-10 flex-1 bg-background text-foreground"
            />
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 shrink-0"
              disabled={!quickAddValue.trim() || createTask.isPending}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to quickly create tasks
          </p>
        </div>

        {/* Task List */}
        <ScrollArea className="flex-1 bg-background">
          <div className="px-6 py-4 space-y-2">
            {isLoading ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                Loading tasks...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                {searchTerm ? 'No tasks found' : 'No active tasks'}
              </div>
            ) : (
              filteredTasks.map((task) => {
                const project = getProjectForTask(task);
                const dueDate = new Date(Number(task.dueDate) / 1000000);
                const isOverdue = dueDate < new Date() && !task.completed;
                const priority = task.priority || 'queue';

                return (
                  <button
                    key={task.id.toString()}
                    onClick={() => handleTaskClick(task.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors group',
                      isOverdue && 'border-destructive/50 bg-destructive/10'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {priority === 'forge' ? (
                        <Flame className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                      ) : (
                        <ListTodo className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground line-clamp-2 mb-1">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {project && (
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: project.color,
                                color: project.color,
                              }}
                            >
                              <span className="mr-1">{project.icon}</span>
                              {project.name}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {format(dueDate, 'MMM d')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
