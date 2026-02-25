import React from 'react';

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

export default SizesEditor;
