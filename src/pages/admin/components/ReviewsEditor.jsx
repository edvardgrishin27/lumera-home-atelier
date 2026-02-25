import React from 'react';
import Field from './Field';

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

export default ReviewsEditor;
