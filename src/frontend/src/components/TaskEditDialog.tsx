import { useState, useEffect } from 'react';
import { Task } from '../backend';
import { useUpdateTask, useGetAllProjects } from '../hooks/useQueries';
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
  const { data: projects } = useGetAllProjects();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState<Date>(new Date(Number(task.dueDate) / 1000000));
  const [selectedProjectId, setSelectedProjectId] = useState<string>(task.projectId.toString());
  const [priority, setPriority] = useState<'forge' | 'queue'>((task.priority || 'queue') as 'forge' | 'queue');

  useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(new Date(Number(task.dueDate) / 1000000));
      setSelectedProjectId(task.projectId.toString());
      setPriority((task.priority || 'queue') as 'forge' | 'queue');
    }
  }, [open, task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && selectedProjectId) {
      await updateTask.mutateAsync({
        taskId: task.id,
        title: title.trim(),
        description: description.trim() || null,
        dueDate: BigInt(dueDate.getTime() * 1000000),
        priority,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground">Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-2.5">
            <Label htmlFor="title" className="text-sm font-medium text-foreground">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this task..."
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="project" className="text-sm font-medium text-foreground">Project</Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger id="project" className="h-11">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.id.toString()} value={project.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span style={{ color: project.color }}>{project.icon}</span>
                      <span>{project.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="priority" className="text-sm font-medium text-foreground">Priority</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as 'forge' | 'queue')}>
              <SelectTrigger id="priority" className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="forge">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span>Forge (High Priority)</span>
                  </div>
                </SelectItem>
                <SelectItem value="queue">
                  <div className="flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-blue-500" />
                    <span>Queue (Normal Priority)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2.5">
            <Label className="text-sm font-medium text-foreground">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn('w-full justify-start text-left font-normal h-11 text-foreground')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dueDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dueDate} onSelect={(date) => date && setDueDate(date)} />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11">
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || !selectedProjectId || updateTask.isPending} className="h-11">
              {updateTask.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
