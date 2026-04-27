import { motion } from "framer-motion";
import { PixelIcon } from "@shared/components/Common/PixelIcon";
import { type Route } from "@shared/types";

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
    <div className="flex items-center justify-center py-10 lg:py-20 px-4" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full border-4 border-black p-6 sm:p-10 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="text-center mb-8">
          {/* графический элемент заголовка */}
          <motion.div
            whileHover={{ rotate: -15 }}
            className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-black bg-[#FFFFFF] mx-auto flex items-center justify-center mb-4"
          >
            <PixelIcon.UserPlus />
          </motion.div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Регистрация</h1>
          <p className="font-bold opacity-70">создание новой учетной записи</p>
        </div>

        {/* форма регистрации пользователя */}
        <form onSubmit={onRegisterSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="font-bold block uppercase text-[10px] opacity-60">Полное имя</label>
            <input
              type="text"
              className="w-full border-2 border-black p-3 focus:bg-[#E0F2FE] outline-none font-bold"
              value={registerForm.fullName}
              onChange={(e) => onRegisterChange({ ...registerForm, fullName: e.target.value })}
              required
              placeholder="Иванов Иван Иванович"
            />
          </div>
          <div className="space-y-2">
            <label className="font-bold block uppercase text-[10px] opacity-60">Логин / Email</label>
            <input
              type="text"
              className="w-full border-2 border-black p-3 focus:bg-[#E0F2FE] outline-none font-bold"
              value={registerForm.login}
              onChange={(e) => onRegisterChange({ ...registerForm, login: e.target.value })}
              required
              placeholder="ivanov@mail.ru"
            />
          </div>
          <div className="space-y-2">
            <label className="font-bold block uppercase text-[10px] opacity-60">Пароль</label>
            <input
              type="password"
              className="w-full border-2 border-black p-3 focus:bg-[#E0F2FE] outline-none font-bold"
              value={registerForm.password}
              onChange={(e) => onRegisterChange({ ...registerForm, password: e.target.value })}
              required
              placeholder="••••••••"
            />
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
                Создать аккаунт
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center border-t-2 border-black pt-6">
          <p className="font-bold mb-2">Уже есть аккаунт?</p>
          <motion.button
            whileHover={{ x: -5 }}
            className="uppercase text-sm font-black underline flex items-center justify-center gap-2 mx-auto"
            onClick={() => onNavigate({ name: "login" })}
          >
            <PixelIcon.ArrowLeft />
            Войти в систему
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
