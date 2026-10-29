import { LogoMark } from "@/components/logo";
import { LoginForm } from "./login-form";

export const metadata = { title: "ورود" };

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <LogoMark className="size-16" />
          <h1 className="text-xl">ورود به پنل مدیریت</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
