import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type UserRole = "manager" | "sales" | "cs";

interface RoleContextType {
  role: UserRole | null;
  setRole: (role: UserRole) => void;
  clearRole: () => void;
  roleName: string;
}

const roleNames: Record<UserRole, string> = {
  manager: "مدير المبيعات",
  sales: "فريق المبيعات",
  cs: "فريق نجاح العملاء",
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem("userRole");
    return saved as UserRole | null;
  });

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem("userRole", newRole);
  };

  const clearRole = () => {
    setRoleState(null);
    localStorage.removeItem("userRole");
  };

  const roleName = role ? roleNames[role] : "";

  return (
    <RoleContext.Provider value={{ role, setRole, clearRole, roleName }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used within RoleProvider");
  return context;
}
