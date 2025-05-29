import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchAllListPages, fetchDetailPage } from '../../app/crawler';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'No url provided' });
  }
  try {
    const list = await fetchAllListPages(url);
    console.log('fetchAllListPages 결과:', list);
    const result = [];
    for (const row of list) {
      const detail = await fetchDetailPage(row.detailUrl.startsWith('http') ? row.detailUrl : new URL(row.detailUrl, url).toString());
      console.log('fetchDetailPage:', row.detailUrl, detail);
      result.push({
        id: row.id,
        number: row.number,
        title: row.title,
        category: detail.category,
        filename: detail.filename,
        downloadUrl: detail.downloadUrl,
      });
    }
    res.status(200).json({ items: result });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.stack || e.message : String(e);
    res.status(500).json({ error: message });
  }
} 