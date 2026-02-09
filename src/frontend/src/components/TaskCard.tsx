import { useState } from 'react';
import { Task } from '../backend';
import { useToggleTaskCompletion, useDeleteTask, useGetAllProjects } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Trash2, GripVertical, Calendar as CalendarIcon, Flame, ListTodo, Edit } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import TaskEditDialog from './TaskEditDialog';
import { Badge } from './ui/badge';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  dragHandleProps?: any;
  isOverdue?: boolean;
  onTaskSelect?: (taskId: bigint) => void;
}

export default function TaskCard({ task, isDragging, dragHandleProps, isOverdue, onTaskSelect }: TaskCardProps) {
  const toggleCompletion = useToggleTaskCompletion();
  const deleteTask = useDeleteTask();
  const { data: projects } = useGetAllProjects();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleToggle = () => {
    toggleCompletion.mutate(task.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask.mutate(task.id);
  };

  const handleCardClick = () => {
    if (onTaskSelect) {
      onTaskSelect(task.id);
    }
  };

  const handleQuickEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditDialogOpen(true);
  };

  const dueDate = new Date(Number(task.dueDate) / 1000000);
  const project = task.projectId ? projects?.find((p) => p.id.toString() === task.projectId?.toString()) : null;
  const priority = task.priority || 'queue';

  return (
    <>
      <div
        className={cn(
          'group relative rounded-lg border bg-card p-3 sm:p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30 touch-manipulation cursor-pointer',
          isDragging && 'opacity-50 rotate-1 scale-95',
          task.completed && 'opacity-70 bg-muted/30',
          isOverdue && !task.completed && 'border-destructive/50 bg-destructive/5'
        )}
        onClick={handleCardClick}
      >
        <div className="flex items-start gap-3">
          <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing pt-1.5 hidden sm:block transition-opacity text-foreground">
            <GripVertical className="h-4 w-4" />
          </div>

          <Checkbox
            checked={task.completed}
            onCheckedChange={handleToggle}
            onClick={(e) => e.stopPropagation()}
            className="mt-1.5 shrink-0 h-5 w-5"
          />

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={cn(
                  'text-sm sm:text-base font-medium text-foreground break-words',
                  task.completed && 'line-through text-muted-foreground'
                )}
              >
                {task.title}
              </h3>
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-foreground hover:text-primary"
                  onClick={handleQuickEdit}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {task.description && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 break-words">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
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

              {priority === 'forge' && (
                <Badge variant="outline" className="text-xs border-orange-500/50 text-orange-500">
                  <Flame className="mr-1 h-3 w-3" />
                  Forge
                </Badge>
              )}

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarIcon className="h-3 w-3" />
                <span>{format(dueDate, 'MMM d')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TaskEditDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} task={task} />
    </>
  );
}
