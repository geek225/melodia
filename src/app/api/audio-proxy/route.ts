import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        // Suno might block requests with certain missing headers or origin checks
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,application/ogg;q=0.7,video/*;q=0.6,*/*;q=0.5',
      },
    });

    if (!response.ok) {
      return new NextResponse('Failed to fetch audio from source', { status: response.status });
    }

    // Stream the audio response back to the client
    const headers = new Headers(response.headers);
    // Overwrite CORS and caching headers to ensure the browser accepts the stream
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    headers.delete('content-disposition'); // Ensure it plays inline and doesn't download
    headers.delete('content-encoding'); // Prevent decoding errors on the client
    headers.delete('content-length'); // Prevent mismatch if chunked or uncompressed

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Audio proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
