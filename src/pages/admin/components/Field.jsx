import React from 'react';

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

export default Field;
