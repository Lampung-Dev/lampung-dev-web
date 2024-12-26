import { LoginForm } from "@/components/login-form"
import { auth } from "@/lib/next-auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect('/dashboard')

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col items-center justify-center gap-6 bg-green-600/10 backdrop-blur-sm p-6 md:p-10 rounded-xl border">
        <div className="flex w-full max-w-sm flex-col gap-6 items-center">
          <Image
            src="/images/logo.png"
            alt="lampung-dev-logo"
            width={200}
            height={0}
            className="w-36 md:w-48 lg:w-52"
            priority
          />

          <Separator />

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
