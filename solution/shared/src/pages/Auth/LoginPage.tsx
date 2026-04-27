import { motion } from "framer-motion";
import { LogIn, ArrowRight, UserPlus, ShieldCheck, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type AuthSession, type Route } from "@shared/types";


/**
 * страница входа
 * простая форма, ничего лишнего
 */

interface LoginPageProps {
  busy: boolean;
  loginForm: { login: string; password: string };
  auth: AuthSession | null;
  onLoginChange: (next: { login: string; password: string }) => void;
  onLoginSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onNavigate: (route: Route) => void;
}

export function LoginPage({
  busy,
  loginForm,
  auth,
  onLoginChange,
  onLoginSubmit,
  onNavigate,
}: LoginPageProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Store className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">Вход в систему</h1>
          <p className="text-muted-foreground">Войдите для оформления заказов</p>
        </div>

        {/* если юзер уже залогинился, мягко намекаем ему об этом */}
        {auth && (
          <div className="mb-6 p-4 rounded-xl border text-center bg-primary/10 border-primary/20">
            <p className="text-sm">Вы уже вошли как <strong>{auth.fullName}</strong></p>
            <Button variant="link" size="sm" className="text-primary hover:text-primary/80" onClick={() => onNavigate({ name: "catalog" })}>Перейти в каталог</Button>
          </div>
        )}

        <Card>
          <CardContent className="p-6">
            <form onSubmit={onLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-login" className="font-medium">Логин</Label>
                <Input id="login-login" value={loginForm.login} onChange={(e) => onLoginChange({ ...loginForm, login: e.target.value })} placeholder="your@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="font-medium">Пароль</Label>
                <Input id="login-password" type="password" value={loginForm.password} onChange={(e) => onLoginChange({ ...loginForm, password: e.target.value })} placeholder="••••••••" required />
              </div>
              <Button type="submit" className="w-full font-bold shadow-lg shadow-primary/20" disabled={busy}>
                {busy ? "Вход..." : "Войти"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm mt-4" style={{ color: "#666" }}>
          Нет аккаунта?{" "}
          <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => onNavigate({ name: "register" })}>
            Зарегистрируйтесь
          </Button>
        </p>
      </motion.div>
    </div>
  );
}
