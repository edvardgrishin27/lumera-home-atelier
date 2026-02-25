import React, { useState } from 'react';
import { uploadFile } from '../../../utils/uploadToS3';

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

export default GalleryEditor;
