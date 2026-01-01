import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export type UserRole = 'student' | 'staff';

export interface User {
  id: string;       // Firebase UID
  email: string;
  name: string;
  role: UserRole;
  rollNo?: string;
  college?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  rollNo?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COLLEGE_DOMAINS = ['psgtech.ac.in', 'psgcas.ac.in', 'psgims.ac.in'];

const validateCollegeEmail = (email: string): boolean => {
  const domain = email.split('@')[1];
  return COLLEGE_DOMAINS.some(d => domain?.endsWith(d));
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user session from localStorage
    const storedUser = localStorage.getItem('skipq_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser: FirebaseUser = res.user;

      const snap = await getDoc(doc(db, "users", firebaseUser.uid));
      if (!snap.exists()) {
        return { success: false, error: "User profile not found" };
      }

      const data = snap.data();

      const appUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        name: data.name,
        role: data.role,
        rollNo: data.rollNo,
        college: data.college,
      };

      setUser(appUser);
      localStorage.setItem("skipq_user", JSON.stringify(appUser));

      return { success: true };
    } catch (error: any) {
      console.error("LOGIN ERROR:", error.code);
      return { success: false, error: error.code };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      if (!validateCollegeEmail(data.email)) {
        return { success: false, error: "Use college email only" };
      }

      const res = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser: FirebaseUser = res.user;

      await setDoc(doc(db, "users", firebaseUser.uid), {
        name: data.name,
        email: data.email,
        role: data.role,
        rollNo: data.rollNo || "",
        college: "PSG Tech",
        createdAt: new Date(),
      });

      const appUser: User = {
        id: firebaseUser.uid,
        email: data.email,
        name: data.name,
        role: data.role,
        rollNo: data.rollNo,
        college: "PSG Tech",
      };

      setUser(appUser);
      localStorage.setItem("skipq_user", JSON.stringify(appUser));

      return { success: true };
    } catch (error: any) {
      console.error("REGISTER ERROR:", error.code);
      return { success: false, error: error.code };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skipq_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
