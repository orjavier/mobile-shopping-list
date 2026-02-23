import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  public_id?: string;
  secure_url?: string;
  roleId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
}

const checkAdmin = (user: User | null) => {
  if (!user) return false;
  return (
    user.roleId === "admin" ||
    user.email.includes("admin") ||
    user.email === "orlando@gmail.com" ||
    user.email === "orjav@gmail.com"
  );
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          isAdmin: checkAdmin(user),
        }),
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
