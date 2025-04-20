import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, User, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [match] = useRoute("/admin");
  const { login, register, isLoading, error, isAuthenticated, isAdmin } = useAuth();
  const [tab, setTab] = useState<string>("login");
  
  // Form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });
  
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // Local form validation
  const [formError, setFormError] = useState<string | null>(null);

  // If user is already authenticated and an admin, redirect to admin page
  if (isAuthenticated && isAdmin && !match) {
    navigate("/admin");
    return null;
  }
  
  // If user is authenticated but not an admin, redirect to home
  if (isAuthenticated && !isAdmin) {
    navigate("/");
    return null;
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Basic validation
    if (!loginForm.email || !loginForm.password) {
      setFormError("Email and password are required");
      return;
    }
    
    const success = await login(loginForm.email, loginForm.password);
    if (success) {
      navigate("/admin");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Basic validation
    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      setFormError("All fields are required");
      return;
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }
    
    const success = await register(
      registerForm.username,
      registerForm.email,
      registerForm.password
    );
    
    if (success) {
      navigate("/");
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto py-8">
        <Card className="shadow-lg border-0 overflow-hidden">
          <div className="h-1.5 bg-gradient-primary w-full"></div>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-primary">
              Authentication
            </CardTitle>
            <CardDescription className="text-center">
              Login to access admin functions or register for a new account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-4">
            <Tabs defaultValue="login" value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleLoginSubmit}>
                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Email"
                        type="email"
                        className="pl-10"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                      />
                    </div>
                    
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Password"
                        type="password"
                        className="pl-10"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      />
                    </div>
                    
                    {(error || formError) && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <AlertDescription>
                          {formError || error}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-secondary hover:bg-secondary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              {/* Register Form */}
              <TabsContent value="register">
                <form onSubmit={handleRegisterSubmit}>
                  <div className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Username"
                        type="text"
                        className="pl-10"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                      />
                    </div>
                    
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Email"
                        type="email"
                        className="pl-10"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                      />
                    </div>
                    
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Password"
                        type="password"
                        className="pl-10"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                      />
                    </div>
                    
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Confirm Password"
                        type="password"
                        className="pl-10"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                      />
                    </div>
                    
                    {(error || formError) && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <AlertDescription>
                          {formError || error}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-secondary hover:bg-secondary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? "Registering..." : "Register"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-center py-4 border-t">
            <p className="text-xs text-gray-500">
              {tab === "login" 
                ? "Don't have an account? Click 'Register'" 
                : "Already have an account? Click 'Login'"
              }
            </p>
          </CardFooter>
        </Card>
        
        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-gray-600">
            Back to Home
          </Button>
        </div>
      </div>
    </Layout>
  );
}