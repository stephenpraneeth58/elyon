import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTodayDate } from "../lib/assistant";
import { useActor } from "./useActor";

export function useGoals() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGoalsForCurrentUser();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTodayTasks() {
  const { actor, isFetching } = useActor();
  const today = getTodayDate();
  return useQuery({
    queryKey: ["tasks", "today", today],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasksForDate(today);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllTasks() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tasks", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasksForCurrentUser();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTasksForGoal(goalId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tasks", "goal", goalId?.toString()],
    queryFn: async () => {
      if (!actor || goalId === null) return [];
      return actor.getTasksForGoal(goalId);
    },
    enabled: !!actor && !isFetching && goalId !== null,
  });
}

export function useCompletedDates() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["completedDates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCompletedTaskDatesForCurrentUser();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateGoal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      reason,
    }: { title: string; reason: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createGoal(title, reason);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useUpdateGoal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      reason,
    }: { id: bigint; title: string; reason: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateGoal(id, title, reason);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useDeleteGoal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteGoal(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      date,
      goalId,
    }: { name: string; date: string; goalId: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createTask(name, date, goalId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["completedDates"] });
    },
  });
}

export function useCompleteTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.completeTask(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["completedDates"] });
    },
  });
}

export function useUncompleteTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.uncompleteTask(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["completedDates"] });
    },
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteTask(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["completedDates"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile({ name });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userProfile"] }),
  });
}
