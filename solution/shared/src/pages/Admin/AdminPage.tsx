import { useState } from "react";
import { PixelIcon } from "../../components/Common/PixelIcon";
import { PixelCheckbox } from "../../components/Common/PixelCheckbox";
import { Button } from "../../ui";
import { apiAdminParseFile, apiAdminImportProducts } from "../../api";
import type { ApiProduct, AuthSession } from "../../types";

interface AdminPageProps {
  auth: AuthSession | null;
  onNavigate: (route: any) => void;
  setMessage: (msg: string | null) => void;
}

export function AdminPage({ auth, onNavigate, setMessage }: AdminPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewItems, setPreviewItems] = useState<ApiProduct[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // только админ может сюда заходить
  if (!auth || auth.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-24 h-24 bg-white border-4 border-black mb-6 flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
           <PixelIcon.Close />
        </div>
        <h2 className="text-2xl font-black uppercase mb-2">доступ запрещен</h2>
        <p className="max-w-md opacity-60 font-bold">у тебя недостаточно прав для просмотра этой страницы. обратись к главному администратору.</p>
        <Button onClick={() => onNavigate({ name: "catalog" })} className="mt-8">вернуться в каталог</Button>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleParse = async () => {
    if (!file) return;
    try {
      setLoading(true);
      const items = await apiAdminParseFile(auth.token, file);
      setPreviewItems(items);
      // по умолчанию выбираем все
      setSelectedArticles(new Set(items.map(i => i.article)));
      setMessage("файл обработан, выбери товары для импорта.");
    } catch (err) {
      setMessage("ошибка при чтении файла.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (article: string) => {
    const next = new Set(selectedArticles);
    if (next.has(article)) next.delete(article);
    else next.add(article);
    setSelectedArticles(next);
  };

  const handleImport = async () => {
    const toImport = previewItems
      .filter(i => selectedArticles.has(i.article))
      .map(i => ({
        article: i.article,
        name: i.name,
        description: i.description,
        manufacturer: i.manufacturer,
        supplier: i.supplier,
        category: i.category,
        unit: i.unit,
        price: i.price,
        max_discount_percent: i.max_discount_percent,
        discount_percent: i.discount_percent,
        stock_count: i.stock_count,
        image_path: i.image_path
      }));

    if (toImport.length === 0) return;
    
    try {
      setLoading(true);
      const result = await apiAdminImportProducts(auth.token, toImport);
      setMessage(`успех: обработано ${result.count} товаров.`);
      setPreviewItems([]);
      setSelectedArticles(new Set());
      setFile(null);
    } catch (err) {
      setMessage("ошибка при сохранении данных в базу.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase opacity-60">админ-панель</p>
        <h1 className="text-4xl font-black uppercase tracking-tighter">импорт данных</h1>
        <p className="font-bold opacity-80">загружай csv файлы для массового обновления каталога обуви.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* зона загрузки */}
        <section className="lg:col-span-1">
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#7FFF00] border-2 border-black flex items-center justify-center">
                <PixelIcon.Import />
              </div>
              <h3 className="font-black uppercase text-xl">выбор файла</h3>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase">файл (csv или xlsx)</label>
              <div className="relative">
                <input 
                  id="admin-file-input"
                  type="file" 
                  accept=".csv, .xlsx, .xls" 
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button 
                  type="button"
                  onClick={() => document.getElementById("admin-file-input")?.click()}
                  className="w-full bg-[#00FA9A] text-black border-2 border-black hover:bg-black hover:text-white"
                >
                  {file ? file.name : "выберите файл"}
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleParse} 
              disabled={!file || loading}
              className="w-full bg-[#7FFF00] text-black border-4 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              {loading ? "обрабатываем..." : "распознать данные"}
            </Button>
          </div>
        </section>

        {/* превью данных */}
        <section className="lg:col-span-2">
          {previewItems.length > 0 ? (
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden">
              <div className="p-4 border-b-4 border-black flex items-center justify-between bg-gray-50">
                <h3 className="font-black uppercase">найдено товаров: {previewItems.length}</h3>
                <div className="flex gap-4">
                   <span className="font-bold text-xs uppercase">выбрано: {selectedArticles.size}</span>
                   <Button onClick={handleImport} disabled={loading || selectedArticles.size === 0}>импортировать выбранные</Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black text-white text-[10px] uppercase font-bold">
                      <th className="p-3 border-r border-white/20"></th>
                      <th className="p-3 border-r border-white/20">артикул</th>
                      <th className="p-3 border-r border-white/20">название</th>
                      <th className="p-3 border-r border-white/20">ед. изм</th>
                      <th className="p-3 border-r border-white/20">цена</th>
                      <th className="p-3 border-r border-white/20">поставщик</th>
                      <th className="p-3 border-r border-white/20">производитель</th>
                      <th className="p-3 border-r border-white/20">категория</th>
                      <th className="p-3 border-r border-white/20">скидка</th>
                      <th className="p-3">склад</th>
                    </tr>
                  </thead>
                  <tbody className="font-bold text-sm">
                    {previewItems.map((item) => (
                      <tr key={item.article} className="border-b-2 border-black hover:bg-gray-50">
                        <td className="p-3 border-r-2 border-black text-center">
                          <PixelCheckbox 
                            checked={selectedArticles.has(item.article)}
                            onChange={() => toggleSelect(item.article)}
                          />
                        </td>
                        <td className="p-3 border-r-2 border-black">{item.article}</td>
                        <td className="p-3 border-r-2 border-black">{item.name}</td>
                        <td className="p-3 border-r-2 border-black text-center">{item.unit}</td>
                        <td className="p-3 border-r-2 border-black font-bold">{item.price}</td>
                        <td className="p-3 border-r-2 border-black text-xs">{item.supplier}</td>
                        <td className="p-3 border-r-2 border-black text-xs">{item.manufacturer}</td>
                        <td className="p-3 border-r-2 border-black text-xs">{item.category}</td>
                        <td className="p-3 border-r-2 border-black">{item.discount_percent}%</td>
                        <td className="p-3 font-bold">{item.stock_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white border-4 border-black border-dashed min-h-[400px] flex flex-col items-center justify-center text-center opacity-40 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-24 h-24 border-4 border-black rounded-full mb-6 flex items-center justify-center bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                 <PixelIcon.Import width={48} height={48} />
              </div>
              <h4 className="font-black uppercase text-2xl tracking-tighter">превью пусто</h4>
              <p className="text-sm font-bold max-w-xs mt-2">загрузи файл слева, чтобы увидеть список товаров перед импортом.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
