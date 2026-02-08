import { useMemo } from 'react';
import { useGetOverviewData, useGetAllProjects } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { BarChart3, TrendingUp, Calendar, CheckCircle2, AlertCircle, Target, Flame, FolderOpen, Clock, Award } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';

export default function OverviewPage() {
  const { data: overviewData, isLoading } = useGetOverviewData();
  const { data: projects } = useGetAllProjects();

  const mostActiveProjectName = useMemo(() => {
    if (!overviewData?.productivityInsights.mostActiveProject || !projects) return 'N/A';
    const project = projects.find(p => p.id === overviewData.productivityInsights.mostActiveProject);
    return project ? project.name : 'N/A';
  }, [overviewData, projects]);

  const mostActiveProject = useMemo(() => {
    if (!overviewData?.productivityInsights.mostActiveProject || !projects) return null;
    return projects.find(p => p.id === overviewData.productivityInsights.mostActiveProject);
  }, [overviewData, projects]);

  const mostProductiveDayFormatted = useMemo(() => {
    if (!overviewData?.productivityInsights.mostProductiveDay) return 'N/A';
    const date = new Date(Number(overviewData.productivityInsights.mostProductiveDay) / 1000000);
    return format(date, 'EEEE, MMMM d, yyyy');
  }, [overviewData]);

  const totalCompletedTasks = useMemo(() => {
    if (!overviewData) return 0;
    return Number(overviewData.yearlyStats.completedTasks);
  }, [overviewData]);

  const totalOverdueTasks = useMemo(() => {
    if (!overviewData) return 0;
    return overviewData.projectStats.reduce((sum, stat) => sum + Number(stat.overdueTasks), 0);
  }, [overviewData]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-theme(spacing.32))]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b p-4 sm:p-6 bg-card/50">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Overview</h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              Your productivity insights and statistics
            </p>
          </div>
        </div>
        <div className="flex-1 p-4 sm:p-6 space-y-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!overviewData) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-theme(spacing.32))]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b p-4 sm:p-6 bg-card/50">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Overview</h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              Your productivity insights and statistics
            </p>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-muted/50 mb-6">
            <BarChart3 className="h-10 w-10 text-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">No data available</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Start creating projects and tasks to see your productivity insights
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.32))]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b p-4 sm:p-6 bg-card/50">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Overview</h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            Your productivity insights and statistics
          </p>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 space-y-6 pb-24">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-all border-primary/20 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
                <div className="p-2 rounded-lg bg-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{Number(overviewData.totalTasks)}</div>
              <p className="text-xs text-muted-foreground mt-2">
                {totalCompletedTasks} completed
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all border-blue-500/20 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <FolderOpen className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{Number(overviewData.totalProjects)}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Active projects
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all border-green-500/20 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Rate</CardTitle>
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {Math.round(overviewData.weeklyStats.completionRate * 100)}%
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {Number(overviewData.weeklyStats.completedTasks)} of {Number(overviewData.weeklyStats.totalTasks)} tasks
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all border-orange-500/20 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Longest Streak</CardTitle>
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {Number(overviewData.productivityInsights.longestStreak)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                consecutive days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Time Period Statistics */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Activity by Time Period
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {Number(overviewData.weeklyStats.completedTasks)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Completed</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {Number(overviewData.weeklyStats.pendingTasks)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Pending</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <div className="text-2xl font-bold text-foreground">
                      {Number(overviewData.weeklyStats.totalTasks)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Total</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">Completion Rate</span>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {Math.round(overviewData.weeklyStats.completionRate * 100)}%
                    </Badge>
                  </div>
                  <Progress value={overviewData.weeklyStats.completionRate * 100} className="h-3" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {Number(overviewData.monthlyStats.completedTasks)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Completed</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {Number(overviewData.monthlyStats.pendingTasks)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Pending</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <div className="text-2xl font-bold text-foreground">
                      {Number(overviewData.monthlyStats.totalTasks)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Total</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">Completion Rate</span>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {Math.round(overviewData.monthlyStats.completionRate * 100)}%
                    </Badge>
                  </div>
                  <Progress value={overviewData.monthlyStats.completionRate * 100} className="h-3" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  This Year
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {Number(overviewData.yearlyStats.completedTasks)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Completed</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {Number(overviewData.yearlyStats.pendingTasks)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Pending</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <div className="text-2xl font-bold text-foreground">
                      {Number(overviewData.yearlyStats.totalTasks)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Total</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">Completion Rate</span>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {Math.round(overviewData.yearlyStats.completionRate * 100)}%
                    </Badge>
                  </div>
                  <Progress value={overviewData.yearlyStats.completionRate * 100} className="h-3" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Productivity Insights */}
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Productivity Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3 p-4 rounded-lg bg-card/80 border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Most Productive Day</span>
                </div>
                <p className="text-lg font-bold text-foreground pl-11">{mostProductiveDayFormatted}</p>
              </div>
              <div className="space-y-3 p-4 rounded-lg bg-card/80 border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Flame className="h-5 w-5 text-orange-500" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Longest Streak</span>
                </div>
                <p className="text-lg font-bold text-foreground pl-11">
                  {Number(overviewData.productivityInsights.longestStreak)} consecutive days
                </p>
              </div>
              <div className="space-y-3 p-4 rounded-lg bg-card/80 border border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <FolderOpen className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Most Active Project</span>
                </div>
                <div className="flex items-center gap-2 pl-11">
                  {mostActiveProject && (
                    <div 
                      className="flex items-center justify-center w-6 h-6 rounded-md shrink-0"
                      style={{ backgroundColor: mostActiveProject.color + '20' }}
                    >
                      <span className="text-sm" style={{ color: mostActiveProject.color }}>{mostActiveProject.icon}</span>
                    </div>
                  )}
                  <p className="text-lg font-bold text-foreground">{mostActiveProjectName}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Per-Project Performance */}
        {overviewData.projectStats.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Project Performance Breakdown
            </h3>
            <div className="space-y-4">
              {overviewData.projectStats.map((stat) => {
                const project = projects?.find(p => p.id === stat.projectId);
                if (!project) return null;

                const completionPercentage = Math.round(stat.completionRate * 100);
                const overduePercentage = Math.round(stat.overdueRate * 100);

                return (
                  <Card key={stat.projectId.toString()} className="hover:shadow-lg transition-all border-primary/10">
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                              style={{ backgroundColor: project.color + '20' }}
                            >
                              <span className="text-xl" style={{ color: project.color }}>{project.icon}</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground text-lg">{project.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {Number(stat.totalTasks)} total tasks
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="text-base font-bold px-3 py-1"
                            style={{ 
                              backgroundColor: project.color + '10',
                              color: project.color,
                              borderColor: project.color + '30'
                            }}
                          >
                            {completionPercentage}%
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-foreground font-medium">Progress</span>
                            <span className="text-muted-foreground">
                              {Number(stat.completedTasks)} / {Number(stat.totalTasks)} completed
                            </span>
                          </div>
                          <div className="relative h-3 rounded-full bg-muted overflow-hidden border">
                            <div
                              className="absolute h-full transition-all duration-500 ease-out"
                              style={{ 
                                width: `${completionPercentage}%`,
                                backgroundColor: project.color
                              }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-2">
                          <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto mb-1" />
                            <p className="text-xl font-bold text-green-600 dark:text-green-400">{Number(stat.completedTasks)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Completed</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                            <AlertCircle className="h-4 w-4 text-destructive mx-auto mb-1" />
                            <p className="text-xl font-bold text-destructive">{Number(stat.overdueTasks)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Overdue</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-muted/50 border">
                            <Target className="h-4 w-4 text-foreground mx-auto mb-1" />
                            <p className="text-xl font-bold text-foreground">
                              {Number(stat.totalTasks) - Number(stat.completedTasks) - Number(stat.overdueTasks)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">On Track</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
