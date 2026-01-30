import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execPromise = util.promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Validate URL format to prevent command injection
    const urlPattern = /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}/;
    if (!urlPattern.test(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Use yt-dlp to get video info
    const { stdout } = await execPromise(`yt-dlp -j "${url}"`);
    const videoInfo = JSON.parse(stdout);

    const simplifiedInfo = {
      title: videoInfo.title,
      author: videoInfo.uploader,
      duration: videoInfo.duration,
      viewCount: videoInfo.view_count,
      thumbnail: videoInfo.thumbnail,
      formats: videoInfo.formats
        ? videoInfo.formats
            .filter((format: any) => format.vcodec !== 'none' && format.acodec !== 'none')
            .map((format: any) => ({
              quality: format.format_note || format.height + 'p',
              mimeType: format.ext,
              bitrate: format.abr || format.vbr,
              itag: format.format_id,
            }))
        : [],
    };

    res.status(200).json(simplifiedInfo);
  } catch (error: any) {
    console.error('yt-dlp info error:', error);
    res.status(500).json({ error: error.message || 'Failed to get video info with yt-dlp' });
  }
}