"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Key, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { setupMobilePasswordAction } from "@/actions/users/setup-mobile-password-action";

interface MobilePasswordFormProps {
  hasPasswordSet: boolean;
}

export function MobilePasswordForm({ hasPasswordSet }: MobilePasswordFormProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("password", password);

      const result = await setupMobilePasswordAction(formData);
      if (result.success) {
        toast.success("Password mobile berhasil diatur");
        setPassword("");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengatur password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <CardTitle>Password Mobile App</CardTitle>
        </div>
        <CardDescription>
          Atur password khusus untuk login ke aplikasi mobile Lampung Dev.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center gap-2">
          <span className="text-sm font-medium">Status saat ini:</span>
          {hasPasswordSet ? (
            <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
              <CheckCircle2 size={14} />
              <span className="text-xs font-bold">PASSWORD SUDAH DISET</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <XCircle size={14} />
              <span className="text-xs font-bold">BELUM DISET</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full gap-2">
            <Label htmlFor="mobile-password">Password Baru</Label>
            <Input
              id="mobile-password"
              type="password"
              placeholder="Masukkan password minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full md:w-fit"
            disabled={isLoading || password.length < 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              hasPasswordSet ? "Update Password Mobile" : "Set Password Mobile"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
