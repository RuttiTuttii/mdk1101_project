import { motion, AnimatePresence } from "framer-motion";
import { Package, ChevronRight, User, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type ApiOrder, type AuthSession } from "@shared/types";
import { formatMoney } from "@shared/lib/utils";


/**
 * страница со списком заказов
 * админы видят всё, обычные люди — только свои
 */

// маппинг статусов, чтобы не пугать юзеров английскими терминами
const STATUS_MAP: Record<string, string> = {
  new: "Новый",
  processing: "В обработке",
  shipped: "Отправлен",
  done: "Выполнен",
  canceled: "Отменён",
};

function displayStatus(status: string): string {
  return STATUS_MAP[status] ?? status;
}

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
  onUpdateStatus,
}: OrdersPageProps) {
  // если зашел аноним — отправляем его логиниться
  if (!auth) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-8 shadow-inner">
          <Package className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-3xl font-black tracking-tight mb-3">Ваши заказы</h2>
        <p className="text-muted-foreground mb-10 max-w-sm text-lg">Войдите в систему, чтобы увидеть историю ваших покупок и управлять заказами</p>
        <Button onClick={onGoLogin} size="lg" className="rounded-full px-12 font-bold shadow-xl shadow-primary/20">
          Войти в аккаунт
        </Button>
      </div>
    );
  }

  const isAdmin = auth.role === "admin" || auth.role === "manager";

  return (
    <div className="min-h-[80vh] flex flex-col space-y-8 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tight">
            {isAdmin ? "Управление заказами" : "Мои заказы"}
          </h2>
          <p className="text-muted-foreground text-lg">
            {isAdmin ? "Просмотр и изменение статусов всех заказов в системе" : "История и текущее состояние ваших покупок"}
          </p>
        </div>
        <Button variant="outline" size="lg" onClick={onRefresh} disabled={loading} className="rounded-full gap-2">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Обновить
        </Button>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4 text-destructive text-sm">{error}</CardContent>
        </Card>
      )}

      {loading && orders.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-24 bg-slate-50 rounded-xl" />
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-bold">Заказов пока нет</h3>
          <p className="text-slate-500">Как только вы оформите первый заказ, он появится здесь</p>
        </Card>
      ) : (
        <motion.div
          layout
          className="grid gap-4"
        >
          <AnimatePresence mode="popLayout">
            {orders.map((order, index) => (
              <motion.div
                key={order.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden border-none shadow-lg bg-card/50 backdrop-blur-sm group hover:shadow-2xl transition-all duration-500">
                  <CardHeader className="bg-muted/30 py-6 border-b">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-background border-2 border-primary/20 flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-110 transition-transform">
                          #{order.number}
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-xl font-bold">Заказ №{order.number}</CardTitle>
                          <CardDescription className="font-medium">от {new Date(order.created_at).toLocaleDateString()}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {/* если админ — даем менять статус прямо в списке */}
                        {isAdmin ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Статус</span>
                            <select
                              className="text-sm border-none rounded-lg px-3 py-2 bg-background shadow-sm focus:ring-2 ring-primary/20 transition-all font-bold"
                              value={order.status}
                              onChange={(e) => onUpdateStatus(order.number, e.target.value)}
                            >
                              {Object.keys(STATUS_MAP).map((s) => (
                                <option key={s} value={s}>{STATUS_MAP[s]}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                             <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Статус</span>
                             <Badge className="bg-primary/20 text-primary border-none shadow-sm font-bold">
                                {displayStatus(order.status)}
                             </Badge>
                          </div>
                        )}
                        <div className="text-right border-l pl-6">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Итоговая сумма</p>
                          <p className="font-black text-2xl tracking-tighter text-primary">{formatMoney(Number(order.total))} <span className="text-sm font-normal opacity-70">₽</span></p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-white">
                        <TableRow>
                          <TableHead className="w-[100px]">Артикул</TableHead>
                          <TableHead>Кол-во</TableHead>
                          <TableHead className="text-right">Цена за ед.</TableHead>
                          <TableHead className="text-right">Итого</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item) => (
                          <TableRow key={item.article}>
                            <TableCell className="font-medium">{item.article}</TableCell>
                            <TableCell>{item.quantity} шт.</TableCell>
                            <TableCell className="text-right">{formatMoney(Number(item.unit_price))} ₽</TableCell>
                            <TableCell className="text-right font-bold">{formatMoney(Number(item.total))} ₽</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {/* доп инфа о доставке и клиенте */}
                    <div className="p-4 bg-slate-50/30 border-t flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-500">Клиент:</span>
                        <span className="font-medium">{order.user_full_name} ({order.user_login})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-500">Доставка:</span>
                        <span className="font-medium">{new Date(order.delivery_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-slate-200 text-slate-700">Код: {order.pickup_code}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
