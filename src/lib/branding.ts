// Creative Composites Brand Assets
// Stored in Supabase Storage: branding bucket

export const BRAND = {
  // Primary brand color
  PRIMARY_BLUE: '#0057A8',
  PRIMARY_BLUE_DARK: '#003d75',
  PRIMARY_BLUE_DARKER: '#002851',
  
  // Logo URLs from Supabase Storage
  logos: {
    // CC icon mark - Blue on transparent (for white/light backgrounds)
    ccBlue: 'https://dasjibcpxeuxhsvrwhfw.supabase.co/storage/v1/object/public/branding/Creative%20Composites%20CC%20-%20Blue,%20Transparent.png',
    
    // CC icon mark - White on transparent (for dark/colored backgrounds)
    ccWhite: 'https://dasjibcpxeuxhsvrwhfw.supabase.co/storage/v1/object/public/branding/Creative%20Composites%20CC%20-%20White,%20Transparent.png',
    
    // Full logo - Blue on white background
    fullBlueWhite: 'https://dasjibcpxeuxhsvrwhfw.supabase.co/storage/v1/object/public/branding/Creative%20Composites%20Logo%20-%20Blue,%20White.png',
    
    // Full logo - White on transparent (for dark/colored backgrounds)
    fullWhite: 'https://dasjibcpxeuxhsvrwhfw.supabase.co/storage/v1/object/public/branding/Creative%20Composites%20Logo%20-%20White,%20Transparent.png',
  },
  
  // Company info
  company: {
    name: 'Creative Composites',
    tagline: 'Machine Checklist System',
  }
} as const;

