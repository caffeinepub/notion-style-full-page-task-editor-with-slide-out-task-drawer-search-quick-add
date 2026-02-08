import { useState } from 'react';
import { useGetAllProjects, useGetTasksByProject, useDeleteProject } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Trash2, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import CreateProjectDialog from './CreateProjectDialog';
import TaskCard from './TaskCard';
import { Task } from '../backend';
import { Badge } from './ui/badge';

interface ProjectsOverviewProps {
  onTaskSelect?: (taskId: bigint) => void;
}

export default function ProjectsOverview({ onTaskSelect }: ProjectsOverviewProps) {
  const { data: projects, isLoading: projectsLoading } = useGetAllProjects();
  const deleteProject = useDeleteProject();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const handleDeleteProject = (projectId: bigint, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project? All tasks will also be deleted.')) {
      deleteProject.mutate(projectId);
    }
  };

  if (projectsLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Loading projects...</p>
      </main>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-foreground mb-2">No Projects Yet</h2>
          <p className="text-muted-foreground mb-6">Create your first project to start organizing your tasks</p>
          <Button onClick={() => setCreateDialogOpen(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create Project
          </Button>
        </div>
        <CreateProjectDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="space-y-4">
          {projects.map((project) => {
            const isExpanded = expandedProjects.has(project.id.toString());
            return (
              <ProjectSection
                key={project.id.toString()}
                project={project}
                isExpanded={isExpanded}
                onToggle={() => toggleProject(project.id.toString())}
                onDelete={(e) => handleDeleteProject(project.id, e)}
                onTaskSelect={onTaskSelect}
              />
            );
          })}
        </div>
      </div>
      <CreateProjectDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </main>
  );
}

function ProjectSection({
  project,
  isExpanded,
  onToggle,
  onDelete,
  onTaskSelect,
}: {
  project: any;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onTaskSelect?: (taskId: bigint) => void;
}) {
  const { data: tasks } = useGetTasksByProject(project.id);

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
  const totalTasks = tasks?.length || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isExpanded ? <ChevronDown className="h-5 w-5 shrink-0 text-foreground" /> : <ChevronRight className="h-5 w-5 shrink-0 text-foreground" />}
          <span className="text-2xl shrink-0">{project.icon}</span>
          <div className="text-left min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-foreground truncate">{project.name}</h3>
            <div className="flex items-center gap-3 flex-wrap mt-1">
              <p className="text-sm text-muted-foreground">
                {incompleteTasks.length} active • {completedTasks.length} completed
              </p>
              <Badge variant="outline" className="text-xs">
                {completionRate}% complete
              </Badge>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="shrink-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </button>

      {isExpanded && (
        <div className="px-4 sm:px-6 py-4 border-t bg-muted/20 space-y-4">
          {incompleteTasks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Active Tasks</h4>
              {incompleteTasks.map((task: Task) => (
                <TaskCard key={task.id.toString()} task={task} onTaskSelect={onTaskSelect} />
              ))}
            </div>
          )}

          {completedTasks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Completed</h4>
              {completedTasks.map((task: Task) => (
                <TaskCard key={task.id.toString()} task={task} onTaskSelect={onTaskSelect} />
              ))}
            </div>
          )}

          {totalTasks === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No tasks in this project</p>
          )}
        </div>
      )}
    </div>
  );
}
