import React from 'react';
import Field from './Field';
import FileUpload from './FileUpload';

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

export default BlogPostsEditor;
