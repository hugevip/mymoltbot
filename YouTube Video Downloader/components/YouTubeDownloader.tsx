import { useState } from 'react';

export default function YouTubeDownloader() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchVideoInfo = async () => {
    if (!url) {
      setError('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      // First try with yt-dlp (preferred)
      const response = await fetch('/api/youtube-info-yt-dlp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        // Fallback to ytdl-core if yt-dlp fails
        const fallbackResponse = await fetch('/api/youtube-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });

        if (!fallbackResponse.ok) {
          throw new Error('Both yt-dlp and ytdl failed');
        }

        const data = await fallbackResponse.json();
        setVideoInfo(data);
      } else {
        const data = await response.json();
        setVideoInfo(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch video info');
    } finally {
      setLoading(false);
    }
  };

  const downloadVideo = async (itag: string) => {
    if (!url) return;

    try {
      const response = await fetch('/api/youtube-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, itag }),
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Create a blob from the response and trigger download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${videoInfo?.title || 'video'}.mp4`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError('Download failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">YouTube Video Downloader</h1>
      
      <div className="mb-6 flex">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter YouTube URL"
          className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={fetchVideoInfo}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-r-lg disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Info'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {videoInfo && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <img 
                  src={videoInfo.thumbnail} 
                  alt={videoInfo.title}
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="md:w-2/3">
                <h2 className="text-xl font-bold mb-2">{videoInfo.title}</h2>
                <p className="text-gray-600 mb-2">By: {videoInfo.author}</p>
                <p className="text-gray-600 mb-4">Duration: {Math.floor(parseInt(videoInfo.duration)/60)}:{parseInt(videoInfo.duration)%60}</p>
                
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Available Formats:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {videoInfo.formats.map((format: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => downloadVideo(format.itag)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-left"
                      >
                        <div className="font-medium">{format.quality || 'Unknown'}</div>
                        <div className="text-sm opacity-80">{format.mimeType}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}