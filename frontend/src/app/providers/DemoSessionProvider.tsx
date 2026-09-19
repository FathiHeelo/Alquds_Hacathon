import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";

import type { UserRole as UserRoleValue } from "../../domain/enums/status";
import { appConfig } from "../config/appConfig";

interface DemoSessionValue {
  isDemo: boolean;
  role: UserRoleValue | null;
  switchRole(role: UserRoleValue): void;
  logout(): void;
}

const DemoSessionContext = createContext<DemoSessionValue | null>(null);

export function DemoSessionProvider({ children }: PropsWithChildren) {
  const [role, setRole] = useState<UserRoleValue | null>(null);
  const value = useMemo(
    () => ({ isDemo: appConfig.demoMode, role, switchRole: setRole, logout: () => setRole(null) }),
    [role]
  );

  return <DemoSessionContext.Provider value={value}>{children}</DemoSessionContext.Provider>;
}

export function useDemoSession(): DemoSessionValue {
  const session = useContext(DemoSessionContext);
  if (!session) throw new Error("useDemoSession must be used inside DemoSessionProvider");
  return session;
}
