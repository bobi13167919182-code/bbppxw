
export interface MemeProject {
  name: string;
  ticker: string;
  concept: string;
  targetAudience: string;
  chain: string;
}

export interface BrandKit {
  logoUrl?: string;
  bannerUrl?: string;
  tagline: string;
  missionStatement: string;
  colors: string[];
  visualStyle: string;
}

export interface ContentPackage {
  tweets: string[];
  tgAnnouncements: string[];
  webCopy: {
    heroTitle: string;
    heroSubtitle: string;
    roadmap: { stage: string; goals: string[] }[];
  };
}

export type GenerationStep = 'INIT' | 'BRANDING' | 'VISUALS' | 'CONTENT' | 'DISTRIBUTION' | 'READY' | 'HOTSPOT';
