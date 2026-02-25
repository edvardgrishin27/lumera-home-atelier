import React from 'react';
import Field from './Field';

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

export default WhyItemsEditor;
