import { motion } from "framer-motion";
import { PixelIcon } from "@shared/components/Common/PixelIcon";
import { type AuthSession, type Route } from "@shared/types";

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
    <div className="flex items-center justify-center py-10 lg:py-20 px-4" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full border-4 border-black p-6 sm:p-10 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="text-center mb-8">
          {/* графический элемент заголовка */}
          <motion.div
            whileHover={{ rotate: 15 }}
            className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-black bg-[#FFFFFF] mx-auto flex items-center justify-center mb-4"
          >
            <PixelIcon.Login />
          </motion.div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Вход</h1>
          <p className="font-bold opacity-70">авторизация в системе</p>
        </div>

        {/* информирование пользователя о текущей сессии */}
        {auth && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 border-2 border-black bg-[#00FA9A] text-center font-bold"
          >
            <p>Вы вошли как {auth.fullName}</p>
            <button className="underline mt-2 flex items-center justify-center gap-2 mx-auto" onClick={() => onNavigate({ name: "catalog" })}>
              Перейти в каталог
              <PixelIcon.ArrowRight />
            </button>
          </motion.div>
        )}

        {/* форма ввода учетных данных */}
        <form onSubmit={onLoginSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="font-bold block uppercase text-[10px] opacity-60">Логин / Email</label>
            <div className="relative">
              <input
                type="text"
                className="w-full border-2 border-black p-3 focus:bg-[#E0F2FE] outline-none font-bold"
                value={loginForm.login}
                onChange={(e) => onLoginChange({ ...loginForm, login: e.target.value })}
                required
                placeholder="ivanov@mail.ru"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-bold block uppercase text-[10px] opacity-60">Пароль</label>
            <div className="relative">
              <input
                type="password"
                className="w-full border-2 border-black p-3 focus:bg-[#E0F2FE] outline-none font-bold"
                value={loginForm.password}
                onChange={(e) => onLoginChange({ ...loginForm, password: e.target.value })}
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-4 bg-[#c1ffcc] border-2 border-black font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-3"
            disabled={busy}
          >
            {busy ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <PixelIcon.Shield />
                Войти в аккаунт
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center border-t-2 border-black pt-6">
          <p className="font-bold mb-2">Нет учетной записи?</p>
          <motion.button
            whileHover={{ x: 5 }}
            className="uppercase text-sm font-black underline flex items-center justify-center gap-2 mx-auto"
            onClick={() => onNavigate({ name: "register" })}
          >
            <PixelIcon.UserPlus />
            Зарегистрироваться
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
