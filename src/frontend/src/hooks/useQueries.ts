import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AdminStats,
  Course,
  Registration,
  UserProfile,
  UserRole,
} from "../backend.d";
import { useActor } from "./useActor";

export function useGetCourses() {
  const { actor, isFetching } = useActor();
  return useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCourses();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useGetAdminStats() {
  const { actor, isFetching } = useActor();
  return useQuery<AdminStats>({
    queryKey: ["adminStats"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getAdminStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useGetRegistrations() {
  const { actor, isFetching } = useActor();
  return useQuery<Registration[]>({
    queryKey: ["registrations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRegistrations();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10_000,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useInitializeCourses() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.initializeCourses();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
}

export function useRegister() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      employeeId,
      email,
      courseIds,
    }: {
      employeeId: string;
      email: string;
      courseIds: string[];
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.register(employeeId, email, courseIds);
      if (result.__kind__ === "error") {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });
}

export function useGetRegistrationsCsv() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getRegistrationsCsv();
    },
  });
}

export function useAssignUserRole() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      user,
      role,
    }: {
      user: Principal;
      role: UserRole;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.assignCallerUserRole(user, role);
    },
  });
}

export function useSelfGrantAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (secret: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.selfGrantAdmin(secret);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

export function useClaimPreAuthorizedAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.claimPreAuthorizedAdmin();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}
