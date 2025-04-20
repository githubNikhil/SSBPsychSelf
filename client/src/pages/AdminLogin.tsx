import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { login, isLoading, error } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please provide both username and password",
        variant: "destructive"
      });
      return;
    }
    
    const success = await login(username, password);
    if (success) {
      toast({
        title: "Success",
        description: "Logged in successfully"
      });
      setLocation("/admin");
    } else {
      toast({
        title: "Error",
        description: error || "Invalid credentials",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center text-olive-green">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  required
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="adminPassword">Admin Password</Label>
                <Input 
                  id="adminPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  required
                />
              </div>
              <Button 
                type="submit"
                className="w-full bg-olive-green hover:bg-olive-green/90 text-white font-medium py-3 rounded-lg transition duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="ghost"
              className="text-gray-500 hover:text-gray-800"
              onClick={() => setLocation("/")}
            >
              ← Back to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
