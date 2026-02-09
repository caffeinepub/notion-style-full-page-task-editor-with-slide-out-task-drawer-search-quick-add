import { useState, useEffect } from 'react';
import { ProjectId } from '../backend';
import { useCreateTask, useGetAllProjects } from '../hooks/useQueries';
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

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: Date;
}

export default function CreateTaskDialog({ open, onOpenChange, initialDate }: CreateTaskDialogProps) {
  const createTask = useCreateTask();
  const { data: projects } = useGetAllProjects();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>(initialDate || new Date());
  const [selectedProjectId, setSelectedProjectId] = useState<string>('unassigned');
  const [priority, setPriority] = useState<'forge' | 'queue'>('queue');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setDueDate(initialDate || new Date());
      setSelectedProjectId('unassigned');
      setPriority('queue');
    }
  }, [open, initialDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      await createTask.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        dueDate: BigInt(dueDate.getTime() * 1000000),
        projectId: selectedProjectId === 'unassigned' ? null : BigInt(selectedProjectId),
        priority,
      });
      setTitle('');
      setDescription('');
      setDueDate(initialDate || new Date());
      setSelectedProjectId('unassigned');
      setPriority('queue');
      onOpenChange(false);
    }
  };

  const selectedProject = selectedProjectId !== 'unassigned' 
    ? projects?.find(p => p.id.toString() === selectedProjectId)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground">Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2 w-full">
          <div className="space-y-2.5">
            <Label htmlFor="title" className="text-sm font-medium text-foreground">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
              autoFocus
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
                <SelectItem value="unassigned">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">No project</span>
                  </div>
                </SelectItem>
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
                  className={cn('w-full justify-start text-left font-normal h-12 text-base text-foreground hover:bg-accent')}
                >
                  <CalendarIcon className="mr-3 h-5 w-5" />
                  {format(dueDate, 'EEEE, MMMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar 
                  mode="single" 
                  selected={dueDate} 
                  onSelect={(date) => date && setDueDate(date)}
                  className="rounded-lg border-0"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center px-1",
                    caption_label: "text-base font-semibold text-foreground",
                    nav: "space-x-1 flex items-center",
                    nav_button: cn(
                      "h-9 w-9 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-accent rounded-md transition-colors"
                    ),
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-muted-foreground rounded-md w-11 font-semibold text-sm",
                    row: "flex w-full mt-2",
                    cell: cn(
                      "relative p-0 text-center text-base focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
                      "h-11 w-11"
                    ),
                    day: cn(
                      "h-11 w-11 p-0 font-medium text-base aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                    ),
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground font-bold",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11">
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || createTask.isPending} className="h-11">
              {createTask.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
