import React, { createContext, useContext, useState, useCallback } from "react";
import type { User, Role } from "../types";
import api from "../services/api";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* Usuários de demonstração — funcionam sem backend */
const DEMO_USERS: Record<string, Omit<User, "id"> & { senha: string }> = {
  "diretoria@instrucao.com":    { name: "Carlos Henrique",   email: "diretoria@instrucao.com",   role: "gestor",      setor: "Diretoria",    ativo: true, senha: "123456" },
  "gestor@instrucao.com":       { name: "Ana Paula Gestora", email: "gestor@instrucao.com",       role: "gestor",      setor: "Manutenção",   ativo: true, senha: "123456" },
  "producao@instrucao.com":     { name: "Roberto Souza",     email: "producao@instrucao.com",     role: "gestor",      setor: "Produção",     ativo: true, senha: "123456" },
  "suprimentos@instrucao.com":  { name: "Patrícia Lima",     email: "suprimentos@instrucao.com",  role: "gestor",      setor: "Suprimentos",  ativo: true, senha: "123456" },
  "pcp@instrucao.com":          { name: "Marcos Andrade",    email: "pcp@instrucao.com",          role: "lider_campo", setor: "PCP",          ativo: true, senha: "123456" },
  "lider@instrucao.com":        { name: "Felipe Líder",      email: "lider@instrucao.com",        role: "lider_campo", setor: "Campo",        ativo: true, senha: "123456" },
  "mecanico@instrucao.com":     { name: "João Mecânico",     email: "mecanico@instrucao.com",     role: "mecanico",    setor: "Oficina",      ativo: true, senha: "123456" },
  "operador@instrucao.com":     { name: "Pedro Operador",    email: "operador@instrucao.com",     role: "operador",    setor: "Campo",        ativo: true, senha: "123456" },
  "motorista@instrucao.com":    { name: "Lucas Motorista",   email: "motorista@instrucao.com",    role: "operador",    setor: "Logística",    ativo: true, senha: "123456" },
};

function demoLogin(email: string, password: string): User | null {
  const perfil = DEMO_USERS[email.toLowerCase()];
  if (!perfil || perfil.senha !== password) return null;
  const { senha: _, ...user } = perfil;
  return { id: 99, ...user, role: user.role as Role };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  });

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await api.post<{ token: string; user: User }>("/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    } catch {
      /* API indisponível → tenta modo demo */
      const mockUser = demoLogin(email, password);
      if (!mockUser) throw new Error("E-mail ou senha inválidos.");
      localStorage.setItem("token", "demo-token");
      localStorage.setItem("user", JSON.stringify(mockUser));
      setUser(mockUser);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
