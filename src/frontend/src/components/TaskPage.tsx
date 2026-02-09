import { useState, useEffect } from 'react';
import { useGetTask, useUpdateTask, useUpdateTaskContent, useGetAllProjects, useUpdateTaskProject } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Loader2, Save, Calendar as CalendarIcon, Flame, ListTodo, FolderOpen } from 'lucide-react';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import LongFormTaskEditor from './LongFormTaskEditor';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface TaskPageProps {
  taskId: bigint;
  onClose: () => void;
}

export default function TaskPage({ taskId, onClose }: TaskPageProps) {
  const { data: task, isLoading, error } = useGetTask(taskId);
  const { data: projects } = useGetAllProjects();
  const updateTask = useUpdateTask();
  const updateContent = useUpdateTaskContent();
  const updateTaskProject = useUpdateTaskProject();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [priority, setPriority] = useState<'forge' | 'queue'>('queue');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('unassigned');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setContent(task.longFormContent || '');
      setDueDate(new Date(Number(task.dueDate) / 1000000));
      setPriority((task.priority || 'queue') as 'forge' | 'queue');
      setSelectedProjectId(task.projectId ? task.projectId.toString() : 'unassigned');
      setHasUnsavedChanges(false);
    }
  }, [task]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setHasUnsavedChanges(true);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleProjectChange = async (newProjectId: string) => {
    if (!task) return;
    
    setSelectedProjectId(newProjectId);
    
    try {
      await updateTaskProject.mutateAsync({
        taskId: task.id,
        projectId: newProjectId === 'unassigned' ? null : BigInt(newProjectId),
      });
      toast.success('Project updated successfully');
    } catch (error: any) {
      console.error('Failed to update project:', error);
      toast.error(error.message || 'Failed to update project');
      // Revert on error
      setSelectedProjectId(task.projectId ? task.projectId.toString() : 'unassigned');
    }
  };

  const handleSave = async () => {
    if (!task) return;

    try {
      await updateTask.mutateAsync({
        taskId: task.id,
        title: title.trim() || task.title,
        description: task.description ?? null,
        dueDate: BigInt(dueDate.getTime() * 1000000),
        priority,
      });

      await updateContent.mutateAsync({
        taskId: task.id,
        content: content,
      });

      setHasUnsavedChanges(false);
      toast.success('Task saved successfully');
    } catch (error) {
      console.error('Failed to save task:', error);
      toast.error('Failed to save task');
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading task...</p>
        </div>
      </main>
    );
  }

  if (error || !task) {
    return (
      <main className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-sm text-destructive mb-4">Failed to load task</p>
          <Button onClick={onClose} variant="outline">
            Go Back
          </Button>
        </div>
      </main>
    );
  }

  const project = selectedProjectId !== 'unassigned' 
    ? projects?.find((p) => p.id.toString() === selectedProjectId)
    : null;
  const isSaving = updateTask.isPending || updateContent.isPending;

  return (
    <main className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <div className="shrink-0 border-b border-border bg-card px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 shrink-0 text-card-foreground hover:text-primary"
          >
            <X className="h-5 w-5" />
          </Button>
          {project && (
            <Badge
              variant="outline"
              className="shrink-0"
              style={{
                borderColor: project.color,
                color: project.color,
              }}
            >
              <span className="mr-1.5">{project.icon}</span>
              {project.name}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasUnsavedChanges && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Unsaved changes
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            size="sm"
            className="h-9"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Title */}
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Task title"
            className="text-3xl font-bold border-0 px-0 mb-6 h-auto py-2 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          {/* Metadata Controls */}
          <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-border">
            {/* Project Selector */}
            <Select
              value={selectedProjectId}
              onValueChange={handleProjectChange}
              disabled={updateTaskProject.isPending}
            >
              <SelectTrigger className="h-9 w-auto min-w-[160px] bg-background text-foreground hover:bg-accent">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    {project ? (
                      <>
                        <span style={{ color: project.color }}>{project.icon}</span>
                        <span>{project.name}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">No project</span>
                    )}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="unassigned" className="text-popover-foreground hover:bg-accent">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">No project</span>
                  </div>
                </SelectItem>
                {projects?.map((proj) => (
                  <SelectItem 
                    key={proj.id.toString()} 
                    value={proj.id.toString()}
                    className="text-popover-foreground hover:bg-accent"
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ color: proj.color }}>{proj.icon}</span>
                      <span>{proj.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Due Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-9 gap-2 bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
                    !dueDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {dueDate ? format(dueDate, 'MMM d, yyyy') : 'Set due date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    if (date) {
                      setDueDate(date);
                      setHasUnsavedChanges(true);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Priority */}
            <Select
              value={priority}
              onValueChange={(value: 'forge' | 'queue') => {
                setPriority(value);
                setHasUnsavedChanges(true);
              }}
            >
              <SelectTrigger className="h-9 w-[140px] bg-background text-foreground hover:bg-accent">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {priority === 'forge' ? (
                      <>
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span>Forge</span>
                      </>
                    ) : (
                      <>
                        <ListTodo className="h-4 w-4 text-blue-500" />
                        <span>Queue</span>
                      </>
                    )}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="forge" className="text-popover-foreground hover:bg-accent">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span>Forge</span>
                  </div>
                </SelectItem>
                <SelectItem value="queue" className="text-popover-foreground hover:bg-accent">
                  <div className="flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-blue-500" />
                    <span>Queue</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Long-form Editor */}
          <div className="bg-background">
            <LongFormTaskEditor
              value={content}
              onChange={handleContentChange}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
