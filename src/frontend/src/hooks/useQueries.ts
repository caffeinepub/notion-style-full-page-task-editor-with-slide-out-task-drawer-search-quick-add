import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Task, Project, UserPreferences, OverviewData, TaskId, ProjectId } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<{ name: string } | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: { name: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllProjects() {
  const { actor, isFetching } = useActor();

  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, color, icon }: { name: string; color: string; icon: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProject(name, color, icon);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: ProjectId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProject(projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useGetTasksByDateRange(startDate: Date, endDate: Date) {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['tasks', 'dateRange', startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      if (!actor) return [];
      const start = BigInt(startDate.getTime() * 1000000);
      const end = BigInt(endDate.getTime() * 1000000);
      return actor.getTasksByDateRange(start, end);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTasksByCompletionStatus(completed: boolean) {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['tasks', 'completion', completed],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasksByCompletionStatus(completed);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTask(taskId: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<Task>({
    queryKey: ['task', taskId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTask(taskId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      dueDate,
      projectId,
      priority,
    }: {
      title: string;
      description: string | null;
      dueDate: bigint;
      projectId: ProjectId;
      priority: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTask(title, description, dueDate, projectId, priority);
    },
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const previousTasks = queryClient.getQueriesData({ queryKey: ['tasks'] });

      queryClient.setQueriesData<Task[]>({ queryKey: ['tasks'] }, (old) => {
        if (!old) return old;
        const optimisticTask: Task = {
          id: BigInt(Date.now()),
          title: newTask.title,
          description: newTask.description || undefined,
          longFormContent: undefined,
          dueDate: newTask.dueDate,
          completed: false,
          projectId: newTask.projectId,
          createdAt: BigInt(Date.now() * 1000000),
          owner: {} as any,
          completionDate: undefined,
          priority: newTask.priority,
        };
        return [...old, optimisticTask];
      });

      return { previousTasks };
    },
    onError: (_err, _newTask, context) => {
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      title,
      description,
      dueDate,
      priority,
    }: {
      taskId: TaskId;
      title: string;
      description: string | null;
      dueDate: bigint;
      priority: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTask(taskId, title, description, dueDate, priority);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId.toString()] });
    },
  });
}

export function useUpdateTaskContent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, content }: { taskId: TaskId; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTaskContent(taskId, content);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: TaskId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useToggleTaskCompletion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: TaskId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleTaskCompletion(taskId);
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const previousTasks = queryClient.getQueriesData({ queryKey: ['tasks'] });

      queryClient.setQueriesData<Task[]>({ queryKey: ['tasks'] }, (old) => {
        if (!old) return old;
        return old.map((task) =>
          task.id.toString() === taskId.toString()
            ? { ...task, completed: !task.completed }
            : task
        );
      });

      return { previousTasks };
    },
    onError: (_err, _taskId, context) => {
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useGetCompletedTasksHistory(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['tasks', 'history', searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCompletedTasksHistory(searchTerm);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOverviewData() {
  const { actor, isFetching } = useActor();

  return useQuery<OverviewData>({
    queryKey: ['overview'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getOverviewData();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTasksByProject(projectId: ProjectId) {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['tasks', 'project', projectId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasksByProject(projectId);
    },
    enabled: !!actor && !isFetching,
  });
}
