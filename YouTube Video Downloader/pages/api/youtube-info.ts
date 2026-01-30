import { NextApiRequest, NextApiResponse } from 'next';
import ytdl from 'ytdl-core';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Sanitize URL to prevent command injection
    const sanitizedUrl = ytdl.validateURL(url) ? url : null;
    
    if (!sanitizedUrl) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const info = await ytdl.getInfo(sanitizedUrl);
    
    // Extract relevant information
    const videoInfo = {
      title: info.videoDetails.title,
      author: info.videoDetails.author.name,
      duration: info.videoDetails.lengthSeconds,
      viewCount: info.videoDetails.viewCount,
      thumbnail: info.videoDetails.thumbnails[0]?.url,
      formats: info.formats
        .filter(format => format.hasVideo && format.hasAudio)
        .map(format => ({
          quality: format.qualityLabel,
          mimeType: format.mimeType,
          bitrate: format.bitrate,
          itag: format.itag,
        })),
    };

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(videoInfo);
  } catch (error: any) {
    console.error('YouTube info error:', error);
    res.status(500).json({ error: error.message || 'Failed to get video info' });
  }
}