import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStudents } from '@/lib/store';

interface AuthContextType {
  isAuthenticated: boolean;
  userName: string | null;
  role: 'admin' | 'student' | null;
  studentId: string | null;
  login: (userName: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_PASSWORD = "Dana andar";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [role, setRole] = useState<'admin' | 'student' | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('brutal_auth');
    const savedUser = sessionStorage.getItem('brutal_user');
    const savedRole = sessionStorage.getItem('brutal_role') as 'admin' | 'student' | null;
    const savedStudentId = sessionStorage.getItem('brutal_student_id');

    if (savedAuth === 'true' && savedUser) {
      setIsAuthenticated(true);
      setUserName(savedUser);
      setRole(savedRole);
      setStudentId(savedStudentId);
    }
  }, []);

  const login = async (name: string, password: string) => {
    // Admin login
    if (name.toLowerCase() === 'admin' && password === ADMIN_PASSWORD) {
      const userRole = 'admin';
      setIsAuthenticated(true);
      setUserName(name);
      setRole(userRole);
      setStudentId(null);

      sessionStorage.setItem('brutal_auth', 'true');
      sessionStorage.setItem('brutal_user', name);
      sessionStorage.setItem('brutal_role', userRole);
      return true;
    }

    // Student login
    try {
      const students = await getStudents();
      const student = students.find(s => 
        s.nome.toLowerCase() === name.toLowerCase() && 
        (s.password === password || (!s.password && password === ADMIN_PASSWORD))
      );

      if (student) {
        const userRole = 'student';
        setIsAuthenticated(true);
        setUserName(name);
        setRole(userRole);
        setStudentId(student.id);

        sessionStorage.setItem('brutal_auth', 'true');
        sessionStorage.setItem('brutal_user', name);
        sessionStorage.setItem('brutal_role', userRole);
        sessionStorage.setItem('brutal_student_id', student.id);
        return true;
      }
    } catch (err) {
      console.error('Erro no login:', err);
    }

    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserName(null);
    setRole(null);
    setStudentId(null);
    sessionStorage.removeItem('brutal_auth');
    sessionStorage.removeItem('brutal_user');
    sessionStorage.removeItem('brutal_role');
    sessionStorage.removeItem('brutal_student_id');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userName, role, studentId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
