import { LoginForm } from "@/components/auth/login-form";
import { AuthLayoutProvider } from "../../AuthLayoutProvider";

export default function LoginPage() {
  return (
    <AuthLayoutProvider>
      <LoginForm />
    </AuthLayoutProvider>
  );
}
