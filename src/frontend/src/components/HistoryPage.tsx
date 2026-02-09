import { useState } from 'react';
import { useGetCompletedTasksHistory, useGetAllProjects } from '../hooks/useQueries';
import { Input } from './ui/input';
import { Search, Flame } from 'lucide-react';
import { Task } from '../backend';
import { format } from 'date-fns';
import { Badge } from './ui/badge';

interface HistoryPageProps {
  onTaskSelect?: (taskId: bigint) => void;
}

export default function HistoryPage({ onTaskSelect }: HistoryPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: tasks, isLoading } = useGetCompletedTasksHistory(searchTerm);
  const { data: projects } = useGetAllProjects();

  const sortedTasks = tasks
    ? [...tasks].sort((a, b) => {
        const priorityOrder = { forge: 0, queue: 1 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 1;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 1;
        if (aPriority !== bPriority) return aPriority - bPriority;

        const aCompletionDate = a.completionDate ? Number(a.completionDate) : 0;
        const bCompletionDate = b.completionDate ? Number(b.completionDate) : 0;
        return bCompletionDate - aCompletionDate;
      })
    : [];

  const getProjectForTask = (task: Task) => {
    if (!task.projectId) return null;
    return projects?.find((p) => p.id.toString() === task.projectId?.toString());
  };

  const handleTaskClick = (taskId: bigint) => {
    if (onTaskSelect) {
      onTaskSelect(taskId);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Completed Tasks</h1>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search completed tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-11"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading history...</p>
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? 'No completed tasks found matching your search' : 'No completed tasks yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map((task: Task) => {
              const project = getProjectForTask(task);
              const completionDate = task.completionDate
                ? new Date(Number(task.completionDate) / 1000000)
                : null;
              const priority = task.priority || 'queue';

              return (
                <button
                  key={task.id.toString()}
                  onClick={() => handleTaskClick(task.id)}
                  className="w-full text-left rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-medium text-foreground line-through flex-1">
                        {task.title}
                      </h3>
                      {priority === 'forge' && (
                        <Badge variant="outline" className="shrink-0 border-orange-500/50 text-orange-500">
                          <Flame className="mr-1 h-3 w-3" />
                          Forge
                        </Badge>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                    )}

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
                      {completionDate && (
                        <span className="text-xs text-muted-foreground">
                          Completed {format(completionDate, 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
