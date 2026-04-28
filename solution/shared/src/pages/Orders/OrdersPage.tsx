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
  onUpdateStatus: (number: number, newStatus: string, deliveryDate?: string) => Promise<void>;
}

export function OrdersPage({
  auth,
  orders,
  loading,
  error,
  onGoLogin,
  onRefresh,
}: OrdersPageProps) {
  // если не залогинен — показываем заглушку
  if (!auth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white border-4 border-black p-12 flex flex-col items-center text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="w-24 h-24 bg-white border-2 border-black flex items-center justify-center mb-8">
            <div className="w-16 h-16">
              <PixelIcon.Package />
            </div>
          </div>
          <h2 className="text-2xl font-bold uppercase mb-4 tracking-tighter">история заказов пуста</h2>
          <p className="text-gray-600 mb-8 lowercase">войдите в аккаунт, чтобы увидеть свои покупки и отслеживать статус доставки</p>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGoLogin}
            className="w-full py-4 bg-[#00FA9A] text-black font-black uppercase border-4 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-3"
          >
            <PixelIcon.Login />
            войти в аккаунт
          </motion.button>
        </motion.div>
      </div>
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
        <button 
            onClick={onRefresh}
            className="p-3 border-2 border-black bg-white font-bold hover:bg-black hover:text-white transition-colors uppercase text-sm flex items-center gap-2"
        >
          <PixelIcon.Refresh />
          {loading ? "обновление..." : "обновить данные"}
        </button>
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

      {/* если заказов нет — показываем белый бокс с иконкой по центру */}
      {orders.length === 0 && !loading ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-4 border-black p-20 text-center bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center"
        >
          <div className="w-32 h-32 bg-white border-4 border-black flex items-center justify-center mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
             <PixelIcon.Package width={64} height={64} />
           </div>
          <h3 className="text-2xl font-black uppercase tracking-tighter">заказов пока нет</h3>
          <p className="font-bold opacity-50 lowercase mt-2">ваша история покупок пуста, но это можно исправить в каталоге</p>
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

                  {/* кнопки управления для персонала */}
                  {isAdmin && (
                    <div className="p-4 border-t-4 border-black bg-white flex flex-wrap items-center gap-6">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase opacity-50">статус заказа</label>
                            <select 
                                value={order.status}
                                onChange={(e) => onUpdateStatus(order.number, e.target.value)}
                                className="border-2 border-black p-1 font-bold text-xs uppercase outline-none focus:bg-[#E0F2FE]"
                            >
                                {Object.entries(STATUS_MAP).map(([key, val]) => (
                                    <option key={key} value={key}>{val}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase opacity-50">дата доставки</label>
                            <input 
                                type="date"
                                value={new Date(order.delivery_date).toISOString().split("T")[0]}
                                onChange={(e) => {
                                    // по тз менеджер может менять и дату тоже
                                    onUpdateStatus(order.number, order.status, e.target.value);
                                }}
                                className="border-2 border-black p-1 font-bold text-xs uppercase outline-none focus:bg-[#E0F2FE]"
                            />
                        </div>
                    </div>
                  )}

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
