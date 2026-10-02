import React, { useEffect } from 'react';

// AdBanner is disabled / cancelled upon user request.
// All advertisement networks and scripts have been permanently removed.
export interface AdBannerProps {
  variant?: 'compact' | 'wide' | 'card';
  showNativeSlot?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = () => {
  useEffect(() => {
    try {
      // Clear any legacy ad storage keys
      localStorage.removeItem('studypro_custom_ad_image');
      localStorage.removeItem('studypro_video_ad_link');
      
      // Clean up any dynamic ad scripts if still present in DOM
      const existingScript = document.getElementById('adsterra-native-banner-script');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript.parentNode);
      }
    } catch {
      // ignore
    }
  }, []);

  return null;
};
