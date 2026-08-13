/**
 * Validation d'URLs pour contrer les attaques SSRF (Server-Side Request Forgery).
 * Assure que seules des URLs HTTPS pointant vers des fournisseurs de confiance
 * peuvent être récupérées ou proxifiées par le serveur.
 */
export function isValidMediaUrl(urlString: string | null | undefined): boolean {
  if (!urlString || typeof urlString !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(urlString.trim());

    // 1. Protocole HTTPS ou HTTP uniquement
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // 2. Bloquer les IP privées / localhost / loopback / Cloud Metadata
    const isLocalOrPrivate =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '0.0.0.0' ||
      hostname === '169.254.169.254' || // AWS / GCP / Azure Metadata
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) !== null ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal');

    if (isLocalOrPrivate) {
      return false;
    }

    // 3. Récupérer le domaine Supabase configuré
    let supabaseHost = '';
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.toLowerCase();
      }
    } catch {
      // ignore
    }

    // 4. Liste blanche des domaines autorisés pour les médias (Suno, KIE, Supabase Storage, Google)
    const isAllowedDomain =
      (supabaseHost && (hostname === supabaseHost || hostname.endsWith(`.${supabaseHost}`))) ||
      hostname === 'suno.com' ||
      hostname.endsWith('.suno.com') ||
      hostname === 'suno.ai' ||
      hostname.endsWith('.suno.ai') ||
      hostname === 'kie.ai' ||
      hostname.endsWith('.kie.ai') ||
      hostname === 'supabase.co' ||
      hostname.endsWith('.supabase.co') ||
      hostname.endsWith('.supabase.in') ||
      hostname === 'lh3.googleusercontent.com';

    return isAllowedDomain;
  } catch {
    return false;
  }
}
