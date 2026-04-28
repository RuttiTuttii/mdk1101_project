import { useState } from "react";
import { motion } from "framer-motion";
import { PixelIcon } from "../../components/Common/PixelIcon";
import { type AuthSession, type Product } from "@shared/types";
import { discountedPrice } from "@shared/catalog";

interface ProductPageProps {
  auth: AuthSession | null;
  product: Product | null;
  loading: boolean;
  error: string | null;
  onOrder: (article: string) => Promise<void>;
  onEdit: () => void;
  onDelete: (article: string) => Promise<void>;
  onGoLogin: () => void;
  onBack: () => void;
}

export function ProductPage({
  auth,
  product,
  loading,
  error,
  onOrder,
  onEdit,
  onDelete,
  onGoLogin,
  onBack,
}: ProductPageProps) {
  const [deleting, setDeleting] = useState(false);
  // отображение состояния загрузки
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-12 h-12 border-4 border-black border-t-transparent rounded-full"
        />
        <div className="text-2xl font-black uppercase">загрузка данных...</div>
      </div>
    );
  }

  // обработка отсутствия товара или ошибки
  if (!product || error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20 border-4 border-black bg-white"
      >
        <div className="w-16 h-16 mx-auto mb-6 opacity-20"><PixelIcon.Package /></div>
        <h2 className="text-3xl font-black uppercase mb-6">Товар не найден</h2>
        <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="px-10 py-4 border-4 border-black bg-[#00FA9A] font-black uppercase hover:bg-black hover:text-white transition-colors"
        >
            Назад в каталог
        </motion.button>
      </motion.div>
    );
  }

  const hasDiscount = product.discountPercent > 0;
  const isHighDiscount = product.discountPercent > 15;
  const outOfStock = product.stockCount === 0;

  return (
    <div className="space-y-8" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      {/* кнопка возврата в каталог */}
      <motion.button 
        whileHover={{ x: -5 }}
        className="flex items-center gap-2 font-black uppercase hover:underline" 
        onClick={onBack}
      >
        <PixelIcon.ArrowLeft />
        Назад к списку
      </motion.button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* блок изображения товара */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="border-4 border-black bg-white p-4 relative aspect-square flex items-center justify-center overflow-hidden group"
        >
            <motion.img
              whileHover={{ scale: 1.1 }}
              src={product.imagePath || "/picture.png"}
              alt={product.name}
              className="max-w-full max-h-full object-contain transition-transform"
              onError={(e) => { (e.target as HTMLImageElement).src = "/picture.png"; }}
            />
            {hasDiscount && (
                <motion.div 
                  initial={{ x: -100 }}
                  animate={{ x: 0 }}
                  className="absolute top-4 left-4 bg-red-600 text-white border-2 border-black px-4 py-2 text-2xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                    -{product.discountPercent}%
                </motion.div>
            )}
        </motion.div>

        {/* информационный блок товара */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6 lg:space-y-8"
        >
          <div>
            <div className="bg-[#7FFF00] border-2 border-black inline-block px-3 py-1 text-[10px] font-black uppercase mb-4">
                {product.category}
            </div>
            <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-tight mb-2">
                {product.name}
            </h1>
            <p className="text-sm font-bold opacity-60 uppercase tracking-widest flex items-center gap-2">
              <PixelIcon.Tag />
              Артикул: {product.article}
            </p>
          </div>

          <div className="border-4 border-black p-6 lg:p-8 bg-gray-50 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1">
                    <p className="font-bold text-[10px] uppercase opacity-60">Стоимость:</p>
                    {hasDiscount ? (
                        <div className="space-y-1">
                            <span className="text-xl sm:text-2xl line-through text-red-600 opacity-60">{product.price} ₽</span>
                            <p className="text-5xl lg:text-6xl font-black">{discountedPrice(product)} ₽</p>
                        </div>
                    ) : (
                        <p className="text-5xl lg:text-6xl font-black">{product.price} ₽</p>
                    )}
                </div>
                {isHighDiscount && (
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="bg-[#2E8B57] text-white border-2 border-black p-3 font-black uppercase text-center text-[10px] leading-tight"
                    >
                        ВЫГОДНОЕ<br/>ПРЕДЛОЖЕНИЕ
                    </motion.div>
                )}
            </div>

            {/* характеристики товара */}
            <div className="grid grid-cols-2 gap-4 border-t-2 border-black pt-6">
                <div className="space-y-1 group">
                    <div className="flex items-center gap-1 opacity-60 text-[10px] font-black uppercase">
                      <PixelIcon.Star />
                      Производитель
                    </div>
                    <p className="font-bold group-hover:underline">{product.manufacturer}</p>
                </div>
                <div className="space-y-1 group">
                    <div className="flex items-center gap-1 opacity-60 text-[10px] font-black uppercase">
                      <PixelIcon.Shield />
                      Поставщик
                    </div>
                    <p className="font-bold group-hover:underline">{product.supplier}</p>
                </div>
                <div className="space-y-1 group">
                    <div className="flex items-center gap-1 opacity-60 text-[10px] font-black uppercase">
                      <PixelIcon.Clock />
                      В наличии
                    </div>
                    <p className={outOfStock ? "text-red-600 font-black" : "font-bold"}>
                        {outOfStock ? "ОТСУТСТВУЕТ" : `${product.stockCount} ${product.unit}`}
                    </p>
                </div>
            </div>

            <div className="space-y-2 border-t-2 border-black pt-6">
                <p className="text-[10px] font-black uppercase opacity-60 flex items-center gap-1">
                  <PixelIcon.Package />
                  описание товара
                </p>
                <p className="text-sm leading-relaxed">{product.description}</p>
            </div>

            {/* кнопки заказа товара и управления */}
            <div className="pt-4 space-y-4">
                {auth ? (
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={outOfStock}
                        onClick={() => onOrder(product.article)}
                        className="w-full py-4 lg:py-5 border-4 border-black bg-[#00FA9A] font-black uppercase tracking-widest text-lg lg:text-xl hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-3"
                    >
                        <PixelIcon.Cart />
                        {outOfStock ? "НЕТ В НАЛИЧИИ" : "КУПИТЬ СЕЙЧАС"}
                    </motion.button>
                ) : (
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onGoLogin}
                        className="w-full py-4 lg:py-5 border-4 border-black bg-black text-white font-black uppercase tracking-widest text-lg lg:text-xl hover:bg-[#00FA9A] hover:text-black transition-colors flex items-center justify-center gap-3"
                    >
                        <PixelIcon.User />
                        ВОЙТИ И КУПИТЬ
                    </motion.button>
                )}

                {/* кнопки управления для админов и менеджеров */}
                {(auth?.role === "admin" || auth?.role === "manager") && (
                    <div className="flex gap-4 pt-4 border-t-2 border-black">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={onEdit}
                            className="flex-1 py-3 border-4 border-black bg-[#FFD700] font-black uppercase text-xs hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <PixelIcon.Edit /> редактировать
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            disabled={deleting}
                            onClick={async () => {
                                if (confirm("точно удалить этот товар?")) {
                                    setDeleting(true);
                                    await onDelete(product.article);
                                    setDeleting(false);
                                }
                            }}
                            className="flex-1 py-3 border-4 border-black bg-red-600 text-white font-black uppercase text-xs hover:bg-black transition-all flex items-center justify-center gap-2"
                        >
                            {deleting ? "удаление..." : <><PixelIcon.Trash /> удалить</>}
                        </motion.button>
                    </div>
                )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
