import { motion } from "framer-motion";
import { ShoppingCart, User, ArrowLeft, Star, ShieldCheck, Clock, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { type AuthSession, type Product } from "@shared/types";
import { cn, formatMoney } from "@shared/lib/utils";
import { discountedPrice } from "@shared/catalog";


/**
 * детальная страница товара
 * тут юзер может всё внимательно рассмотреть перед покупкой
 */

interface ProductPageProps {
  auth: AuthSession | null;
  product: Product | null;
  loading: boolean;
  error: string | null;
  onOrder: (article: string) => Promise<void>;
  onGoLogin: () => void;
  onBack: () => void;
}

export function ProductPage({
  auth,
  product,
  loading,
  error,
  onOrder,
  onGoLogin,
  onBack,
}: ProductPageProps) {
  // пока грузимся — показываем скелетон, чтобы страница не «прыгала»
  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // если случилась беда (нет товара), пишем об этом
  if (!product || error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Товар не найден</h2>
        <Button onClick={onBack}>Вернуться в каталог</Button>
      </div>
    );
  }

  const hasDiscount = product.discountPercent > 0;
  const isHighDiscount = product.discountPercent > 15;
  const outOfStock = product.stockCount <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Вернуться в каталог
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* картинка. большая и красивая */}
        <motion.div
          layoutId={`image-${product.article}`}
          className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border"
        >
            <img
              src={product.imagePath ?? "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop"}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop"; }}
            />
          {hasDiscount && (
            <div className="absolute top-6 left-6">
              <Badge className="px-4 py-2 text-lg font-bold border-none shadow-xl bg-primary text-primary-foreground">
                -{product.discountPercent}%
              </Badge>
            </div>
          )}
        </motion.div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="uppercase tracking-widest text-[10px]">{product.category}</Badge>
              <Badge variant="outline" className="text-[10px]">арт. {product.article}</Badge>
            </div>
            <h1 className="text-5xl font-black tracking-tight leading-tight">{product.name}</h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{product.description}</p>
          </motion.div>

          {/* основные характеристики в виде плиток */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "производитель", value: product.manufacturer, icon: Star },
              { label: "поставщик", value: product.supplier, icon: ShieldCheck },
              { label: "на складе", value: `${product.stockCount} ${product.unit}`, icon: Clock },
              { label: "категория", value: product.category, icon: Package },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="p-4 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <item.icon className="h-5 w-5 mb-3 text-primary" />
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{item.label}</p>
                <p className="font-bold text-foreground">{item.value}</p>
              </motion.div>
            ))}
          </div>

          {/* блок покупки: цена и кнопка заказа */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className={cn(
              "p-8 border-none shadow-2xl transition-all duration-500",
              isHighDiscount ? "bg-primary text-primary-foreground" : "bg-card"
            )}>
              <div className="flex items-end justify-between mb-10">
                <div className="space-y-1">
                  {hasDiscount && (
                    <p className={cn("text-xl line-through opacity-60 decoration-destructive/50", isHighDiscount && "decoration-white/50")}>
                      {formatMoney(product.price)} ₽
                    </p>
                  )}
                  <p className="text-6xl font-black tracking-tighter">{formatMoney(discountedPrice(product))} <span className="text-xl font-normal opacity-70">₽</span></p>
                </div>
                {hasDiscount && (
                  <Badge variant="secondary" className="px-4 py-2 text-sm font-black bg-amber-400 text-amber-950 animate-bounce shadow-lg border-none">
                    ВЫГОДА {formatMoney(product.price - discountedPrice(product))} ₽
                  </Badge>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {auth ? (
                  <Button
                    size="lg"
                    disabled={outOfStock}
                    onClick={() => onOrder(product.article)}
                    className={cn(
                      "h-16 text-xl font-black rounded-2xl shadow-xl transition-all active:scale-95 gap-3",
                      isHighDiscount ? "bg-white text-primary hover:bg-white/90" : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    <ShoppingCart className="h-6 w-6" />
                    {outOfStock ? "НЕТ В НАЛИЧИИ" : "КУПИТЬ СЕЙЧАС"}
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    className="h-16 text-xl font-black rounded-2xl gap-3 bg-foreground text-background hover:bg-foreground/90" 
                    onClick={onGoLogin}
                  >
                    <User className="h-6 w-6" />
                    ВОЙТИ И КУПИТЬ
                  </Button>
                )}
                <p className="text-center text-xs opacity-50 font-medium">Бесплатная экспресс-доставка при заказе сегодня</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}


function PackageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
  );
}
