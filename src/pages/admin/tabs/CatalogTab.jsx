import React, { useState } from 'react';
import { useContent } from '../../../context/ContentContext';
import { uploadFile } from '../../../utils/uploadToS3';

/* ─── Транслитерация для генерации key ─── */
const transliterate = (str) => {
    const map = {
        'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i',
        'й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t',
        'у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y',
        'ь':'','э':'e','ю':'yu','я':'ya',
    };
    return str.toLowerCase().split('').map(c => map[c] || c).join('').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
};

const CatalogTab = () => {
    const { content, reorderProducts, updateProduct, updateContentPage } = useContent();
    const products = content.products;
    const categories = content.catalog?.categories || [];

    /* ─── Категории: добавление ─── */
    const [newCatLabel, setNewCatLabel] = useState('');

    const addCategory = () => {
        const label = newCatLabel.trim();
        if (!label) return;
        // Генерируем key — PascalCase английский или транслит
        const key = label.split(' ').map(w => w.charAt(0).toUpperCase() + transliterate(w.slice(1))).join('');
        if (categories.some(c => c.key === key || c.label === label)) return;
        const updated = [...categories, { key, label }];
        updateContentPage('catalog', 'categories', updated);
        setNewCatLabel('');
    };

    const removeCategory = (key) => {
        // Проверяем, есть ли товары с этой категорией
        const count = products.filter(p => p.category === key).length;
        if (count > 0) {
            if (!window.confirm(`В этой категории ${count} товар(ов). Удалить категорию? Товары останутся без категории.`)) return;
        }
        const updated = categories.filter(c => c.key !== key);
        updateContentPage('catalog', 'categories', updated);
    };

    const moveCategoryUp = (index) => {
        if (index === 0) return;
        const updated = [...categories];
        [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
        updateContentPage('catalog', 'categories', updated);
    };

    const moveCategoryDown = (index) => {
        if (index === categories.length - 1) return;
        const updated = [...categories];
        [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
        updateContentPage('catalog', 'categories', updated);
    };

    const renameCategory = (index, newLabel) => {
        const updated = [...categories];
        updated[index] = { ...updated[index], label: newLabel };
        updateContentPage('catalog', 'categories', updated);
    };

    /* ─── Товары: порядок ─── */
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

    /* ─── Количество товаров в категории ─── */
    const countByCategory = (key) => products.filter(p => p.category === key).length;

    return (
        <div>
            <h2 className="text-xl font-semibold mb-2">Настройка Каталога</h2>
            <p className="text-sm text-gray-500 mb-8">Управляйте категориями, порядком товаров и информацией для карточек.</p>

            {/* ═══ КАТЕГОРИИ КАТАЛОГА ═══ */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-700">🏷 Категории каталога</h3>
                    <span className="text-xs text-gray-400">{categories.length} категорий</span>
                </div>
                <p className="text-xs text-gray-400 mb-6">Добавляйте, удаляйте и меняйте порядок категорий. Они отображаются как пиллы (кнопки) в каталоге.</p>

                {/* Список категорий */}
                <div className="space-y-2 mb-6">
                    {categories.map((cat, index) => (
                        <div key={cat.key} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 group hover:bg-blue-50 transition-colors">
                            {/* Стрелки порядка */}
                            <div className="flex flex-col gap-0.5">
                                <button
                                    onClick={() => moveCategoryUp(index)}
                                    disabled={index === 0}
                                    className="text-[10px] text-gray-400 hover:text-blue-600 disabled:opacity-20 transition-colors"
                                >▲</button>
                                <button
                                    onClick={() => moveCategoryDown(index)}
                                    disabled={index === categories.length - 1}
                                    className="text-[10px] text-gray-400 hover:text-blue-600 disabled:opacity-20 transition-colors"
                                >▼</button>
                            </div>

                            {/* Номер */}
                            <span className="text-xs font-mono text-gray-300 w-5 text-center">{index + 1}</span>

                            {/* Название (редактируемое) */}
                            <input
                                value={cat.label}
                                onChange={(e) => renameCategory(index, e.target.value)}
                                className="flex-1 text-sm text-gray-800 bg-transparent border-none outline-none focus:text-blue-700 transition-colors"
                            />

                            {/* Key (readonly) */}
                            <span className="text-[10px] text-gray-300 font-mono hidden md:block">{cat.key}</span>

                            {/* Счётчик товаров */}
                            <span className="text-[10px] text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
                                {countByCategory(cat.key)} тов.
                            </span>

                            {/* Удалить */}
                            <button
                                onClick={() => removeCategory(cat.key)}
                                className="text-gray-300 hover:text-red-500 transition-colors text-xs opacity-0 group-hover:opacity-100"
                                title="Удалить категорию"
                            >✕</button>
                        </div>
                    ))}
                </div>

                {/* Добавить категорию */}
                <div className="flex gap-3">
                    <input
                        value={newCatLabel}
                        onChange={(e) => setNewCatLabel(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                        placeholder="Новая категория (например: Кровати)"
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-400 outline-none transition-colors"
                    />
                    <button
                        onClick={addCategory}
                        disabled={!newCatLabel.trim()}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        + Добавить
                    </button>
                </div>
            </div>

            {/* ═══ ТЕКСТ НА КАРТОЧКЕ ТОВАРА ═══ */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">✏️ Текст на странице товара</h3>
                <p className="text-xs text-gray-400 mb-6">Заголовок и подпись в секции «В интерьере» на каждой карточке товара.</p>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-semibold">Заголовок</label>
                        <input
                            value={content.catalog?.interiorQuote || ''}
                            onChange={(e) => updateContentPage('catalog', 'interiorQuote', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-400 outline-none transition-colors"
                            placeholder="Детали создают совершенство"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-semibold">Подпись</label>
                        <input
                            value={content.catalog?.interiorSubtext || ''}
                            onChange={(e) => updateContentPage('catalog', 'interiorSubtext', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-400 outline-none transition-colors"
                            placeholder="Каждый шов, каждый изгиб выверен с точностью до миллиметра."
                        />
                    </div>
                </div>
            </div>

            {/* ═══ ПОРЯДОК ТОВАРОВ ═══ */}
            <h3 className="text-sm font-semibold text-gray-700 mb-4">📦 Порядок товаров</h3>
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
                                <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2 font-semibold">Категория</label>
                                <select
                                    value={product.category}
                                    onChange={(e) => updateProduct(product.id, { category: e.target.value })}
                                    className="w-full text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.key} value={cat.key}>{cat.label}</option>
                                    ))}
                                    {/* Если товар в категории, которой нет в списке */}
                                    {!categories.some(c => c.key === product.category) && (
                                        <option value={product.category}>{product.category} (не в списке)</option>
                                    )}
                                </select>
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
