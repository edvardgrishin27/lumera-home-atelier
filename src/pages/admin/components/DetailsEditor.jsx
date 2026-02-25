import React, { useState, useEffect } from 'react';

const DetailsEditor = ({ details = {}, onChange }) => {
    const [KV, setKV] = useState(() => Object.entries(details).map(([k, v]) => ({ key: k, value: v })));

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

export default DetailsEditor;
