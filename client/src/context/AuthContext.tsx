import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  lastLogin: string | null;
}

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean; 
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authString = localStorage.getItem("auth");
      const userString = localStorage.getItem("user");
      
      if (authString && userString) {
        try {
          const auth = JSON.parse(authString);
          const userData = JSON.parse(userString);
          
          if (auth.email && auth.password && userData) {
            setIsAuthenticated(true);
            setUser(userData);
            setIsAdmin(userData.isAdmin || false);
          }
        } catch (error) {
          localStorage.removeItem("auth");
          localStorage.removeItem("user");
        }
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest("POST", "/api/login", { email, password });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      
      const data = await response.json();
      
      if (data.success && data.user) {
        // Store credentials in localStorage for basic auth in future requests
        localStorage.setItem("auth", JSON.stringify({ email, password }));
        localStorage.setItem("user", JSON.stringify(data.user));
        
        setUser(data.user);
        setIsAdmin(data.user.isAdmin || false);
        setIsAuthenticated(true);
        return true;
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Invalid credentials");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest("POST", "/api/register", { username, email, password });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }
      
      const data = await response.json();
      
      if (data.success && data.user) {
        // Store credentials in localStorage for basic auth in future requests
        localStorage.setItem("auth", JSON.stringify({ email, password }));
        localStorage.setItem("user", JSON.stringify(data.user));
        
        setUser(data.user);
        setIsAdmin(data.user.isAdmin || false);
        setIsAuthenticated(true);
        return true;
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      setError(error instanceof Error 
        ? error.message 
        : "Registration failed. The username or email may already be in use.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    setUser(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        user, 
        isAdmin,
        login, 
        register,
        logout, 
        isLoading, 
        error 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
