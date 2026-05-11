import { create } from 'zustand'

interface AuthState {
  isLoggedIn: boolean
  username: string | null
  roleId: number | null
  setAuth: (username: string, roleId: number) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>(set => ({
  isLoggedIn: false,
  username: null,
  roleId: null,
  setAuth: (username, roleId) => set({ isLoggedIn: true, username, roleId }),
  clearAuth: () => set({ isLoggedIn: false, username: null, roleId: null }),
}))
