import React from 'react';
import { useContent } from '../../../context/ContentContext';
import { uploadFile } from '../../../utils/uploadToS3';

const CatalogTab = () => {
    const { content, reorderProducts, updateProduct } = useContent();
    const products = content.products;

    const moveUp = (index) => {
        if (index === 0) return;
        const newOrder = [...products];
        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        reorderProducts(newOrder);
    };

    const moveDown = (index) => {
        if (index === products.length - 1) return;
        const newOrder = [...products];
        [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
        reorderProducts(newOrder);
    };

    const handleImageUpload = async (e, productId) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const url = await uploadFile(file, 'products');
            updateProduct(productId, { image: url });
        } catch (err) {
            console.error('Catalog image upload failed:', err);
            const reader = new FileReader();
            reader.onloadend = () => updateProduct(productId, { image: reader.result });
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-2">Настройка Каталога</h2>
            <p className="text-sm text-gray-500 mb-8">Меняйте порядок товаров и редактируйте информацию для карточки.</p>

            <div className="space-y-6">
                {products.map((product, index) => (
                    <div key={product.id} className="group bg-white border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row gap-8 items-start hover:shadow-lg transition-all duration-300">
                        {/* Order Controls */}
                        <div className="flex flex-row md:flex-col gap-2 items-center justify-center bg-gray-50 rounded-xl p-2 md:w-12 shrink-0 self-stretch md:self-auto">
                            <button
                                onClick={() => moveUp(index)}
                                disabled={index === 0}
                                className="w-full p-2 rounded-full hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all text-gray-500 hover:text-blue-600"
                            >
                                ▲
                            </button>
                            <span className="font-mono font-bold text-gray-400 text-sm">{index + 1}</span>
                            <button
                                onClick={() => moveDown(index)}
                                disabled={index === products.length - 1}
                                className="w-full p-2 rounded-full hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all text-gray-500 hover:text-blue-600"
                            >
                                ▼
                            </button>
                        </div>

                        {/* Image Section */}
                        <div className="w-full md:w-64 shrink-0">
                            <label className="text-[10px] uppercase tracking-widest text-gray-400 mb-3 block font-semibold">Обложка</label>
                            <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group-hover:border-blue-200 transition-colors shadow-sm">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                    <label className="cursor-pointer opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                        <div className="bg-white text-gray-800 px-4 py-2 rounded-full text-xs font-medium shadow-lg hover:bg-blue-50 flex items-center gap-2">
                                            <span>📷</span> Изменить
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, product.id)}
                                        />
                                    </label>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 text-center mt-2 group-hover:opacity-0 transition-opacity">Наведите, чтобы изменить</p>
                        </div>

                        {/* Details Section */}
                        <div className="flex-1 w-full space-y-5 pt-1">
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-semibold">Название товара</label>
                                <input
                                    value={product.name}
                                    onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                                    className="w-full text-xl font-serif text-gray-900 border-b border-gray-200 py-2 focus:border-blue-500 outline-none transition-colors bg-transparent placeholder-gray-300"
                                    placeholder="Название..."
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-semibold">Краткое описание</label>
                                <textarea
                                    value={product.description}
                                    onChange={(e) => updateProduct(product.id, { description: e.target.value })}
                                    rows={3}
                                    className="w-full text-sm text-gray-600 bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none leading-relaxed"
                                    placeholder="Краткое описание для карточки..."
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CatalogTab;
