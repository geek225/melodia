import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const filename = request.nextUrl.searchParams.get('filename') || 'Meliodia_Music.mp3';

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return new NextResponse('Failed to fetch audio from source', { status: response.status });
    }

    const headers = new Headers(response.headers);
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    headers.set('Access-Control-Allow-Origin', '*');
    
    // Si c'est un fichier externe, on supprime quelques headers stricts pour que le proxy marche
    headers.delete('content-encoding');
    headers.delete('content-length');

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
