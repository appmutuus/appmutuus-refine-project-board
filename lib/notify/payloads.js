import de from '../i18n/de.json' with { type: 'json' };
import en from '../i18n/en.json' with { type: 'json' };

const translations = { de, en };

export function buildMessage({ type, data, language = 'de' }) {
  const template = (translations[language] && translations[language][type]) || translations.de[type] || '';
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const value = data[key.trim()];
    return value !== undefined ? String(value) : '';
  });
}
