import React from 'react';
import { useContent } from '../../../context/ContentContext';
import Field from '../components/Field';
import FileUpload from '../components/FileUpload';
import ReviewsEditor from '../components/ReviewsEditor';
import WhyItemsEditor from '../components/WhyItemsEditor';

const HomeTab = () => {
    const { content, updateHome } = useContent();
    const h = content.home;

    return (
        <div>
            <h2 className="text-xl font-semibold mb-8">Главная страница</h2>

            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-700">Hero секция</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
                    <Field label="Заголовок (строка 1)" value={h.heroTitle1} onChange={v => updateHome('heroTitle1', v)} />
                    <Field label="Заголовок (строка 2)" value={h.heroTitle2} onChange={v => updateHome('heroTitle2', v)} />
                    <Field label="Заголовок (строка 3)" value={h.heroTitle3} onChange={v => updateHome('heroTitle3', v)} />
                </div>
                <FileUpload label="Фото Hero" value={h.heroImage} onChange={v => updateHome('heroImage', v)} folder="pages" />
                <Field label="Описание под Hero" value={h.heroDescription} onChange={v => updateHome('heroDescription', v)} type="textarea" />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-700">Тексты и Цитаты</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Field label="Заголовок: Хиты продаж" value={h.hitsTitle} onChange={v => updateHome('hitsTitle', v)} />
                    <Field label="Кнопка: Перейти в каталог" value={h.hitsLink} onChange={v => updateHome('hitsLink', v)} />
                    <Field label="Кнопка карточки: Подробнее" value={h.productView} onChange={v => updateHome('productView', v)} />
                </div>
                <div className="mt-4">
                    <Field label="Текст цитаты (Внизу страницы)" value={h.quoteText} onChange={v => updateHome('quoteText', v)} type="textarea" rows={4} />
                </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold mb-2 text-gray-700">Отзывы клиентов</h3>
                <p className="text-xs text-gray-400 mb-4">Отображаются на главной странице и на странице «Отзывы».</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mb-6">
                    <Field label="Заголовок секции" value={h.reviewsTitle} onChange={v => updateHome('reviewsTitle', v)} />
                    <Field label="Текст ссылки «Все отзывы»" value={h.reviewsLink} onChange={v => updateHome('reviewsLink', v)} />
                </div>
                <ReviewsEditor reviews={h.reviews || []} onChange={v => updateHome('reviews', v)} />
            </div>

            {/* Why Lumera Section */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold mb-2 text-gray-700">Почему Lumera</h3>
                <p className="text-xs text-gray-400 mb-4">Блок преимуществ на главной странице.</p>
                <div className="mb-6">
                    <Field label="Заголовок секции" value={h.whyTitle} onChange={v => updateHome('whyTitle', v)} />
                </div>
                <WhyItemsEditor items={h.whyItems || []} onChange={v => updateHome('whyItems', v)} />
            </div>
        </div>
    );
};

export default HomeTab;
