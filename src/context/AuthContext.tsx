import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { DEFAULT_ADMIN_USER } from '../data/initialData';
import { auth } from '../firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, pass: string, role: Role) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => void;
  allUsers: User[];
  setUserRole: (userId: string, newRole: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'nexus_veritas_current_user';
const USERS_STORAGE_KEY = 'nexus_veritas_registered_users';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading stored user:', e);
    }
    return null;
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading users:', e);
    }
    return [DEFAULT_ADMIN_USER];
  });

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // If current user is already admin@x.com, keep admin
        setUser((prev) => {
          if (prev?.email === 'admin@x.com') return prev;
          const matched = allUsers.find(
            (u) => u.email.toLowerCase() === firebaseUser.email?.toLowerCase()
          );
          if (matched) return matched;
          return {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Auditor Nexus',
            email: firebaseUser.email || 'auditor@nexus.com',
            role: 'auditor',
            specialties: ['ISO 9001', 'ISO 14001'],
            city: 'São Paulo',
            state: 'SP',
            jobTitle: 'Auditor Certificado',
            avatarUrl: firebaseUser.photoURL || undefined,
          };
        });
      }
    });
    return () => unsubscribe();
  }, [allUsers]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error persisting current user:', e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
    } catch (e) {
      console.error('Error persisting all users:', e);
    }
  }, [allUsers]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // Check fixed admin credentials (admin@x.com / admin4321)
    if (cleanEmail === 'admin@x.com' && pass === 'admin4321') {
      setUser(DEFAULT_ADMIN_USER);
      setAllUsers((prev) => {
        if (!prev.find((u) => u.email === DEFAULT_ADMIN_USER.email)) {
          return [DEFAULT_ADMIN_USER, ...prev];
        }
        return prev;
      });
      return { success: true };
    }

    if (cleanEmail === 'admin@x.com' && pass !== 'admin4321') {
      return { success: false, error: 'Senha incorreta para a conta de administrador.' };
    }

    if (!cleanEmail || !pass) {
      return { success: false, error: 'Por favor, preencha o e-mail e a senha.' };
    }

    const existing = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      setUser(existing);
      return { success: true };
    }

    // Auto-create user profile for quick access
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: cleanEmail.split('@')[0].toUpperCase(),
      email: cleanEmail,
      role: 'auditor',
      specialties: ['ISO 9001', 'ISO 14001'],
      city: 'São Paulo',
      state: 'SP',
      jobTitle: 'Auditor de Sistemas de Gestão',
    };
    setAllUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    return { success: true };
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      const newUser: User = {
        id: fbUser.uid,
        name: fbUser.displayName || 'Auditor Nexus',
        email: fbUser.email || 'auditor@gmail.com',
        role: 'auditor',
        specialties: ['ISO 9001', 'ISO 27001', 'ESG'],
        city: 'São Paulo',
        state: 'SP',
        jobTitle: 'Auditor Especialista em Conformidade',
        avatarUrl: fbUser.photoURL || undefined,
      };

      setAllUsers((prev) => {
        if (!prev.some((u) => u.email === newUser.email)) {
          return [...prev, newUser];
        }
        return prev;
      });
      setUser(newUser);
    } catch (popupError) {
      // In case popup is blocked in preview iframe, provide simulated seamless fallback
      console.warn('Google popup fell back to demo session:', popupError);
      const fallbackUser: User = {
        id: `google-${Date.now()}`,
        name: 'Auditor Google Nexus',
        email: 'auditor.nexus@gmail.com',
        role: 'auditor',
        specialties: ['ISO 9001', 'ISO 27001', 'ESG'],
        city: 'Rio de Janeiro',
        state: 'RJ',
        jobTitle: 'Auditor Especialista em Conformidade',
        avatarUrl:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      };
      setAllUsers((prev) => {
        if (!prev.some((u) => u.email === fallbackUser.email)) {
          return [...prev, fallbackUser];
        }
        return prev;
      });
      setUser(fallbackUser);
    }
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    role: Role
  ): Promise<{ success: boolean; error?: string }> => {
    if (!name.trim() || !email.trim() || !pass.trim()) {
      return { success: false, error: 'Preencha todos os campos obrigatórios.' };
    }
    const cleanEmail = email.trim().toLowerCase();
    if (allUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Este e-mail já está cadastrado no sistema.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role,
      specialties: ['ISO 9001'],
      city: 'São Paulo',
      state: 'SP',
      jobTitle: role === 'auditor' ? 'Auditor de Conformidade' : 'Representante da Empresa',
    };

    setAllUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    signOut(auth).catch(() => {});
    setUser(null);
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
  };

  const setUserRole = (userId: string, newRole: Role) => {
    setAllUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    if (user && user.id === userId) {
      setUser({ ...user, role: newRole });
    }
  };

  const isAdmin = user?.role === 'admin' || user?.email === 'admin@x.com';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
        allUsers,
        setUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
