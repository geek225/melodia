import { NextRequest, NextResponse } from 'next/server';
import { isValidMediaUrl } from '@/lib/url-validator';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const filename = request.nextUrl.searchParams.get('filename') || 'Meliodia_Music.mp3';

  if (!url) {
    return new NextResponse('Paramètre URL manquant', { status: 400 });
  }

  if (!isValidMediaUrl(url)) {
    return new NextResponse('URL de téléchargement invalide ou non autorisée', { status: 403 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'audio/webm,audio/ogg,audio/wav,audio/mpeg,audio/*;q=0.9,*/*;q=0.5',
      },
    });

    if (!response.ok) {
      return new NextResponse('Fichier audio introuvable ou lien expiré sur le serveur distant', { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();

    if (arrayBuffer.byteLength === 0) {
      return new NextResponse('Le fichier audio distant est vide (0 octet). Le lien a probablement expiré.', { status: 410 });
    }

    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('Content-Type') || 'audio/mpeg');
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    headers.set('Content-Length', arrayBuffer.byteLength.toString());
    headers.set('Access-Control-Allow-Origin', '*');

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers,
    });
  } catch (error: unknown) {
    console.error('Download error:', error);
    return new NextResponse('Erreur lors du téléchargement du fichier audio', { status: 500 });
  }
}
