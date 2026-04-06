import { SignupForm } from "@/components/auth/signup-form";
import { AuthLayoutProvider } from "../../AuthLayoutProvider";

export default function SignupPage() {
  return (
    <AuthLayoutProvider>
      <SignupForm />
    </AuthLayoutProvider>
  );
}
