import React from 'react';

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

export default ColorsEditor;
