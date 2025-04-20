import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import TestSelection from "@/pages/TestSelection";
import LoginPage from "@/pages/LoginPage";
import Admin from "@/pages/Admin";
import TAT from "@/components/TestComponents/TAT";
import WAT from "@/components/TestComponents/WAT";
import SRT from "@/components/TestComponents/SRT";
import SDTSelection from "@/components/TestComponents/SDTSelection";
import SDT from "@/components/TestComponents/SDT";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/test-selection" component={TestSelection} />
      <Route path="/admin-login" component={LoginPage} />
      <Route path="/admin" component={Admin} />
      <Route path="/tat-test" component={TAT} />
      <Route path="/wat-test" component={WAT} />
      <Route path="/srt-test" component={SRT} />
      <Route path="/sdt-selection" component={SDTSelection} />
      <Route path="/sdt-test" component={SDT} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
