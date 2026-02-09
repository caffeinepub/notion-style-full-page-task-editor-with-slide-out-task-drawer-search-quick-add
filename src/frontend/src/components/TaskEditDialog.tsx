import { useState, useEffect } from 'react';
import { Task } from '../backend';
import { useUpdateTask, useUpdateTaskProject, useGetAllProjects } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CalendarIcon, Loader2, Flame, ListTodo } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface TaskEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}

export default function TaskEditDialog({ open, onOpenChange, task }: TaskEditDialogProps) {
  const updateTask = useUpdateTask();
  const updateTaskProject = useUpdateTaskProject();
  const { data: projects } = useGetAllProjects();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState<Date>(new Date(Number(task.dueDate) / 1000000));
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    task.projectId ? task.projectId.toString() : null
  );
  const [priority, setPriority] = useState<'forge' | 'queue'>((task.priority || 'queue') as 'forge' | 'queue');

  useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(new Date(Number(task.dueDate) / 1000000));
      setSelectedProjectId(task.projectId ? task.projectId.toString() : null);
      setPriority((task.priority || 'queue') as 'forge' | 'queue');
    }
  }, [open, task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      await updateTask.mutateAsync({
        taskId: task.id,
        title: title.trim(),
        description: description.trim() || null,
        dueDate: BigInt(dueDate.getTime() * 1000000),
        priority,
      });

      const originalProjectId = task.projectId ? task.projectId.toString() : null;
      if (selectedProjectId !== originalProjectId) {
        await updateTaskProject.mutateAsync({
          taskId: task.id,
          projectId: selectedProjectId ? BigInt(selectedProjectId) : null,
        });
      }

      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-card-foreground">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="bg-background text-foreground"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-card-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description (optional)"
              className="min-h-[100px] bg-background text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-card-foreground">Project</Label>
            <Select value={selectedProjectId || 'none'} onValueChange={(value) => setSelectedProjectId(value === 'none' ? null : value)}>
              <SelectTrigger className="bg-background text-foreground">
                <SelectValue placeholder="Select project (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No project</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id.toString()} value={project.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span>{project.icon}</span>
                      <span>{project.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-card-foreground">Priority</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={priority === 'forge' ? 'default' : 'outline'}
                className={cn(
                  'justify-start',
                  priority === 'forge' && 'bg-orange-500 hover:bg-orange-600 text-white'
                )}
                onClick={() => setPriority('forge')}
              >
                <Flame className="mr-2 h-4 w-4" />
                Forge
              </Button>
              <Button
                type="button"
                variant={priority === 'queue' ? 'default' : 'outline'}
                className={cn(
                  'justify-start',
                  priority === 'queue' && 'bg-blue-500 hover:bg-blue-600 text-white'
                )}
                onClick={() => setPriority('queue')}
              >
                <ListTodo className="mr-2 h-4 w-4" />
                Queue
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-card-foreground">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal bg-background text-foreground',
                    !dueDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => date && setDueDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateTask.isPending || updateTaskProject.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateTask.isPending || updateTaskProject.isPending}>
              {(updateTask.isPending || updateTaskProject.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
