import React, { useState } from 'react';
import { useContent } from '../../../context/ContentContext';
import Field from '../components/Field';
import FileUpload from '../components/FileUpload';
import ColorsEditor from '../components/ColorsEditor';
import SizesEditor from '../components/SizesEditor';
import DetailsEditor from '../components/DetailsEditor';
import GalleryEditor from '../components/GalleryEditor';

const ProductsTab = () => {
    const { content, updateProduct, addProduct, deleteProduct } = useContent();
    const categories = content.catalog?.categories || [];
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [showAdd, setShowAdd] = useState(false);

    const [newProduct, setNewProduct] = useState({
        name: '', category: categories[0]?.key || 'Sofas', price: 0, image: '', description: '', specs: '', video: '',
        colors: [], sizes: [], details: {}, gallery: []
    });

    const startEdit = (product) => {
        setEditingId(product.id);
        setEditData({
            ...product,
            colors: product.colors || [],
            sizes: product.sizes || [],
            details: product.details || {},
            gallery: product.gallery || []
        });
    };

    const saveEdit = () => {
        updateProduct(editingId, editData);
        setEditingId(null);
    };

    const generateSlug = (name) => {
        const translitMap = {
            'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'j',
            'к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f',
            'х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
        };
        return name.toLowerCase()
            .split('')
            .map(ch => translitMap[ch] !== undefined ? translitMap[ch] : ch)
            .join('')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 80);
    };

    const handleAdd = () => {
        if (!newProduct.name) return;
        const slug = generateSlug(newProduct.name);
        if (!slug) return;
        addProduct({ ...newProduct, slug, price: parseInt(newProduct.price) || 0 });
        setNewProduct({ name: '', category: 'Sofas', price: 0, image: '', description: '', specs: '', video: '', colors: [], sizes: [], details: {}, gallery: [] });
        setShowAdd(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-semibold">Все товары ({content.products.length})</h2>
                <button onClick={() => setShowAdd(!showAdd)} className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition-colors">
                    {showAdd ? 'Отмена' : '+ Добавить товар'}
                </button>
            </div>

            {/* Add New Product Form */}
            {showAdd && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                    <h3 className="text-sm font-semibold mb-4 text-blue-800">Новый товар</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <Field label="Название" value={newProduct.name} onChange={v => setNewProduct({ ...newProduct, name: v })} />
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Категория</label>
                            <select
                                value={newProduct.category}
                                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-400 outline-none transition-colors"
                            >
                                {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                            </select>
                        </div>
                        <Field label="Цена (₽)" value={newProduct.price} onChange={v => setNewProduct({ ...newProduct, price: v })} type="number" />
                        <FileUpload label="Фото" value={newProduct.image} onChange={v => setNewProduct({ ...newProduct, image: v })} folder="products" />
                        <div className="md:col-span-2">
                            <Field label="Описание" value={newProduct.description} onChange={v => setNewProduct({ ...newProduct, description: v })} type="textarea" />
                        </div>
                        <Field label="Краткие размеры" value={newProduct.specs} onChange={v => setNewProduct({ ...newProduct, specs: v })} />
                        <FileUpload label="Видео" value={newProduct.video} onChange={v => setNewProduct({ ...newProduct, video: v })} folder="video" />

                        <div className="md:col-span-2 border-t border-blue-200 pt-6 mt-4">
                            <h4 className="font-semibold text-blue-800 mb-4">Детальные характеристики</h4>
                        </div>
                        <div className="md:col-span-2">
                            <ColorsEditor colors={newProduct.colors} onChange={v => setNewProduct({ ...newProduct, colors: v })} />
                        </div>
                        <div className="md:col-span-2">
                            <SizesEditor sizes={newProduct.sizes} onChange={v => setNewProduct({ ...newProduct, sizes: v })} />
                        </div>
                        <div className="md:col-span-2">
                            <DetailsEditor details={newProduct.details} onChange={v => setNewProduct({ ...newProduct, details: v })} />
                        </div>
                        <div className="md:col-span-2">
                            <GalleryEditor images={newProduct.gallery} onChange={v => setNewProduct({ ...newProduct, gallery: v })} folder="products" />
                        </div>
                    </div>
                    <button onClick={handleAdd} className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm mt-4 hover:bg-blue-700">
                        Сохранить товар
                    </button>
                </div>
            )}

            {/* Product List */}
            <div className="space-y-4">
                {content.products.map(product => (
                    <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        {editingId === product.id ? (
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                    <Field label="Название" value={editData.name} onChange={v => setEditData({ ...editData, name: v })} />
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Категория</label>
                                        <select
                                            value={editData.category}
                                            onChange={e => setEditData({ ...editData, category: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-400 outline-none transition-colors"
                                        >
                                            {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                                            {!categories.some(c => c.key === editData.category) && (
                                                <option value={editData.category}>{editData.category} (не в списке)</option>
                                            )}
                                        </select>
                                    </div>
                                    <Field label="Цена (₽)" value={editData.price} onChange={v => setEditData({ ...editData, price: parseInt(v) || 0 })} type="number" />
                                    <FileUpload label="Главное фото" value={editData.image} onChange={v => setEditData({ ...editData, image: v })} folder="products" />
                                    <div className="md:col-span-2">
                                        <Field label="Описание" value={editData.description} onChange={v => setEditData({ ...editData, description: v })} type="textarea" rows={4} />
                                    </div>
                                    <Field label="Краткие размеры" value={editData.specs} onChange={v => setEditData({ ...editData, specs: v })} />
                                    <FileUpload label="Видео" value={editData.video || ''} onChange={v => setEditData({ ...editData, video: v })} folder="video" />

                                    <div className="md:col-span-2 border-t border-gray-100 pt-6 mt-4">
                                        <h4 className="font-semibold text-gray-800 mb-4">Детальные характеристики</h4>
                                    </div>
                                    <div className="md:col-span-2">
                                        <ColorsEditor colors={editData.colors} onChange={v => setEditData({ ...editData, colors: v })} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <SizesEditor sizes={editData.sizes} onChange={v => setEditData({ ...editData, sizes: v })} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <DetailsEditor details={editData.details} onChange={v => setEditData({ ...editData, details: v })} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <GalleryEditor images={editData.gallery} onChange={v => setEditData({ ...editData, gallery: v })} folder="products" />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <button onClick={saveEdit} className="bg-green-600 text-white px-6 py-2 rounded-full text-sm hover:bg-green-700">Сохранить</button>
                                    <button onClick={() => setEditingId(null)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full text-sm hover:bg-gray-300">Отмена</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-6 p-4">
                                <img src={product.image} alt="" className="w-16 h-16 object-cover rounded-full bg-gray-100 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                                    <p className="text-xs text-gray-500">{categories.find(c => c.key === product.category)?.label || product.category} · {product.price.toLocaleString()} ₽</p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button onClick={() => startEdit(product)} className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full text-sm transition-colors">Изменить</button>
                                    <button onClick={() => { if (window.confirm('Удалить?')) deleteProduct(product.id) }} className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-full text-sm transition-colors">Удалить</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductsTab;
