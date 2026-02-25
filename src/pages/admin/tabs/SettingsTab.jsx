import React from 'react';
import { useContent } from '../../../context/ContentContext';
import Field from '../components/Field';

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

export default SettingsTab;
