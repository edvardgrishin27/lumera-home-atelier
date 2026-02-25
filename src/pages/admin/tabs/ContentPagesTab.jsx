import React from 'react';
import { useContent } from '../../../context/ContentContext';
import Field from '../components/Field';
import FileUpload from '../components/FileUpload';
import BlogPostsEditor from '../components/BlogPostsEditor';

const ContentPagesTab = () => {
    const { content, updateContentPage } = useContent();

    return (
        <div>
            <h2 className="text-xl font-semibold mb-8">Страницы контента</h2>

            {/* About Page — Основатели */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-700">О нас — Основатели</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Field label="Лейбл секции" value={content.about.foundersLabel} onChange={v => updateContentPage('about', 'foundersLabel', v)} />
                    <Field label="Заголовок секции" value={content.about.foundersTitle} onChange={v => updateContentPage('about', 'foundersTitle', v)} type="textarea" rows={2} />
                    <div className="md:col-span-2">
                        <Field label="Подзаголовок" value={content.about.foundersSubtitle} onChange={v => updateContentPage('about', 'foundersSubtitle', v)} />
                    </div>
                </div>

                {/* Основатель 1 */}
                <div className="mt-6 border-t border-gray-100 pt-4">
                    <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Основатель 1</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <Field label="Имя" value={content.about.founder1Name} onChange={v => updateContentPage('about', 'founder1Name', v)} />
                        <Field label="Роль" value={content.about.founder1Role} onChange={v => updateContentPage('about', 'founder1Role', v)} />
                        <div className="md:col-span-2">
                            <Field label="Цитата" value={content.about.founder1Quote} onChange={v => updateContentPage('about', 'founder1Quote', v)} type="textarea" />
                            <Field label="Краткая биография" value={content.about.founder1Bio} onChange={v => updateContentPage('about', 'founder1Bio', v)} type="textarea" rows={3} />
                            <Field label="Полная биография (раскрывается по кнопке)" value={content.about.founder1FullBio} onChange={v => updateContentPage('about', 'founder1FullBio', v)} type="textarea" rows={8} />
                            <Field label="Экспертиза" value={content.about.founder1Expertise} onChange={v => updateContentPage('about', 'founder1Expertise', v)} />
                        </div>
                        <FileUpload label="Фото" value={content.about.founder1Image} onChange={v => updateContentPage('about', 'founder1Image', v)} folder="pages" />
                    </div>
                </div>

                {/* Основатель 2 */}
                <div className="mt-6 border-t border-gray-100 pt-4">
                    <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Основатель 2</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <Field label="Имя" value={content.about.founder2Name} onChange={v => updateContentPage('about', 'founder2Name', v)} />
                        <Field label="Роль" value={content.about.founder2Role} onChange={v => updateContentPage('about', 'founder2Role', v)} />
                        <div className="md:col-span-2">
                            <Field label="Цитата" value={content.about.founder2Quote} onChange={v => updateContentPage('about', 'founder2Quote', v)} type="textarea" />
                            <Field label="Краткая биография" value={content.about.founder2Bio} onChange={v => updateContentPage('about', 'founder2Bio', v)} type="textarea" rows={3} />
                            <Field label="Полная биография (раскрывается по кнопке)" value={content.about.founder2FullBio} onChange={v => updateContentPage('about', 'founder2FullBio', v)} type="textarea" rows={8} />
                            <Field label="Экспертиза" value={content.about.founder2Expertise} onChange={v => updateContentPage('about', 'founder2Expertise', v)} />
                        </div>
                        <FileUpload label="Фото" value={content.about.founder2Image} onChange={v => updateContentPage('about', 'founder2Image', v)} folder="pages" />
                    </div>
                </div>
            </div>

            {/* About Page — Основное */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-700">О нас — Контент</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Field label="Заголовок" value={content.about.title} onChange={v => updateContentPage('about', 'title', v)} />
                    <Field label="Подзаголовок" value={content.about.subtitle} onChange={v => updateContentPage('about', 'subtitle', v)} />
                    <div className="md:col-span-2">
                        <Field label="Абзац 1" value={content.about.description1} onChange={v => updateContentPage('about', 'description1', v)} type="textarea" />
                        <Field label="Абзац 2" value={content.about.description2} onChange={v => updateContentPage('about', 'description2', v)} type="textarea" />
                    </div>
                    <FileUpload label="Главное фото" value={content.about.image1} onChange={v => updateContentPage('about', 'image1', v)} folder="pages" />
                </div>
                <div className="mt-4 border-t border-gray-100 pt-4">
                    <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Статистика</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Field label="Значение 1" value={content.about.stats1Value} onChange={v => updateContentPage('about', 'stats1Value', v)} />
                            <Field label="Подпись 1" value={content.about.stats1Label} onChange={v => updateContentPage('about', 'stats1Label', v)} />
                        </div>
                        <div>
                            <Field label="Значение 2" value={content.about.stats2Value} onChange={v => updateContentPage('about', 'stats2Value', v)} />
                            <Field label="Подпись 2" value={content.about.stats2Label} onChange={v => updateContentPage('about', 'stats2Label', v)} />
                        </div>
                        <div>
                            <Field label="Значение 3" value={content.about.stats3Value} onChange={v => updateContentPage('about', 'stats3Value', v)} />
                            <Field label="Подпись 3" value={content.about.stats3Label} onChange={v => updateContentPage('about', 'stats3Label', v)} />
                        </div>
                    </div>
                </div>
            </div>

            {/* B2B Page */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-700">B2B (Архитекторам)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Field label="Заголовок" value={content.b2b.title} onChange={v => updateContentPage('b2b', 'title', v)} />
                    <Field label="Подзаголовок" value={content.b2b.subtitle} onChange={v => updateContentPage('b2b', 'subtitle', v)} />
                    <div className="md:col-span-2">
                        <Field label="Описание" value={content.b2b.description} onChange={v => updateContentPage('b2b', 'description', v)} type="textarea" />
                    </div>
                    <FileUpload label="Фото 1" value={content.b2b.image1} onChange={v => updateContentPage('b2b', 'image1', v)} folder="pages" />
                    <FileUpload label="Фото 2" value={content.b2b.image2} onChange={v => updateContentPage('b2b', 'image2', v)} folder="pages" />
                </div>
                <div className="mt-4 border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Field label="Заголовок формы" value={content.b2b.formTitle} onChange={v => updateContentPage('b2b', 'formTitle', v)} />
                    <Field label="Подзаголовок формы" value={content.b2b.formSubtitle} onChange={v => updateContentPage('b2b', 'formSubtitle', v)} />
                </div>
            </div>

            {/* Contact Page */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-700">Контакты (Страница)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Field label="Заголовок" value={content.contactPage.title} onChange={v => updateContentPage('contactPage', 'title', v)} />
                    <Field label="Подзаголовок" value={content.contactPage.subtitle} onChange={v => updateContentPage('contactPage', 'subtitle', v)} />
                    <div className="md:col-span-2">
                        <Field label="Цитата" value={content.contactPage.quote} onChange={v => updateContentPage('contactPage', 'quote', v)} type="textarea" />
                    </div>
                    <div className="md:col-span-2">
                        <FileUpload label="Фото" value={content.contactPage.image1} onChange={v => updateContentPage('contactPage', 'image1', v)} folder="pages" />
                    </div>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Field label="Лейбл связи" value={content.contactPage.connectLabel} onChange={v => updateContentPage('contactPage', 'connectLabel', v)} />
                    <Field label="Заголовок формы" value={content.contactPage.formTitle} onChange={v => updateContentPage('contactPage', 'formTitle', v)} />
                    <Field label="Плейсхолдер: Имя" value={content.contactPage.formName} onChange={v => updateContentPage('contactPage', 'formName', v)} />
                    <Field label="Плейсхолдер: Телефон" value={content.contactPage.formPhone} onChange={v => updateContentPage('contactPage', 'formPhone', v)} />
                    <Field label="Кнопка Отправить" value={content.contactPage.formSubmit} onChange={v => updateContentPage('contactPage', 'formSubmit', v)} />
                </div>
            </div>

            {/* Blog Page Hero */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-700">Блог (Главная страница Блога)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Field label="Надзаголовок (Мелкий)" value={content.blog.subtitle} onChange={v => updateContentPage('blog', 'subtitle', v)} />
                    <Field label="Главный Заголовок H1" value={content.blog.mainTitle} onChange={v => updateContentPage('blog', 'mainTitle', v)} type="textarea" rows={2} />
                    <div className="md:col-span-2">
                        <Field label="Кнопка: Читать статью" value={content.blog.readMoreBtn} onChange={v => updateContentPage('blog', 'readMoreBtn', v)} />
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-semibold mb-4 text-gray-700">Статьи ({content.blog.posts?.length || 0})</h3>
                    <BlogPostsEditor posts={content.blog.posts || []} onChange={v => updateContentPage('blog', 'posts', v)} />
                </div>
            </div>
        </div>
    );
};

export default ContentPagesTab;
