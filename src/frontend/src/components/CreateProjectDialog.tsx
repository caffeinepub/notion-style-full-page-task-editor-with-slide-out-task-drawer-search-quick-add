import { useState } from 'react';
import { useCreateProject } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Loader2, Flame, Zap, Target, Rocket, Star, Heart, Briefcase, Code, Palette } from 'lucide-react';
import { cn } from '../lib/utils';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ICON_OPTIONS = [
  { icon: '🔥', name: 'Fire', component: Flame },
  { icon: '⚡', name: 'Lightning', component: Zap },
  { icon: '🎯', name: 'Target', component: Target },
  { icon: '🚀', name: 'Rocket', component: Rocket },
  { icon: '⭐', name: 'Star', component: Star },
  { icon: '❤️', name: 'Heart', component: Heart },
  { icon: '💼', name: 'Briefcase', component: Briefcase },
  { icon: '💻', name: 'Code', component: Code },
  { icon: '🎨', name: 'Palette', component: Palette },
];

const COLOR_OPTIONS = [
  { value: '#007bff', name: 'Blue' },
  { value: '#28a745', name: 'Green' },
  { value: '#dc3545', name: 'Red' },
  { value: '#ffc107', name: 'Yellow' },
  { value: '#17a2b8', name: 'Cyan' },
  { value: '#6f42c1', name: 'Purple' },
  { value: '#fd7e14', name: 'Orange' },
  { value: '#e83e8c', name: 'Pink' },
];

export default function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const createProject = useCreateProject();
  const [projectName, setProjectName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🔥');
  const [selectedColor, setSelectedColor] = useState('#007bff');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      await createProject.mutateAsync({
        name: projectName.trim(),
        color: selectedColor,
        icon: selectedIcon,
      });
      setProjectName('');
      setSelectedIcon('🔥');
      setSelectedColor('#007bff');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground">Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2 w-full">
          <div className="space-y-2.5">
            <Label htmlFor="projectName" className="text-sm font-medium text-foreground">Project Name</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              required
              autoFocus
              className="h-11"
            />
          </div>

          <div className="space-y-2.5">
            <Label className="text-sm font-medium text-foreground">Icon</Label>
            <div className="grid grid-cols-9 gap-2">
              {ICON_OPTIONS.map((option) => (
                <button
                  key={option.icon}
                  type="button"
                  onClick={() => setSelectedIcon(option.icon)}
                  className={cn(
                    'flex items-center justify-center h-12 rounded-lg border-2 transition-all hover:scale-105',
                    selectedIcon === option.icon
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <span className="text-2xl">{option.icon}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <Label className="text-sm font-medium text-foreground">Color</Label>
            <div className="grid grid-cols-8 gap-2">
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedColor(option.value)}
                  className={cn(
                    'h-12 rounded-lg border-2 transition-all hover:scale-105',
                    selectedColor === option.value
                      ? 'border-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                      : 'border-border hover:border-foreground/50'
                  )}
                  style={{ backgroundColor: option.value }}
                  title={option.name}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg" style={{ backgroundColor: selectedColor }}>
              <span className="text-2xl">{selectedIcon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Preview</p>
              <p className="font-semibold text-foreground truncate">{projectName || 'Project Name'}</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11">
              Cancel
            </Button>
            <Button type="submit" disabled={!projectName.trim() || createProject.isPending} className="h-11">
              {createProject.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
