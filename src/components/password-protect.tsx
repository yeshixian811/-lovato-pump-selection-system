"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

interface PasswordProtectProps {
  correctPassword: string;
  children: React.ReactNode;
}

export function PasswordProtect({ correctPassword, children }: PasswordProtectProps) {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("密码错误，请重试");
      setPassword("");
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Lock className="h-6 w-6 text-blue-600" />
            访问受限
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            请输入密码以访问产品库
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-lg"
                autoFocus
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 font-medium text-center">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              解锁访问
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
