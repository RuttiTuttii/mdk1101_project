import { type Product } from "@shared/types";
import { discountedPrice } from "@shared/catalog";

interface ProductCardProps {
  product: Product;
  onOrder: (article: string) => Promise<void>;
  onOpen: () => void;
}

export function ProductCard({
  product,
  onOrder,
  onOpen,
}: ProductCardProps) {
  const hasDiscount = product.discountPercent > 0;
  const isHighDiscount = product.discountPercent > 15;
  const isOutOfStock = product.stockCount === 0;
  
  // Цветовая логика по ТЗ:
  // - Если скидка > 15%, фон #2E8B57 (Sea Green)
  // - Если товара нет на складе, фон голубой (light blue)
  // - В остальных случаях белый
  const getBgColor = () => {
    if (isHighDiscount) return "#2E8B57";
    if (isOutOfStock) return "#E0F2FE"; // Голубой
    return "#FFFFFF";
  };

  const bgColor = getBgColor();
  const textColor = isHighDiscount ? "#FFFFFF" : "#000000";

  return (
    <div 
      className="border-2 border-black p-4 flex gap-6 cursor-pointer hover:opacity-95 transition-opacity mb-4"
      style={{ 
        backgroundColor: bgColor, 
        color: textColor, 
        fontFamily: "'Times New Roman', Times, serif" 
      }}
      onClick={onOpen}
    >
      {/* Фото слева */}
      <div className="w-48 h-48 border border-black flex-shrink-0 bg-white flex items-center justify-center overflow-hidden">
        <img
          src={product.imagePath ?? "/picture.png"}
          alt={product.name}
          className="w-full h-full object-contain p-2"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/picture.png";
          }}
        />
      </div>

      {/* Инфо в центре */}
      <div className="flex-grow space-y-1 text-sm">
        <div className="border border-black p-2 mb-3 bg-white/10 flex justify-between items-center">
            <span className="font-bold text-base">
                {product.category} | {product.name}
            </span>
        </div>
        
        <div className="grid grid-cols-[150px_1fr] gap-x-2 gap-y-1">
            <span className="font-bold">Описание товара:</span>
            <span>{product.description}</span>
            
            <span className="font-bold">Производитель:</span>
            <span>{product.manufacturer}</span>
            
            <span className="font-bold">Поставщик:</span>
            <span>{product.supplier}</span>
            
            <span className="font-bold">Цена:</span>
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
            
            <span className="font-bold">Единица измерения:</span>
            <span>{product.unit}</span>
            
            <span className="font-bold">Количество на складе:</span>
            <span>{product.stockCount}</span>
        </div>
      </div>

      {/* Скидка и кнопка справа */}
      <div className="w-40 flex flex-col items-center justify-between border-l border-black pl-4 py-2">
        <div className="flex-grow flex flex-col items-center justify-center">
            {hasDiscount && (
                <div className="border-2 border-black p-2 text-center bg-white/20">
                    <p className="text-[10px] uppercase font-bold leading-tight">Действующая<br/>скидка</p>
                    <p className="text-3xl font-black">{product.discountPercent}%</p>
                </div>
            )}
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOrder(product.article);
          }}
          className="w-full py-2 border-2 border-black font-bold uppercase tracking-wider transition-colors hover:bg-black hover:text-white"
          style={{ backgroundColor: "#00FA9A" }}
        >
          Купить
        </button>
      </div>
    </div>
  );
}
