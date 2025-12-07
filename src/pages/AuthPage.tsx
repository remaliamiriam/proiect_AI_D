import { useState } from "react";
import { LoginForm } from "../components/auth/LoginForm";
import { RegisterForm } from "../components/auth/RegisterForm";
import { useAuth } from "../contexts/AuthContext";

interface AuthPageProps {
  onSuccess: (isAdmin?: boolean) => void;  // primește rolul admin
}

export function AuthPage({ onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { profile } = useAuth();

  const handleSuccess = () => {
    if (profile?.is_admin) {
      onSuccess(true);  // redirect către admin
    } else {
      onSuccess(false); // redirect către home/posts
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      {mode === "login" ? (
        <LoginForm
          onSuccess={handleSuccess}
          onSwitchToRegister={() => setMode("register")}
        />
      ) : (
        <RegisterForm
          onSuccess={handleSuccess}
          onSwitchToLogin={() => setMode("login")}
        />
      )}
    </div>
  );
}
