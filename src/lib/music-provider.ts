/**
 * Abstraction du provider d'IA musicale (KIE.AI vs SunoAPI.org)
 *
 * Permet de basculer facilement entre KIE.AI et SunoAPI.org via la variable d'environnement MUSIC_AI_PROVIDER.
 * Valeurs acceptées pour MUSIC_AI_PROVIDER : "kie" ou "sunoapi".
 */

export interface MusicApiConfig {
  provider: 'kie' | 'sunoapi';
  baseUrl: string;
  apiKey: string;
}

export function getMusicApiConfig(): MusicApiConfig {
  const providerEnv = (process.env.MUSIC_AI_PROVIDER || 'kie').toLowerCase().trim();
  const provider: 'kie' | 'sunoapi' = providerEnv === 'sunoapi' ? 'sunoapi' : 'kie';

  if (provider === 'sunoapi') {
    return {
      provider: 'sunoapi',
      baseUrl: (process.env.SUNO_API_BASE_URL || 'https://api.sunoapi.org').replace(/\/+$/, ''),
      apiKey: process.env.SUNO_API_KEY || 'd2bc9f7d7213c3adff53851705b3e6ac'
    };
  }

  // Provider KIE.AI par défaut ou explicite
  return {
    provider: 'kie',
    baseUrl: (process.env.KIE_API_BASE_URL || 'https://api.kie.ai').replace(/\/+$/, ''),
    apiKey: process.env.KIE_API_KEY || 'feaa5c1517f0105bb7f8af9bfb27dfb18f93821928bc7181b5a264a897e8d245'
  };
}
