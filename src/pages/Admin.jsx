import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { isSessionValid, destroySession } from './Login';
import { uploadFile } from '../utils/uploadToS3';

// ─── File Upload Component ───
const FileUpload = ({ label, value, onChange, folder = 'pages' }) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError('');
        try {
            const isVideo = file.type.startsWith('video/');
            const effectiveFolder = isVideo ? 'video' : folder;
            const url = await uploadFile(file, effectiveFolder);
            onChange(url);
        } catch (err) {
            console.error('Upload failed:', err);
            setError('S3 недоступен, сохранено локально');
            // Fallback: base64
            const reader = new FileReader();
            reader.onloadend = () => onChange(reader.result);
            reader.readAsDataURL(file);
        } finally {
            setUploading(false);
        }
    };

    const isVideoValue = value && (value.startsWith('data:video') || value.endsWith('.mp4') || value.endsWith('.webm'));

    return (
        <div className="mb-6">
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">{label}</label>
            <div className="flex items-center gap-4">
                {value && (
                    <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                        {isVideoValue ? (
                            <video src={value} className="w-full h-full object-cover" />
                        ) : (
                            <img src={value} alt="Preview" className="w-full h-full object-cover" />
                        )}
                    </div>
                )}
                <div className="flex-1">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Или вставьте URL..."
                        className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="relative">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*,video/*"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            disabled={uploading}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {uploading ? (
                                <><span className="animate-spin inline-block">⏳</span> Загрузка на S3...</>
                            ) : (
                                <><span>📂</span> Загрузить с компьютера</>
                            )}
                        </button>
                        {error && <p className="text-[10px] text-amber-600 mt-1">{error}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Gallery Editor Component (Multi-upload) ───
const GalleryEditor = ({ images = [], onChange, folder = 'products' }) => {
    const isVideo = (url) => url && url.match(/\.(mp4|webm|ogg)$/i);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const urls = await Promise.all(
                files.map(file => uploadFile(file, folder))
            );
            onChange([...images, ...urls]);
        } catch (err) {
            console.error('Gallery upload failed:', err);
            // Fallback: base64
            const promises = files.map(file => new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            }));
            const fallbackUrls = await Promise.all(promises);
            onChange([...images, ...fallbackUrls]);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        onChange(images.filter((_, i) => i !== index));
    };

    const moveImage = (index, direction) => {
        if ((direction === -1 && index === 0) || (direction === 1 && index === images.length - 1)) return;
        const newImages = [...images];
        const temp = newImages[index];
        newImages[index] = newImages[index + direction];
        newImages[index + direction] = temp;
        onChange(newImages);
    };

    return (
        <div className="mb-6">
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Галерея</label>

            {/* Grid of existing images */}
            {images.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden group border border-gray-200">
                            {isVideo(img) ? (
                                <video src={img} className="w-full h-full object-cover" muted playsInline />
                            ) : (
                                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                            )}
                            <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveImage(idx, -1); }}
                                    disabled={idx === 0}
                                    className="bg-white/80 backdrop-blur text-gray-700 rounded-full w-6 h-6 flex items-center justify-center shadow-sm hover:bg-white disabled:opacity-30"
                                    title="Влево (Выше)"
                                >
                                    ←
                                </button>
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveImage(idx, 1); }}
                                    disabled={idx === images.length - 1}
                                    className="bg-white/80 backdrop-blur text-gray-700 rounded-full w-6 h-6 flex items-center justify-center shadow-sm hover:bg-white disabled:opacity-30"
                                    title="Вправо (Ниже)"
                                >
                                    →
                                </button>
                            </div>
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeImage(idx); }}
                                className="absolute top-2 right-2 bg-white/80 backdrop-blur text-red-500 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-red-50"
                                title="Удалить"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Button */}
            <label className={`cursor-pointer inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-4 py-3 rounded-full text-xs uppercase tracking-wider transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploading ? (
                    <><span className="animate-spin inline-block">⏳</span> Загрузка на S3...</>
                ) : (
                    <><span className="text-lg">＋</span> Добавить фото</>
                )}
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={uploading}
                />
            </label>
            <p className="text-[10px] text-gray-400 mt-2">Можно выбрать несколько файлов сразу. Они загрузятся на S3.</p>
        </div>
    );
};

// ─── Colors Editor ───
const ColorsEditor = ({ colors = [], onChange }) => {
    const addColor = () => onChange([...colors, { name: '', hex: '#000000' }]);
    const updateColor = (idx, field, val) => {
        const newColors = [...colors];
        newColors[idx][field] = val;
        onChange(newColors);
    };
    const removeColor = (idx) => onChange(colors.filter((_, i) => i !== idx));

    return (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Цвета</label>
            <div className="space-y-3 mb-3">
                {colors.map((c, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                        <input type="color" value={c.hex} onChange={e => updateColor(idx, 'hex', e.target.value)} className="w-8 h-8 rounded shrink-0" />
                        <input type="text" value={c.name} onChange={e => updateColor(idx, 'name', e.target.value)} placeholder="Название" className="flex-1 border border-gray-200 px-3 py-1.5 rounded-md text-sm" />
                        <button onClick={() => removeColor(idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded">×</button>
                    </div>
                ))}
            </div>
            <button onClick={addColor} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-100">+ Добавить цвет</button>
        </div>
    );
};

// ─── Sizes Editor ───
const SizesEditor = ({ sizes = [], onChange }) => {
    const addSize = () => onChange([...sizes, { label: '', value: '' }]);
    const updateSize = (idx, field, val) => {
        const newSizes = [...sizes];
        newSizes[idx][field] = val;
        onChange(newSizes);
    };
    const removeSize = (idx) => onChange(sizes.filter((_, i) => i !== idx));

    return (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Размеры</label>
            <div className="space-y-3 mb-3">
                {sizes.map((s, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                        <input type="text" value={s.label} onChange={e => updateSize(idx, 'label', e.target.value)} placeholder="Например: S" className="w-1/3 border border-gray-200 px-3 py-1.5 rounded-md text-sm" />
                        <input type="text" value={s.value} onChange={e => updateSize(idx, 'value', e.target.value)} placeholder="XX х YY мм" className="flex-1 border border-gray-200 px-3 py-1.5 rounded-md text-sm" />
                        <button onClick={() => removeSize(idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded">×</button>
                    </div>
                ))}
            </div>
            <button onClick={addSize} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-100">+ Добавить размер</button>
        </div>
    );
};

// ─── Details Editor (Key-Value) ───
const DetailsEditor = ({ details = {}, onChange }) => {
    // Convert object to array for easier editing
    const [KV, setKV] = useState(() => Object.entries(details).map(([k, v]) => ({ key: k, value: v })));

    // Sync external changes
    useEffect(() => {
        setKV(Object.entries(details).map(([k, v]) => ({ key: k, value: v })));
    }, [details]);

    const addDetail = () => setKV([...KV, { key: '', value: '' }]);

    const updateKV = (idx, field, val) => {
        const newKV = [...KV];
        newKV[idx][field] = val;
        setKV(newKV);
        flush(newKV);
    };

    const removeKV = (idx) => {
        const newKV = KV.filter((_, i) => i !== idx);
        setKV(newKV);
        flush(newKV);
    };

    const flush = (pairs) => {
        const newDetails = {};
        pairs.forEach(p => { if (p.key.trim()) newDetails[p.key] = p.value; });
        onChange(newDetails);
    };

    return (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Спецификации (Характеристики)</label>
            <div className="space-y-3 mb-3">
                {KV.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                        <input type="text" value={item.key} onChange={e => updateKV(idx, 'key', e.target.value)} placeholder="Параметр" className="w-1/3 border border-gray-200 px-3 py-1.5 rounded-md text-sm" />
                        <input type="text" value={item.value} onChange={e => updateKV(idx, 'value', e.target.value)} placeholder="Значение" className="flex-1 border border-gray-200 px-3 py-1.5 rounded-md text-sm" />
                        <button onClick={() => removeKV(idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded">×</button>
                    </div>
                ))}
            </div>
            <button onClick={addDetail} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-100">+ Добавить характеристику</button>
        </div>
    );
};

// ─── Reusable Field Component ───
const Field = ({ label, value, onChange, type = 'text', rows }) => (
    <div className="mb-6">
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">{label}</label>
        {type === 'textarea' ? (
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                rows={rows || 3}
                className="w-full border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow"
            />
        ) : (
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
        )}
    </div>
);

// ─── Tab: Content (Products Edit) ───
const ProductsTab = () => {
    const { content, updateProduct, addProduct, deleteProduct } = useContent();
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [showAdd, setShowAdd] = useState(false);

    // Default structure for a new product
    const [newProduct, setNewProduct] = useState({
        name: '', category: 'Sofas', price: 0, image: '', description: '', specs: '', video: '',
        colors: [], sizes: [], details: {}, gallery: []
    });

    const startEdit = (product) => {
        setEditingId(product.id);
        // Ensure arrays/objects exist so editors don't crash
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

    const handleAdd = () => {
        if (!newProduct.name) return;
        addProduct({ ...newProduct, price: parseInt(newProduct.price) || 0 });
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
                        <Field label="Категория" value={newProduct.category} onChange={v => setNewProduct({ ...newProduct, category: v })} />
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
                            // Edit Mode
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                    <Field label="Название" value={editData.name} onChange={v => setEditData({ ...editData, name: v })} />
                                    <Field label="Категория" value={editData.category} onChange={v => setEditData({ ...editData, category: v })} />
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
                            // View Mode
                            <div className="flex items-center gap-6 p-4">
                                <img src={product.image} alt="" className="w-16 h-16 object-cover rounded-full bg-gray-100 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                                    <p className="text-xs text-gray-500">{product.category} · {product.price.toLocaleString()} ₽</p>
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

// ─── Tab: Catalog (Ordering & Quick Edit) ───
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
            // Fallback: base64
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
                        {/* 1. Order Controls */}
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

                        {/* 2. Image Section */}
                        <div className="w-full md:w-64 shrink-0">
                            <label className="text-[10px] uppercase tracking-widest text-gray-400 mb-3 block font-semibold">Обложка</label>
                            <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group-hover:border-blue-200 transition-colors shadow-sm">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />

                                {/* Overlay / Edit Trigger */}
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

                        {/* 3. Details Section */}
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


// ─── Reviews Editor Component ───
const ReviewsEditor = ({ reviews = [], onChange }) => {
    const handleChange = (id, field, value) => {
        onChange(reviews.map(r => r.id === id ? { ...r, [field]: field === 'rating' ? parseInt(value) || 0 : value } : r));
    };

    const addReview = () => {
        const newId = Math.max(...reviews.map(r => r.id), 0) + 1;
        onChange([...reviews, {
            id: newId,
            name: 'Новый отзыв',
            date: new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }) + ' г.',
            rating: 5,
            text: 'Текст отзыва...',
        }]);
    };

    const removeReview = (id) => {
        onChange(reviews.filter(r => r.id !== id));
    };

    const moveReview = (index, direction) => {
        if ((direction === -1 && index === 0) || (direction === 1 && index === reviews.length - 1)) return;
        const arr = [...reviews];
        [arr[index], arr[index + direction]] = [arr[index + direction], arr[index]];
        onChange(arr);
    };

    return (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {reviews.map((review, idx) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                    {/* Controls top-right */}
                    <div className="absolute top-3 right-3 flex gap-1">
                        <button onClick={() => moveReview(idx, -1)} disabled={idx === 0} className="text-gray-400 hover:text-blue-600 disabled:opacity-30 p-1 rounded hover:bg-white" title="Выше">▲</button>
                        <button onClick={() => moveReview(idx, 1)} disabled={idx === reviews.length - 1} className="text-gray-400 hover:text-blue-600 disabled:opacity-30 p-1 rounded hover:bg-white" title="Ниже">▼</button>
                        <button onClick={() => removeReview(review.id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 ml-2" title="Удалить">×</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 pr-20">
                        <Field label="Имя автора" value={review.name} onChange={v => handleChange(review.id, 'name', v)} />
                        <Field label="Дата" value={review.date} onChange={v => handleChange(review.id, 'date', v)} />
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Рейтинг (1-5)</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="1" max="5" step="1"
                                    value={review.rating}
                                    onChange={e => handleChange(review.id, 'rating', e.target.value)}
                                    className="flex-1 accent-amber-500"
                                />
                                <span className="text-amber-500 font-semibold text-sm w-6 text-center">{'★'.repeat(review.rating)}</span>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <Field label="Текст отзыва" value={review.text} onChange={v => handleChange(review.id, 'text', v)} type="textarea" rows={3} />
                        </div>
                    </div>
                </div>
            ))}
            <button onClick={addReview} className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                + Добавить отзыв
            </button>
        </div>
    );
};

// ─── Why Items Editor Component ───
const WhyItemsEditor = ({ items = [], onChange }) => {
    const handleChange = (index, field, value) => {
        const arr = [...items];
        arr[index] = { ...arr[index], [field]: value };
        onChange(arr);
    };

    const addItem = () => {
        const nextNum = String(items.length + 1).padStart(2, '0');
        onChange([...items, { number: nextNum, title: 'Новый пункт', description: 'Описание...' }]);
    };

    const removeItem = (index) => {
        onChange(items.filter((_, i) => i !== index));
    };

    const moveItem = (index, direction) => {
        if ((direction === -1 && index === 0) || (direction === 1 && index === items.length - 1)) return;
        const arr = [...items];
        [arr[index], arr[index + direction]] = [arr[index + direction], arr[index]];
        onChange(arr);
    };

    return (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {items.map((item, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                    {/* Controls top-right */}
                    <div className="absolute top-3 right-3 flex gap-1">
                        <button onClick={() => moveItem(idx, -1)} disabled={idx === 0} className="text-gray-400 hover:text-blue-600 disabled:opacity-30 p-1 rounded hover:bg-white" title="Выше">▲</button>
                        <button onClick={() => moveItem(idx, 1)} disabled={idx === items.length - 1} className="text-gray-400 hover:text-blue-600 disabled:opacity-30 p-1 rounded hover:bg-white" title="Ниже">▼</button>
                        <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 ml-2" title="Удалить">×</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1 pr-20">
                        <Field label="Номер" value={item.number} onChange={v => handleChange(idx, 'number', v)} />
                        <div className="md:col-span-2">
                            <Field label="Заголовок" value={item.title} onChange={v => handleChange(idx, 'title', v)} />
                        </div>
                        <div className="md:col-span-3">
                            <Field label="Описание" value={item.description} onChange={v => handleChange(idx, 'description', v)} type="textarea" rows={2} />
                        </div>
                    </div>
                </div>
            ))}
            <button onClick={addItem} className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                + Добавить пункт
            </button>
        </div>
    );
};

// ─── Tab: Home Page ───
const HomeTab = () => {
    const { content, updateHome } = useContent();
    const h = content.home;

    return (
        <div>
            <h2 className="text-xl font-semibold mb-8">Главная страница</h2>

            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-700">Hero секция</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
                    <Field label="Заголовок (строка 1)" value={h.heroTitle1} onChange={v => updateHome('heroTitle1', v)} />
                    <Field label="Заголовок (строка 2)" value={h.heroTitle2} onChange={v => updateHome('heroTitle2', v)} />
                    <Field label="Заголовок (строка 3)" value={h.heroTitle3} onChange={v => updateHome('heroTitle3', v)} />
                </div>
                <FileUpload label="Фото Hero" value={h.heroImage} onChange={v => updateHome('heroImage', v)} folder="pages" />
                <Field label="Описание под Hero" value={h.heroDescription} onChange={v => updateHome('heroDescription', v)} type="textarea" />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-700">Тексты и Цитаты</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Field label="Заголовок: Хиты продаж" value={h.hitsTitle} onChange={v => updateHome('hitsTitle', v)} />
                    <Field label="Кнопка: Перейти в каталог" value={h.hitsLink} onChange={v => updateHome('hitsLink', v)} />
                    <Field label="Кнопка карточки: Подробнее" value={h.productView} onChange={v => updateHome('productView', v)} />
                </div>
                <div className="mt-4">
                    <Field label="Текст цитаты (Внизу страницы)" value={h.quoteText} onChange={v => updateHome('quoteText', v)} type="textarea" rows={4} />
                </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold mb-2 text-gray-700">Отзывы клиентов</h3>
                <p className="text-xs text-gray-400 mb-4">Отображаются на главной странице и на странице «Отзывы».</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mb-6">
                    <Field label="Заголовок секции" value={h.reviewsTitle} onChange={v => updateHome('reviewsTitle', v)} />
                    <Field label="Текст ссылки «Все отзывы»" value={h.reviewsLink} onChange={v => updateHome('reviewsLink', v)} />
                </div>
                <ReviewsEditor reviews={h.reviews || []} onChange={v => updateHome('reviews', v)} />
            </div>

            {/* Why Lumera Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold mb-2 text-gray-700">Почему Lumera</h3>
                <p className="text-xs text-gray-400 mb-4">Блок преимуществ на главной странице.</p>
                <div className="mb-6">
                    <Field label="Заголовок секции" value={h.whyTitle} onChange={v => updateHome('whyTitle', v)} />
                </div>
                <WhyItemsEditor items={h.whyItems || []} onChange={v => updateHome('whyItems', v)} />
            </div>
        </div>
    );
};

// ─── Blog Posts Editor component ───
const BlogPostsEditor = ({ posts, onChange }) => {
    const handlePostChange = (id, field, value) => {
        onChange(posts.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const addPost = () => {
        const newId = Math.max(...posts.map(p => p.id), 0) + 1;
        onChange([{
            id: newId,
            title: 'Новая статья',
            date: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }),
            category: 'Новости',
            image: '',
            excerpt: 'Краткое описание...'
        }, ...posts]);
    };

    const removePost = (id) => {
        onChange(posts.filter(p => p.id !== id));
    };

    return (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {posts.map(post => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                    <button onClick={() => removePost(post.id)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-xs font-bold">Удалить</button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Заголовок статьи" value={post.title} onChange={v => handlePostChange(post.id, 'title', v)} />
                        <Field label="Категория" value={post.category} onChange={v => handlePostChange(post.id, 'category', v)} />
                        <Field label="Дата (Текст)" value={post.date} onChange={v => handlePostChange(post.id, 'date', v)} />
                        <FileUpload label="Фото обложки" value={post.image} onChange={v => handlePostChange(post.id, 'image', v)} folder="blog" />
                        <div className="col-span-1 md:col-span-2">
                            <Field label="Текст статьи" value={post.excerpt} onChange={v => handlePostChange(post.id, 'excerpt', v)} type="textarea" rows={4} />
                        </div>
                    </div>
                </div>
            ))}
            <button onClick={addPost} className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                + Добавить статью
            </button>
        </div>
    );
};

// ─── Tab: Content Pages (About, B2B, Blog, Contact) ───
const ContentPagesTab = () => {
    const { content, updateContentPage } = useContent();

    return (
        <div>
            <h2 className="text-xl font-semibold mb-8">Страницы контента</h2>

            {/* About Page */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-700">О нас</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Field label="Заголовок" value={content.about.title} onChange={v => updateContentPage('about', 'title', v)} />
                    <Field label="Подзаголовок" value={content.about.subtitle} onChange={v => updateContentPage('about', 'subtitle', v)} />
                    <div className="md:col-span-2">
                        <Field label="Абзац 1" value={content.about.description1} onChange={v => updateContentPage('about', 'description1', v)} type="textarea" />
                        <Field label="Абзац 2" value={content.about.description2} onChange={v => updateContentPage('about', 'description2', v)} type="textarea" />
                    </div>
                    <FileUpload label="Главное фото" value={content.about.image1} onChange={v => updateContentPage('about', 'image1', v)} folder="pages" />
                </div>
                <div className="mt-4 border-t border-gray-100 pt-4">
                    <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Статистика</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Field label="Значение 1" value={content.about.stats1Value} onChange={v => updateContentPage('about', 'stats1Value', v)} />
                            <Field label="Подпись 1" value={content.about.stats1Label} onChange={v => updateContentPage('about', 'stats1Label', v)} />
                        </div>
                        <div>
                            <Field label="Значение 2" value={content.about.stats2Value} onChange={v => updateContentPage('about', 'stats2Value', v)} />
                            <Field label="Подпись 2" value={content.about.stats2Label} onChange={v => updateContentPage('about', 'stats2Label', v)} />
                        </div>
                        <div>
                            <Field label="Значение 3" value={content.about.stats3Value} onChange={v => updateContentPage('about', 'stats3Value', v)} />
                            <Field label="Подпись 3" value={content.about.stats3Label} onChange={v => updateContentPage('about', 'stats3Label', v)} />
                        </div>
                    </div>
                </div>
            </div>

            {/* B2B Page */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-700">B2B (Архитекторам)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Field label="Заголовок" value={content.b2b.title} onChange={v => updateContentPage('b2b', 'title', v)} />
                    <Field label="Подзаголовок" value={content.b2b.subtitle} onChange={v => updateContentPage('b2b', 'subtitle', v)} />
                    <div className="md:col-span-2">
                        <Field label="Описание" value={content.b2b.description} onChange={v => updateContentPage('b2b', 'description', v)} type="textarea" />
                    </div>
                    <FileUpload label="Фото 1" value={content.b2b.image1} onChange={v => updateContentPage('b2b', 'image1', v)} folder="pages" />
                    <FileUpload label="Фото 2" value={content.b2b.image2} onChange={v => updateContentPage('b2b', 'image2', v)} folder="pages" />
                </div>
                <div className="mt-4 border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Field label="Заголовок формы" value={content.b2b.formTitle} onChange={v => updateContentPage('b2b', 'formTitle', v)} />
                    <Field label="Подзаголовок формы" value={content.b2b.formSubtitle} onChange={v => updateContentPage('b2b', 'formSubtitle', v)} />
                </div>
            </div>

            {/* Contact Page */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-700">Контакты (Страница)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Field label="Заголовок" value={content.contactPage.title} onChange={v => updateContentPage('contactPage', 'title', v)} />
                    <Field label="Подзаголовок" value={content.contactPage.subtitle} onChange={v => updateContentPage('contactPage', 'subtitle', v)} />
                    <div className="md:col-span-2">
                        <Field label="Цитата" value={content.contactPage.quote} onChange={v => updateContentPage('contactPage', 'quote', v)} type="textarea" />
                    </div>
                    <div className="md:col-span-2">
                        <FileUpload label="Фото" value={content.contactPage.image1} onChange={v => updateContentPage('contactPage', 'image1', v)} folder="pages" />
                    </div>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Field label="Лейбл связи" value={content.contactPage.connectLabel} onChange={v => updateContentPage('contactPage', 'connectLabel', v)} />
                    <Field label="Заголовок формы" value={content.contactPage.formTitle} onChange={v => updateContentPage('contactPage', 'formTitle', v)} />
                    <Field label="Плейсхолдер: Имя" value={content.contactPage.formName} onChange={v => updateContentPage('contactPage', 'formName', v)} />
                    <Field label="Плейсхолдер: Телефон" value={content.contactPage.formPhone} onChange={v => updateContentPage('contactPage', 'formPhone', v)} />
                    <Field label="Кнопка Отправить" value={content.contactPage.formSubmit} onChange={v => updateContentPage('contactPage', 'formSubmit', v)} />
                </div>
            </div>

            {/* Blog Page Hero */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-700">Блог (Главная страница Блога)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Field label="Надзаголовок (Мелкий)" value={content.blog.subtitle} onChange={v => updateContentPage('blog', 'subtitle', v)} />
                    <Field label="Главный Заголовок H1" value={content.blog.mainTitle} onChange={v => updateContentPage('blog', 'mainTitle', v)} type="textarea" rows={2} />
                    <div className="md:col-span-2">
                        <Field label="Кнопка: Читать статью" value={content.blog.readMoreBtn} onChange={v => updateContentPage('blog', 'readMoreBtn', v)} />
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-semibold mb-4 text-gray-700">Статьи ({content.blog.posts?.length || 0})</h3>
                    <BlogPostsEditor posts={content.blog.posts || []} onChange={v => updateContentPage('blog', 'posts', v)} />
                </div>
            </div>
        </div>
    );
};
const SettingsTab = () => {
    const { content, updateSettings, resetToDefaults } = useContent();
    const s = content.settings;

    return (
        <div>
            <h2 className="text-xl font-semibold mb-8">Настройки сайта</h2>

            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-700">Контакты</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Field label="Телефон" value={s.phone} onChange={v => updateSettings('phone', v)} />
                    <Field label="Email" value={s.email} onChange={v => updateSettings('email', v)} />
                    <Field label="WhatsApp ссылка" value={s.whatsapp} onChange={v => updateSettings('whatsapp', v)} />
                    <Field label="Telegram ссылка" value={s.telegram} onChange={v => updateSettings('telegram', v)} />
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-700">График работы</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Field label="Москва" value={s.scheduleMSK} onChange={v => updateSettings('scheduleMSK', v)} />
                    <Field label="Санкт-Петербург" value={s.scheduleSPB} onChange={v => updateSettings('scheduleSPB', v)} />
                </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold mb-4 text-red-700">Сброс</h3>
                <p className="text-sm text-red-600 mb-4">Сбросить все изменения к значениям по умолчанию.</p>
                <button onClick={() => { if (window.confirm('Точно сбросить все?')) resetToDefaults() }} className="bg-red-600 text-white px-6 py-2 rounded-full text-sm hover:bg-red-700">
                    Сбросить
                </button>
            </div>
        </div>
    );
};

// ─── Main Admin Page ───
const Admin = () => {
    const [activeTab, setActiveTab] = useState('catalog'); // Default to Catalog as requested
    const navigate = useNavigate();
    const { uuid } = useParams();

    // Validate UUID + session
    const validUuid = import.meta.env.VITE_ADMIN_UUID;

    useEffect(() => {
        if (uuid !== validUuid || !isSessionValid()) {
            if (uuid === validUuid) {
                navigate(`/panel/${uuid}/login`, { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    }, [navigate, uuid, validUuid]);

    const handleLogout = () => {
        destroySession();
        navigate(`/panel/${uuid}/login`);
    };

    const tabs = [
        { id: 'catalog', label: 'Каталог (Порядок)', icon: '🔢' },
        { id: 'products', label: 'Все товары', icon: '📦' },
        { id: 'home', label: 'Главная', icon: '🏠' },
        { id: 'content-pages', label: 'Страницы', icon: '📄' },
        { id: 'settings', label: 'Настройки', icon: '⚙️' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 fixed h-full p-6 hidden md:block">
                <div className="text-2xl font-serif mb-12">
                    LUMERA <span className="text-xs font-sans tracking-widest block opacity-50">Admin CMS</span>
                </div>
                <nav className="flex flex-col gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 rounded-full text-sm text-left transition-all flex items-center gap-3 ${activeTab === tab.id
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="px-4 py-3 rounded-full text-sm text-left text-red-600 hover:bg-red-50 transition-all flex items-center gap-3 mt-4"
                    >
                        <span>🚪</span>
                        Выйти
                    </button>
                </nav>

                <div className="absolute bottom-6 left-6 right-6">
                    <a href="/" className="block text-center text-xs text-gray-400 hover:text-blue-600 transition-colors py-2 border border-gray-200 rounded-full">
                        ← Вернуться на сайт
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-0 md:ml-64 p-8">
                {/* Mobile Tab Bar */}
                <div className="flex md:hidden gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 border border-gray-200'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="max-w-4xl mx-auto">
                    {activeTab === 'catalog' && <CatalogTab />}
                    {activeTab === 'products' && <ProductsTab />}
                    {activeTab === 'home' && <HomeTab />}
                    {activeTab === 'content-pages' && <ContentPagesTab />}
                    {activeTab === 'settings' && <SettingsTab />}
                </div>
            </main>
        </div>
    );
};

export default Admin;
