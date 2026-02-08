import { Button } from './ui/button';
import { FolderPlus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import CreateProjectDialog from './CreateProjectDialog';

interface EmptyStateProps {
  type: 'no-projects' | 'no-tasks';
}

export default function EmptyState({ type }: EmptyStateProps) {
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const content = {
    'no-projects': {
      icon: FolderPlus,
      title: 'No Projects Yet',
      description: 'Create your first project to start organizing your tasks and tracking your progress',
      image: '/assets/generated/empty-state-illustration.dim_400x300.png',
      action: (
        <Button onClick={() => setCreateProjectOpen(true)} size="lg" className="h-11">
          <FolderPlus className="mr-2 h-5 w-5" />
          Create Your First Project
        </Button>
      ),
    },
    'no-tasks': {
      icon: Sparkles,
      title: 'No Tasks',
      description: 'Add your first task to get started with your productivity journey',
      image: '/assets/generated/calendar-placeholder.dim_300x200.png',
      action: null,
    },
  };

  const { icon: Icon, title, description, image, action } = content[type];

  return (
    <>
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center space-y-8 max-w-md animate-in fade-in zoom-in">
          <img src={image} alt={title} className="mx-auto h-48 w-auto opacity-40" />
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50">
                <Icon className="h-8 w-8 text-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">{title}</h3>
              <p className="text-muted-foreground text-base">{description}</p>
            </div>
          </div>
          {action && <div className="pt-2">{action}</div>}
        </div>
      </div>

      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
      />
    </>
  );
}
