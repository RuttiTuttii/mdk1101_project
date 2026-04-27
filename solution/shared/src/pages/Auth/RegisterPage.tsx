import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Route } from "@shared/types";


/**
 * страница регистрации
 * почти то же самое что и вход, только полей побольше
 */

interface RegisterPageProps {
  busy: boolean;
  registerForm: { fullName: string; login: string; password: string };
  onRegisterChange: (next: { fullName: string; login: string; password: string }) => void;
  onRegisterSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onNavigate: (route: Route) => void;
}

export function RegisterPage({
  busy,
  registerForm,
  onRegisterChange,
  onRegisterSubmit,
  onNavigate,
}: RegisterPageProps) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Store className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">Регистрация</h1>
          <p className="text-muted-foreground">Создайте аккаунт, чтобы покупать обувь</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={onRegisterSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name" className="font-medium">ФИО</Label>
                <Input id="reg-name" value={registerForm.fullName} onChange={(e) => onRegisterChange({ ...registerForm, fullName: e.target.value })} placeholder="Иванов Иван Иванович" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-login" className="font-medium">Логин</Label>
                <Input id="reg-login" value={registerForm.login} onChange={(e) => onRegisterChange({ ...registerForm, login: e.target.value })} placeholder="your@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password" className="font-medium">Пароль</Label>
                <Input id="reg-password" type="password" value={registerForm.password} onChange={(e) => onRegisterChange({ ...registerForm, password: e.target.value })} placeholder="••••••••" required />
              </div>
              <Button type="submit" className="w-full font-bold shadow-lg shadow-primary/20" disabled={busy}>
                {busy ? "Создание..." : "Зарегистрироваться"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm mt-4 text-muted-foreground">
          Уже есть аккаунт?{" "}
          <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => onNavigate({ name: "login" })}>
            Войдите
          </Button>
        </p>
      </div>
    </div>
  );
}
