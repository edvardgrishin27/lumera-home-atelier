import React, { useState, useRef } from 'react';
import { uploadFile } from '../../../utils/uploadToS3';

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
            setError('Ошибка загрузки на S3. Проверьте авторизацию и попробуйте снова.');
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

export default FileUpload;
