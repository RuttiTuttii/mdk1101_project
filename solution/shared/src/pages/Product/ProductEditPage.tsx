import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PixelIcon } from "../../components/Common/PixelIcon";
import { Button } from "../../ui";
import { apiCreateProduct, apiUpdateProduct } from "../../api";
import { type AuthSession, type Product } from "../../types";

interface ProductEditPageProps {
  auth: AuthSession | null;
  product: Product | null; // если null — значит создаём новый
  onSave: () => void;
  onBack: () => void;
}

export function ProductEditPage({ auth, product, onSave, onBack }: ProductEditPageProps) {
  const [formData, setFormData] = useState<any>({
    article: "",
    name: "",
    description: "",
    manufacturer: "",
    supplier: "",
    category: "",
    unit: "шт.",
    price: 0,
    max_discount_percent: 0,
    discount_percent: 0,
    stock_count: 0,
    image_path: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      // мапим camelCase из доменной модели в snake_case для формы и апи
      setFormData({
        article: product.article,
        name: product.name,
        description: product.description,
        manufacturer: product.manufacturer,
        supplier: product.supplier,
        category: product.category,
        unit: product.unit,
        price: product.price,
        max_discount_percent: (product as any).max_discount_percent ?? (product as any).maxDiscountPercent ?? 0,
        discount_percent: (product as any).discount_percent ?? (product as any).discountPercent ?? 0,
        stock_count: (product as any).stock_count ?? (product as any).stockCount ?? 0,
        image_path: (product as any).image_path ?? (product as any).imagePath ?? "",
      });
    }
  }, [product]);

  if (!auth || (auth.role !== "admin" && auth.role !== "manager")) {
    return <div className="p-10 text-center font-black uppercase text-2xl">доступ запрещен.</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ["price", "discount_percent", "max_discount_percent", "stock_count"].includes(name) 
        ? Number(value) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (product) {
        await apiUpdateProduct(auth.token, product.article, formData);
        setMessage("товар успешно обновлен.");
      } else {
        await apiCreateProduct(auth.token, formData);
        setMessage("новый товар создан.");
      }
      setTimeout(() => {
        onSave();
      }, 1500);
    } catch (err) {
      setMessage("ошибка при сохранении товара.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <button onClick={onBack} className="flex items-center gap-2 font-black uppercase hover:underline">
        <PixelIcon.ArrowLeft /> назад
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-4 border-black p-8 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
      >
        <h2 className="text-3xl font-black uppercase mb-8 border-b-4 border-black pb-4">
          {product ? `редактирование: ${product.name}` : "добавление нового товара"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase">артикул (уникальный)</label>
              <input 
                name="article" 
                value={formData.article} 
                onChange={handleChange} 
                disabled={!!product}
                required
                className="border-2 border-black p-2 font-bold focus:bg-[#E0F2FE] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase">наименование</label>
              <input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required
                className="border-2 border-black p-2 font-bold focus:bg-[#E0F2FE] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase">категория</label>
              <input 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                required
                className="border-2 border-black p-2 font-bold focus:bg-[#E0F2FE] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase">производитель</label>
              <input 
                name="manufacturer" 
                value={formData.manufacturer} 
                onChange={handleChange} 
                required
                className="border-2 border-black p-2 font-bold focus:bg-[#E0F2FE] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase">поставщик</label>
              <input 
                name="supplier" 
                value={formData.supplier} 
                onChange={handleChange} 
                required
                className="border-2 border-black p-2 font-bold focus:bg-[#E0F2FE] outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase">цена</label>
                <input 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange} 
                  required
                  className="border-2 border-black p-2 font-bold focus:bg-[#E0F2FE] outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase">макс. скидка %</label>
                <input 
                  type="number" 
                  name="max_discount_percent" 
                  value={formData.max_discount_percent} 
                  onChange={handleChange} 
                  className="border-2 border-black p-2 font-bold focus:bg-[#E0F2FE] outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase">скидка %</label>
                <input 
                  type="number" 
                  name="discount_percent" 
                  value={formData.discount_percent} 
                  onChange={handleChange} 
                  className="border-2 border-black p-2 font-bold focus:bg-[#E0F2FE] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase">остаток</label>
                <input 
                  type="number" 
                  name="stock_count" 
                  value={formData.stock_count} 
                  onChange={handleChange} 
                  className="border-2 border-black p-2 font-bold focus:bg-[#E0F2FE] outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase">ед. изм.</label>
                <input 
                  name="unit" 
                  value={formData.unit} 
                  onChange={handleChange} 
                  className="border-2 border-black p-2 font-bold focus:bg-[#E0F2FE] outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase">путь к фото</label>
              <input 
                name="image_path" 
                value={formData.image_path} 
                onChange={handleChange} 
                placeholder="folder/image.png"
                className="border-2 border-black p-2 font-bold focus:bg-[#E0F2FE] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-black uppercase">описание</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                rows={4}
                className="border-2 border-black p-2 font-bold focus:bg-[#E0F2FE] outline-none resize-none"
              />
            </div>
          </div>

          <div className="md:col-span-2 pt-6 flex items-center justify-between gap-4">
            {message && <div className="font-bold lowercase text-red-600">{message}</div>}
            <Button 
                type="submit" 
                disabled={loading}
                className="ml-auto px-12 py-4 bg-[#7FFF00] text-black border-4 border-black font-black uppercase hover:bg-black hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              {loading ? "сохранение..." : "сохранить товар"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
