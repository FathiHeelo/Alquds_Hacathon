import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import type { UserRole as UserRoleValue } from "../../domain/enums/status";
import { appConfig } from "../config/appConfig";
import { apiSession } from "../../services/api/apiSession";
import { AppError } from "../../shared/errors/AppError";

interface DemoSessionValue {
  isDemo: boolean;
  role: UserRoleValue | null;
  switchRole(role: UserRoleValue): Promise<void>;
  logout(): Promise<void>;
}

const DemoSessionContext = createContext<DemoSessionValue | null>(null);

export function DemoSessionProvider({ children }: PropsWithChildren) {
  const [role, setRole] = useState<UserRoleValue | null>(null);
  useEffect(() => {
    let active = true;
    if (!appConfig.demoMode) void apiSession.restore().then((restoredRole) => { if (active && restoredRole) setRole(restoredRole); });
    return () => { active = false; };
  }, []);
  const switchRole = useCallback(async (nextRole: UserRoleValue) => {
    if (!appConfig.demoMode) {
      try { await apiSession.login(nextRole); }
      catch (error) {
        const canUseDemoFallback = appConfig.apiFallbackToDemo && error instanceof AppError && ["NETWORK_ERROR", "NETWORK_TIMEOUT"].includes(error.code);
        if (canUseDemoFallback && __DEV__) console.warn("[AMMERHA] API unavailable — using demo fallback");
        if (!canUseDemoFallback) throw error;
      }
    }
    setRole(nextRole);
  }, []);
  const logout = useCallback(async () => {
    await apiSession.clear();
    setRole(null);
  }, []);
  const value = useMemo(() => ({ isDemo: appConfig.demoMode, role, switchRole, logout }), [role, switchRole, logout]);

  return <DemoSessionContext.Provider value={value}>{children}</DemoSessionContext.Provider>;
}

export function useDemoSession(): DemoSessionValue {
  const session = useContext(DemoSessionContext);
  if (!session) throw new Error("useDemoSession must be used inside DemoSessionProvider");
  return session;
}
