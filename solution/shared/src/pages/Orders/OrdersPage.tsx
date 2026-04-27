import { motion, AnimatePresence } from "framer-motion";
import { PixelIcon } from "../../components/Common/PixelIcon";
import { type ApiOrder, type AuthSession } from "@shared/types";

const STATUS_MAP: Record<string, string> = {
  new: "Новый",
  processing: "В обработке",
  shipped: "Отправлен",
  done: "Выполнен",
  canceled: "Отменён",
};

interface OrdersPageProps {
  auth: AuthSession | null;
  orders: ApiOrder[];
  loading: boolean;
  error: string | null;
  onGoLogin: () => void;
  onRefresh: () => void;
  onUpdateStatus: (number: number, newStatus: string) => Promise<void>;
}

export function OrdersPage({
  auth,
  orders,
  loading,
  error,
  onGoLogin,
  onRefresh,
}: OrdersPageProps) {
  {/* заглушка для неавторизованного пользователя */}
  if (!auth) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center border-4 border-black bg-white" 
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        <div className="h-20 w-20 mb-6"><PixelIcon.Package /></div>
        <h2 className="text-3xl font-black uppercase mb-4">Ваши заказы</h2>
        <p className="font-bold mb-8 max-w-sm">войдите в аккаунт для просмотра истории заказов</p>
        <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGoLogin}
            className="px-10 py-4 border-4 border-black bg-[#00FA9A] font-black uppercase hover:bg-black hover:text-white transition-colors flex items-center gap-3"
        >
          <PixelIcon.Login />
          Войти в аккаунт
        </motion.button>
      </motion.div>
    );
  }

  const isAdmin = auth.role === "admin" || auth.role === "manager";

  return (
    <div className="space-y-8" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      {/* панель управления списком заказов */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col sm:flex-row items-center justify-between border-b-4 border-black pb-6 gap-4"
      >
        <div className="text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter">
            {isAdmin ? "Управление заказами" : "Мои заказы"}
          </h2>
          <p className="font-bold opacity-70">
            {isAdmin ? "реестр всех заказов в информационной системе" : "история ваших покупок"}
          </p>
        </div>
        <motion.button 
            whileHover={{ rotate: 180 }}
            onClick={onRefresh}
            className="p-3 border-2 border-black bg-white font-bold hover:bg-black hover:text-white transition-colors uppercase text-sm flex items-center gap-2"
        >
          <PixelIcon.Refresh />
          {loading ? "обновление..." : "обновить данные"}
        </motion.button>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 border-4 border-black bg-red-100 font-bold text-red-800"
        >
          ошибка при загрузке данных: {error}
        </motion.div>
      )}

      {/* отображение при отсутствии заказов */}
      {orders.length === 0 && !loading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-4 border-black p-20 text-center bg-white"
        >
          <div className="h-16 w-16 mx-auto mb-4 opacity-20"><PixelIcon.Package /></div>
          <h3 className="text-xl font-bold uppercase">Заказов пока нет</h3>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {orders.map((order, idx) => (
              <motion.div 
                key={order.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="border-4 border-black bg-white overflow-hidden"
              >
                {/* шапка заказа с номером и статусом */}
                <div className="bg-[#7FFF00] p-4 border-b-4 border-black flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                      <span className="text-2xl font-black">№{order.number}</span>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase">
                          <PixelIcon.Clock />
                          {new Date(order.created_at).toLocaleDateString()}
                      </div>
                  </div>
                  <div className="flex items-center gap-4">
                      <span className="px-3 py-1 border-2 border-black bg-white font-black uppercase text-xs">
                          {STATUS_MAP[order.status] || order.status}
                      </span>
                      <span className="text-2xl font-black">{order.total} ₽</span>
                  </div>
                </div>

                {/* детализация состава заказа */}
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b-2 border-black bg-gray-50 font-bold uppercase text-xs">
                        <th className="p-4">Артикул</th>
                        <th className="p-4">Количество</th>
                        <th className="p-4 text-right">Цена</th>
                        <th className="p-4 text-right">Итого</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.article} className="border-b border-black hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-bold">{item.article}</td>
                          <td className="p-4">{item.quantity} шт.</td>
                          <td className="p-4 text-right">{item.unit_price} ₽</td>
                          <td className="p-4 text-right font-black">{item.total} ₽</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* дополнительная информация о заказе */}
                <div className="p-4 bg-gray-50 flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8 text-[10px] sm:text-xs font-bold uppercase border-t border-black">
                  <div className="flex items-center gap-2">
                    <PixelIcon.User />
                    <span>Клиент: {order.user_full_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PixelIcon.Clock />
                    <span>Доставка: {new Date(order.delivery_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PixelIcon.Tag />
                    <span>Код: {order.pickup_code}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
