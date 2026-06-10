import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

const PROJECT_ID = 'gen-lang-client-0485533477';
const DATABASE_ID = 'ai-studio-42160057-50ed-4f0f-b9b5-2c40e2c2c9bf';
const API_KEY = 'AIzaSyBBp8SKFrjXs99rDWxzpuWcWb2ciNVldsA';

const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;

function markdownToHtml(md: string): string {
  if (!md) return '';
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      if (/^<h[1-6]>/.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return html;
}

async function queryFirestore(collection: string, field: string, value: string) {
  const url = `${FIRESTORE_BASE}:runQuery?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: collection }],
        where: {
          fieldFilter: {
            field: { fieldPath: field },
            op: 'EQUAL',
            value: { stringValue: value },
          },
        },
        limit: 1,
      },
    }),
  });
  if (!res.ok) return null;
  const data = await res.json() as any;
  if (!data?.[0]?.document) return null;
  const doc = data[0].document;
  const fields = doc.fields || {};
  const id = doc.name?.split('/').pop() || '';
  return { id, fields };
}

async function getDocument(collection: string, docId: string) {
  const url = `${FIRESTORE_BASE}/${collection}/${docId}?key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json() as any;
  return { id: docId, fields: data.fields || {} };
}

function extractString(fields: any, key: string): string {
  const val = fields?.[key];
  if (!val) return '';
  return val.stringValue || val.integerValue?.toString() || '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = (req.query.slug as string) || '';

  if (!slug) {
    res.status(400).json({ error: 'Missing slug parameter' });
    return;
  }

  try {
    const articleResult = await queryFirestore('contents', 'slug', slug);
    if (!articleResult) {
      const html = fs.readFileSync(path.join(process.cwd(), 'dist', 'index.html'), 'utf-8');
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(html);
      return;
    }

    const { fields } = articleResult;
    const title = extractString(fields, 'title');
    const description = extractString(fields, 'description');
    const body = extractString(fields, 'body');
    const categoryId = extractString(fields, 'categoryId');
    const type = extractString(fields, 'type');

    let categoryName = '';
    if (categoryId) {
      const catResult = await getDocument('categories', categoryId);
      if (catResult) {
        categoryName = extractString(catResult.fields, 'name');
      }
    }

    const articleHtml = markdownToHtml(body || description);

    const articleData = JSON.stringify({
      title,
      summary: description,
      content: articleHtml,
      category: categoryName,
      tags: [categoryName].filter(Boolean),
    });

    let html = fs.readFileSync(path.join(process.cwd(), 'dist', 'index.html'), 'utf-8');
    html = html.replace(
      '</head>',
      `\n<script type="application/json" id="article-data">${articleData}</script>\n</head>`
    );

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal error' });
  }
}
