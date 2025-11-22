import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthForm from "@/components/auth/AuthForm";

export default async function SignUpPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <AuthLayout>
      <AuthForm type="sign-up" />
    </AuthLayout>
  );
}
