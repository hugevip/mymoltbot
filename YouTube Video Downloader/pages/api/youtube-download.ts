import { NextApiRequest, NextApiResponse } from 'next';
import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, itag } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!itag) {
    return res.status(400).json({ error: 'ITAG is required' });
  }

  try {
    // Validate URL
    const sanitizedUrl = ytdl.validateURL(url) ? url : null;
    
    if (!sanitizedUrl) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Get video info
    const info = await ytdl.getInfo(sanitizedUrl);
    const format = ytdl.chooseFormat(info.formats, { quality: itag });

    if (!format) {
      return res.status(404).json({ error: 'Requested format not available' });
    }

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${info.videoDetails.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4"`);
    res.setHeader('Content-Type', 'video/mp4');

    // Create ytdl stream and pipe to response
    const stream = ytdl.downloadFromInfo(info, { format });
    stream.pipe(res);

  } catch (error: any) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message || 'Failed to download video' });
  }
}