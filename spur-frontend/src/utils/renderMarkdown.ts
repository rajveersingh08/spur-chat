import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const md = new MarkdownIt({
  html: false,
  linkify: false,
  breaks: true,
})

md.disable(['code', 'fence', 'table', 'heading', 'image', 'link', 'blockquote', 'hr'])

const ALLOWED_TAGS = ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li']

export function renderMarkdown(text: string): string {
  const raw = md.render(text)
  return DOMPurify.sanitize(raw, { ALLOWED_TAGS, ALLOWED_ATTR: [] })
}
