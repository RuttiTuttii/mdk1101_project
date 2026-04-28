import { motion } from "framer-motion";
import { PixelIcon } from "@shared/components/Common/PixelIcon";
import { type Product } from "@shared/types";
import { discountedPrice } from "@shared/catalog";

interface ProductCardProps {
  product: Product;
  index: number;
  onOrder: (article: string) => Promise<void>;
  onOpen: () => void;
}

export function ProductCard({
  product,
  index,
  onOrder,
  onOpen,
}: ProductCardProps) {
  const hasDiscount = product.discountPercent > 0;
  const isHighDiscount = product.discountPercent > 15;
  const isOutOfStock = product.stockCount === 0;
  
  // определение цвета фона на основе условий тз
  const getBgColor = () => {
    if (isOutOfStock) return "#0000ff"; // синий для пустых остатков
    if (isHighDiscount) return "#7fff00"; // салатовый для больших скидок
    return "#FFFFFF";
  };

  const bgColor = getBgColor();
  const textColor = isOutOfStock ? "#FFFFFF" : "#000000";

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ 
        scale: 1.02, 
        translateY: -4,
        translateX: -4,
        boxShadow: "12px 12px 0px 0px rgba(0,0,0,1)",
        transition: { duration: 0.2 } 
      }}
      className="border-4 border-black p-4 flex flex-col md:flex-row gap-4 md:gap-6 cursor-pointer mb-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
      style={{ 
        backgroundColor: bgColor, 
        color: textColor, 
        fontFamily: "'Times New Roman', Times, serif" 
      }}
      onClick={onOpen}
    >
      {/* блок с изображением товара */}
      <div className="w-full md:w-48 h-48 md:h-48 border border-black flex-shrink-0 bg-white flex items-center justify-center overflow-hidden group">
        <motion.img
          whileHover={{ scale: 1.1 }}
          src={product.imagePath || "/picture.png"}
          alt={product.name}
          className="w-full h-full object-contain p-2"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/picture.png";
          }}
        />
      </div>

      {/* основная информация о товаре */}
      <div className="flex-grow space-y-2 text-sm">
        <div className="border border-black p-2 bg-white/10 flex justify-between items-center">
            <span className="font-bold text-base">
                {product.category} | {product.name}
            </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-x-2 gap-y-1">
            <span className="font-bold sm:text-left text-xs sm:text-sm text-black/60 sm:text-current">Описание товара:</span>
            <span>{product.description}</span>
            
            <span className="font-bold sm:text-left text-xs sm:text-sm text-black/60 sm:text-current mt-2 sm:mt-0">Производитель:</span>
            <span>{product.manufacturer}</span>
            
            <span className="font-bold sm:text-left text-xs sm:text-sm text-black/60 sm:text-current mt-2 sm:mt-0">Поставщик:</span>
            <span>{product.supplier}</span>
            
            <span className="font-bold sm:text-left text-xs sm:text-sm text-black/60 sm:text-current mt-2 sm:mt-0">Цена:</span>
            <div className="flex items-center gap-2">
                {hasDiscount ? (
                    <>
                        <span className="text-red-500 line-through">{product.price}</span>
                        <span className="font-bold">{discountedPrice(product)}</span>
                    </>
                ) : (
                    <span className="font-bold">{product.price}</span>
                )}
            </div>
            
            <span className="font-bold sm:text-left text-xs sm:text-sm text-black/60 sm:text-current mt-2 sm:mt-0">Единица измерения:</span>
            <span>{product.unit}</span>
            
            <span className="font-bold sm:text-left text-xs sm:text-sm text-black/60 sm:text-current mt-2 sm:mt-0">Количество на складе:</span>
            <span>{product.stockCount}</span>
        </div>
      </div>

      {/* блок управления покупкой и отображения скидки */}
      <div className="w-full md:w-40 flex flex-row md:flex-col items-center justify-between md:border-l border-t md:border-t-0 border-black md:pl-4 pt-4 md:pt-2 md:py-2 gap-4">
        <div className="flex-grow flex flex-col items-center justify-center">
            {hasDiscount && (
                <motion.div 
                  animate={isHighDiscount ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="border-2 border-black p-2 text-center bg-white/20"
                >
                    <p className="text-[10px] uppercase font-bold leading-tight">Действующая<br/>скидка</p>
                    <p className="text-3xl font-black">{product.discountPercent}%</p>
                </motion.div>
            )}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onOrder(product.article);
          }}
          className="w-full md:w-auto px-6 md:px-0 py-3 md:py-2 border-2 border-black font-bold uppercase tracking-wider transition-colors hover:bg-black hover:text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: "#00FA9A" }}
        >
          <PixelIcon.Cart />
          Купить
        </motion.button>
      </div>
    </motion.div>
  );
}
