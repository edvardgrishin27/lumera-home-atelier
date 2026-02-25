import React from 'react';
import { useContent } from '../../../context/ContentContext';
import Field from '../components/Field';
import FileUpload from '../components/FileUpload';
import BlogPostsEditor from '../components/BlogPostsEditor';

/* ─── Generic section list editor for Returns / Guarantee ─── */
const SectionsEditor = ({ sections, onChange }) => {
    const update = (idx, key, val) => {
        const next = [...sections];
        next[idx] = { ...next[idx], [key]: val };
        onChange(next);
    };
    const add = () => onChange([...sections, { title: 'Новый раздел', text: '' }]);
    const remove = (idx) => onChange(sections.filter((_, i) => i !== idx));
    const move = (idx, dir) => {
        const next = [...sections];
        const target = idx + dir;
        if (target < 0 || target >= next.length) return;
        [next[idx], next[target]] = [next[target], next[idx]];
        onChange(next);
    };

    return (
        <div className="space-y-4">
            {sections.map((s, idx) => (
                <div key={idx} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-400 font-mono">Секция {idx + 1}</span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 text-sm">↑</button>
                            <button onClick={() => move(idx, 1)} disabled={idx === sections.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 text-sm">↓</button>
                            <button onClick={() => remove(idx)} className="p-1 text-red-400 hover:text-red-600 text-sm ml-2">✕</button>
                        </div>
                    </div>
                    <Field label="Заголовок" value={s.title} onChange={v => update(idx, 'title', v)} />
                    <Field label="Текст (новая строка = новый абзац, • = список, — = тире-список, 1. = нумерованный)" value={s.text} onChange={v => update(idx, 'text', v)} type="textarea" rows={5} />
                </div>
            ))}
            <button onClick={add} className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-2 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition-colors w-full">
                + Добавить секцию
            </button>
        </div>
    );
};

/* ─── Step editor for Workflow ─── */
const StepsEditor = ({ steps, onChange }) => {
    const update = (idx, key, val) => {
        const next = [...steps];
        next[idx] = { ...next[idx], [key]: val };
        onChange(next);
    };
    const add = () => onChange([...steps, { number: String(steps.length + 1).padStart(2, '0'), title: 'Новый этап', description: '' }]);
    const remove = (idx) => onChange(steps.filter((_, i) => i !== idx));
    const move = (idx, dir) => {
        const next = [...steps];
        const target = idx + dir;
        if (target < 0 || target >= next.length) return;
        [next[idx], next[target]] = [next[target], next[idx]];
        onChange(next);
    };

    return (
        <div className="space-y-4">
            {steps.map((step, idx) => (
                <div key={idx} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-400 font-mono">Этап {step.number}</span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 text-sm">↑</button>
                            <button onClick={() => move(idx, 1)} disabled={idx === steps.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 text-sm">↓</button>
                            <button onClick={() => remove(idx)} className="p-1 text-red-400 hover:text-red-600 text-sm ml-2">✕</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                        <Field label="Номер" value={step.number} onChange={v => update(idx, 'number', v)} />
                        <Field label="Заголовок" value={step.title} onChange={v => update(idx, 'title', v)} />
                    </div>
                    <Field label="Описание" value={step.description} onChange={v => update(idx, 'description', v)} type="textarea" rows={3} />
                </div>
            ))}
            <button onClick={add} className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-2 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition-colors w-full">
                + Добавить этап
            </button>
        </div>
    );
};

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

            {/* Workflow Page */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-700">Этапы работы</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Field label="Лейбл (мелкий)" value={content.workflow?.label || ''} onChange={v => updateContentPage('workflow', 'label', v)} />
                    <Field label="Заголовок" value={content.workflow?.title || ''} onChange={v => updateContentPage('workflow', 'title', v)} />
                    <Field label="Заголовок (акцент, курсив)" value={content.workflow?.titleAccent || ''} onChange={v => updateContentPage('workflow', 'titleAccent', v)} />
                    <div className="md:col-span-2">
                        <Field label="Описание" value={content.workflow?.description || ''} onChange={v => updateContentPage('workflow', 'description', v)} type="textarea" />
                    </div>
                </div>
                <div className="mt-6 border-t border-gray-100 pt-4">
                    <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Этапы ({content.workflow?.steps?.length || 0})</h4>
                    <StepsEditor steps={content.workflow?.steps || []} onChange={v => updateContentPage('workflow', 'steps', v)} />
                </div>
                <div className="mt-6 border-t border-gray-100 pt-4">
                    <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4">CTA-блок</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <Field label="Заголовок CTA" value={content.workflow?.ctaTitle || ''} onChange={v => updateContentPage('workflow', 'ctaTitle', v)} />
                        <Field label="Кнопка CTA" value={content.workflow?.ctaButton || ''} onChange={v => updateContentPage('workflow', 'ctaButton', v)} />
                        <div className="md:col-span-2">
                            <Field label="Описание CTA" value={content.workflow?.ctaDescription || ''} onChange={v => updateContentPage('workflow', 'ctaDescription', v)} type="textarea" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Returns Page */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-700">Возврат и обмен</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Field label="Лейбл (мелкий)" value={content.returns?.label || ''} onChange={v => updateContentPage('returns', 'label', v)} />
                    <Field label="Заголовок" value={content.returns?.title || ''} onChange={v => updateContentPage('returns', 'title', v)} />
                </div>
                <div className="mt-6 border-t border-gray-100 pt-4">
                    <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Секции ({content.returns?.sections?.length || 0})</h4>
                    <SectionsEditor sections={content.returns?.sections || []} onChange={v => updateContentPage('returns', 'sections', v)} />
                </div>
            </div>

            {/* Guarantee Page */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold mb-4 text-gray-700">Гарантии</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Field label="Лейбл (мелкий)" value={content.guarantee?.label || ''} onChange={v => updateContentPage('guarantee', 'label', v)} />
                    <Field label="Заголовок" value={content.guarantee?.title || ''} onChange={v => updateContentPage('guarantee', 'title', v)} />
                </div>
                <div className="mt-6 border-t border-gray-100 pt-4">
                    <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Секции ({content.guarantee?.sections?.length || 0})</h4>
                    <SectionsEditor sections={content.guarantee?.sections || []} onChange={v => updateContentPage('guarantee', 'sections', v)} />
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
