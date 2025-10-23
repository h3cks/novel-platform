// src/utils/sanitizeText.ts
import sanitizeHtml from 'sanitize-html';

/**
 * detectLinks - повертає true якщо в тексті є явні зовнішні посилання
 * Ми виявляємо: http://, https://, www.
 * (не детектимо "bare domains" щоб не давао помилкових спрацьовувань)
 */
export function detectLinks(input: string): boolean {
  if (!input) return false;
  const patterns = [
    /https?:\/\/[^\s"'<>]+/i,
    /\bwww\.[^\s"'<>]+/i,
  ];
  return patterns.some((re) => re.test(input));
}

/**
 * sanitizePlainText - видаляє всі HTML теги, залишає plain text
 * також обрізає зайві пробіли
 */
export function sanitizePlainText(input: string): string {
  if (!input) return '';
  const cleaned = sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  });
  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * sanitizeContentHtml - дозволені базові теги для content (глави).
 * Забороняє <a>, дозволяє p, br, b, i, em, strong, ul, ol, li.
 * Після санітизації також перевіряємо на наявність посилань (на випадок href у атрибутах).
 */
export function sanitizeContentHtml(input: string): string {
  if (!input) return '';
  const cleaned = sanitizeHtml(input, {
    allowedTags: ['p', 'br', 'b', 'i', 'em', 'strong', 'ul', 'ol', 'li'],
    allowedAttributes: {}, // забороняємо атрибути (тому href буде видалено)
    allowedSchemes: [], // додаткова гарантія: нічого не дозволяти в схемах
  });
  return cleaned.trim();
}

/**
 * ensureNoLinksOrThrow - якщо знайдено посилання, кидає помилку з кодом і зручним повідомленням.
 * Викликати ПЕРЕД збереженням або відправкою даних у БД.
 */
export function ensureNoLinksOrThrow(fieldName: string, input: string) {
  if (!input) return;
  if (detectLinks(input)) {
    const err: any = new Error(`${fieldName} contains external links, which are not allowed.`);
    err.code = 'LINKS_NOT_ALLOWED';
    throw err;
  }
}
