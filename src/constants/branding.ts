/**
 * Nexus Veritas Certification - Brand Assets
 * 
 * In light theme: Official Orange & Navy Blue logo variant.
 * In dark theme: Official Glowing Orange & White logo variant.
 */

export const NEXUS_BRAND_LOGO_DARK = 'https://i.postimg.cc/zvWspM3H/Chat-GPT-Image-8-de-out-de-2026-18-07-55.png';
export const NEXUS_BRAND_LOGO_LIGHT = 'https://i.postimg.cc/ryjS4Wqj/Logotipo-Nexus-Veritas-Certification-em-Laranja-e-Marinho.png';

export const getNexusBrandLogo = (theme?: string): string => {
  return theme === 'light' ? NEXUS_BRAND_LOGO_LIGHT : NEXUS_BRAND_LOGO_DARK;
};
