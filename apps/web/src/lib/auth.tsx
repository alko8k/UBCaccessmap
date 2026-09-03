import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SessionUser } from "@ubc-access-map/shared";
import { fetchMe, logout, requestMagicLink, verifyMagicLink } from "../api/client.ts";

type AuthContextValue = {
  user: SessionUser | null;
  isLoading: boolean;
  requestLink: (email: string) => Promise<void>;
  verify: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });

  const requestLink = useMutation({
    mutationFn: requestMagicLink,
  });
  const verify = useMutation({
    mutationFn: verifyMagicLink,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
  const signOut = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data?.user ?? null,
      isLoading: meQuery.isLoading,
      requestLink: async (email) => {
        await requestLink.mutateAsync(email);
      },
      verify: async (token) => {
        await verify.mutateAsync(token);
      },
      signOut: async () => {
        await signOut.mutateAsync();
      },
    }),
    [meQuery.data?.user, meQuery.isLoading, requestLink, verify, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook shares this module's context
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
