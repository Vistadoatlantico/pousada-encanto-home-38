import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useVisitorTracking = (pagePath: string = '/') => {
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // Check if already tracked today using localStorage with date
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const trackingKey = `visitor_tracked_${today}`;
        
        if (localStorage.getItem(trackingKey)) {
          console.log('Already tracked today:', today);
          return;
        }

        console.log('Tracking visitor for page:', pagePath);
        
        const { data, error } = await supabase.functions.invoke('track-visitor', {
          body: { pagePath }
        });

        if (error) {
          console.error('Error tracking visitor:', error);
          return;
        }

        console.log('Visitor tracking result:', data);
        
        // Mark as tracked for today if successfully tracked
        if (data?.success && !data?.alreadyTracked) {
          localStorage.setItem(trackingKey, 'true');
        }
        
      } catch (error) {
        console.error('Error in visitor tracking:', error);
      }
    };

    // Track after a small delay to ensure page is loaded
    const timer = setTimeout(trackVisitor, 1000);
    
    return () => clearTimeout(timer);
  }, [pagePath]);
};