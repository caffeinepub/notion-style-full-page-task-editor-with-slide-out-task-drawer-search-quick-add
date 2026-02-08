import { ViewMode, AppSection } from '../App';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, LogOut, LayoutGrid, Calendar as CalendarIconNav, Flame, History, BarChart3, Menu } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { format, addDays, addWeeks, addMonths, startOfWeek, startOfMonth } from 'date-fns';
import { Avatar, AvatarFallback } from './ui/avatar';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  activeSection: AppSection;
  setActiveSection: (section: AppSection) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

export default function Header({
  viewMode,
  setViewMode,
  selectedDate,
  setSelectedDate,
  activeSection,
  setActiveSection,
  isDrawerOpen,
  setIsDrawerOpen,
}: HeaderProps) {
  const { clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const navigatePrevious = () => {
    if (viewMode === 'day') {
      setSelectedDate(addDays(selectedDate, -1));
    } else if (viewMode === 'week') {
      setSelectedDate(addWeeks(selectedDate, -1));
    } else {
      setSelectedDate(addMonths(selectedDate, -1));
    }
  };

  const navigateNext = () => {
    if (viewMode === 'day') {
      setSelectedDate(addDays(selectedDate, 1));
    } else if (viewMode === 'week') {
      setSelectedDate(addWeeks(selectedDate, 1));
    } else {
      setSelectedDate(addMonths(selectedDate, 1));
    }
  };

  const getDateDisplay = () => {
    if (viewMode === 'day') {
      return format(selectedDate, 'EEEE, MMMM d, yyyy');
    } else if (viewMode === 'week') {
      const start = startOfWeek(selectedDate);
      return format(start, 'MMM d') + ' - ' + format(addDays(start, 6), 'MMM d, yyyy');
    } else {
      return format(startOfMonth(selectedDate), 'MMMM yyyy');
    }
  };

  const getUserInitials = () => {
    if (!userProfile?.name) return 'U';
    return userProfile.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="shrink-0 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Top bar with drawer toggle, centered branding and user menu */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-foreground hover:text-primary"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
              <Flame className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold text-foreground">Impact Forge</h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground hover:text-primary">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-foreground">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userProfile?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">My Account</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-foreground hover:text-primary">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Section tabs */}
        {activeSection !== 'task' && (
          <div className="flex items-center gap-1 px-2 py-2 border-b bg-muted/30 overflow-x-auto">
            <Button
              variant={activeSection === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              className="h-9 text-foreground hover:text-primary whitespace-nowrap"
              onClick={() => setActiveSection('calendar')}
            >
              <CalendarIconNav className="mr-2 h-4 w-4" />
              Calendar
            </Button>
            <Button
              variant={activeSection === 'projects' ? 'default' : 'ghost'}
              size="sm"
              className="h-9 text-foreground hover:text-primary whitespace-nowrap"
              onClick={() => setActiveSection('projects')}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Projects
            </Button>
            <Button
              variant={activeSection === 'overview' ? 'default' : 'ghost'}
              size="sm"
              className="h-9 text-foreground hover:text-primary whitespace-nowrap"
              onClick={() => setActiveSection('overview')}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Overview
            </Button>
            <Button
              variant={activeSection === 'history' ? 'default' : 'ghost'}
              size="sm"
              className="h-9 text-foreground hover:text-primary whitespace-nowrap"
              onClick={() => setActiveSection('history')}
            >
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
          </div>
        )}

        {/* Date navigation (only for calendar view) */}
        {activeSection === 'calendar' && (
          <div className="px-4 py-3 space-y-3 border-b">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 text-foreground hover:text-primary" onClick={navigatePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center min-w-0">
                <p className="text-sm font-medium truncate text-foreground">{getDateDisplay()}</p>
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 text-foreground hover:text-primary" onClick={navigateNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="default" size="sm" className="h-9 shrink-0" onClick={() => setSelectedDate(new Date())}>
                Today
              </Button>
            </div>
            <div className="flex gap-2 rounded-lg border bg-muted/50 p-1">
              <Button
                variant={viewMode === 'day' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1 h-8 text-foreground hover:text-primary"
                onClick={() => setViewMode('day')}
              >
                Day
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1 h-8 text-foreground hover:text-primary"
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1 h-8 text-foreground hover:text-primary"
                onClick={() => setViewMode('month')}
              >
                Month
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center justify-between px-6 py-4 gap-6">
        {/* Left: Drawer toggle, Branding and section tabs */}
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-foreground hover:text-primary"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Impact Forge</h1>
          </div>

          {activeSection !== 'task' && (
            <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
              <Button
                variant={activeSection === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                className="h-9 text-foreground hover:text-primary"
                onClick={() => setActiveSection('calendar')}
              >
                <CalendarIconNav className="mr-2 h-4 w-4" />
                Calendar
              </Button>
              <Button
                variant={activeSection === 'projects' ? 'default' : 'ghost'}
                size="sm"
                className="h-9 text-foreground hover:text-primary"
                onClick={() => setActiveSection('projects')}
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                Projects
              </Button>
              <Button
                variant={activeSection === 'overview' ? 'default' : 'ghost'}
                size="sm"
                className="h-9 text-foreground hover:text-primary"
                onClick={() => setActiveSection('overview')}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Overview
              </Button>
              <Button
                variant={activeSection === 'history' ? 'default' : 'ghost'}
                size="sm"
                className="h-9 text-foreground hover:text-primary"
                onClick={() => setActiveSection('history')}
              >
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
            </div>
          )}
        </div>

        {/* Center: Date navigation (only for calendar view) */}
        {activeSection === 'calendar' && (
          <div className="flex items-center gap-3">
            <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
              <Button
                variant={viewMode === 'day' ? 'default' : 'ghost'}
                size="sm"
                className="h-9 text-foreground hover:text-primary"
                onClick={() => setViewMode('day')}
              >
                Day
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                className="h-9 text-foreground hover:text-primary"
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                className="h-9 text-foreground hover:text-primary"
                onClick={() => setViewMode('month')}
              >
                Month
              </Button>
            </div>

            <Button variant="outline" size="icon" className="h-9 w-9 text-foreground hover:text-primary" onClick={navigatePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[240px] text-center">
              <p className="text-sm font-medium text-foreground">{getDateDisplay()}</p>
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 text-foreground hover:text-primary" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="default" size="sm" className="h-9" onClick={() => setSelectedDate(new Date())}>
              Today
            </Button>
          </div>
        )}

        {/* Right: User menu */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2 text-foreground hover:text-primary">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{userProfile?.name || 'User'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-foreground">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-foreground hover:text-primary">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
