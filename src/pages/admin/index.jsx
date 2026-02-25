import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isSessionValid, destroySession } from '../Login';
import { logoutAdmin } from '../../utils/api';

import CatalogTab from './tabs/CatalogTab';
import ProductsTab from './tabs/ProductsTab';
import HomeTab from './tabs/HomeTab';
import ContentPagesTab from './tabs/ContentPagesTab';
import SettingsTab from './tabs/SettingsTab';

const tabs = [
    { id: 'catalog', label: 'Каталог (Порядок)', icon: '🔢' },
    { id: 'products', label: 'Все товары', icon: '📦' },
    { id: 'home', label: 'Главная', icon: '🏠' },
    { id: 'content-pages', label: 'Страницы', icon: '📄' },
    { id: 'settings', label: 'Настройки', icon: '⚙️' },
];

const Admin = () => {
    const [activeTab, setActiveTab] = useState('catalog');
    const navigate = useNavigate();
    const { uuid } = useParams();

    const validUuid = import.meta.env.VITE_ADMIN_UUID;

    useEffect(() => {
        if (uuid !== validUuid || !isSessionValid()) {
            if (uuid === validUuid) {
                navigate(`/panel/${uuid}/login`, { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    }, [navigate, uuid, validUuid]);

    const handleLogout = async () => {
        await logoutAdmin();
        destroySession();
        navigate(`/panel/${uuid}/login`);
    };

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 fixed h-full p-6 hidden md:block">
                <div className="text-2xl font-serif mb-12">
                    LUMERA <span className="text-xs font-sans tracking-widest block opacity-50">Admin CMS</span>
                </div>
                <nav className="flex flex-col gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 rounded-full text-sm text-left transition-all flex items-center gap-3 ${activeTab === tab.id
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="px-4 py-3 rounded-full text-sm text-left text-red-600 hover:bg-red-50 transition-all flex items-center gap-3 mt-4"
                    >
                        <span>🚪</span>
                        Выйти
                    </button>
                </nav>

                <div className="absolute bottom-6 left-6 right-6">
                    <a href="/" className="block text-center text-xs text-gray-400 hover:text-blue-600 transition-colors py-2 border border-gray-200 rounded-full">
                        ← Вернуться на сайт
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-0 md:ml-64 p-8">
                {/* Mobile Tab Bar */}
                <div className="flex md:hidden gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 border border-gray-200'
                            }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="max-w-4xl mx-auto">
                    {activeTab === 'catalog' && <CatalogTab />}
                    {activeTab === 'products' && <ProductsTab />}
                    {activeTab === 'home' && <HomeTab />}
                    {activeTab === 'content-pages' && <ContentPagesTab />}
                    {activeTab === 'settings' && <SettingsTab />}
                </div>
            </main>
        </div>
    );
};

export default Admin;
