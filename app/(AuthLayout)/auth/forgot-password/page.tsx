import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthLayoutProvider } from "../../AuthLayoutProvider";

export default function ForgotPasswordPage() {
  return (
    <AuthLayoutProvider showImage1={false}>
      <ForgotPasswordForm />
    </AuthLayoutProvider>
  );
}
