import { contentEn } from './content.en'
import { contentHi } from './content.hi'

export const contentByLang = {
  en: contentEn,
  hi: contentHi,
}

export function getContent(lang) {
  return contentByLang[lang] ?? contentEn
}

export { contentEn, contentHi }
