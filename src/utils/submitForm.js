const WEBHOOK_URL = 'https://edwardgri.ru/webhook/lumera-form';

export async function submitForm(data) {
    const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Ошибка отправки: ${res.status}`);
    return res;
}
