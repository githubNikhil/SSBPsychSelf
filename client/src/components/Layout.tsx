import { Link } from "wouter";
import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, Home } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gradient-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold tracking-wide">Psych Test Simulator</h1>
          <nav>
            <ul className="flex space-x-6 items-center">
              <li>
                <Link href="/" className="text-white hover:text-light transition-colors duration-200 flex items-center">
                  <Home className="w-4 h-4 mr-1" />
                  Home
                </Link>
              </li>
              
              {isAuthenticated && isAdmin && (
                <li>
                  <Link href="/admin" className="text-white hover:text-light transition-colors duration-200">
                    Admin
                  </Link>
                </li>
              )}
              
              {isAuthenticated ? (
                <>
                  <li className="text-white text-sm opacity-80 px-2 py-1 bg-white/10 rounded-full flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {user?.username || "User"}
                  </li>
                  <li>
                    <button 
                      onClick={logout}
                      className="text-white hover:text-light transition-colors duration-200 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link href="/admin-login" className="text-white hover:text-light transition-colors duration-200">
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-neutral text-white py-5">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>© {new Date().getFullYear()} Psych Test Simulator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
