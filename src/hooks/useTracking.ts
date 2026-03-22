import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useTracking(sectionName: string) {
  const { userName } = useAuth();

  useEffect(() => {
    if (!userName) return;

    const logView = async () => {
      try {
        await supabase.from('usage_logs').insert([
          {
            user_name: userName,
            action: `view_section_${sectionName}`,
            timestamp: new Date().toISOString()
          }
        ]);
      } catch (error) {
        console.error('Error logging view:', error);
      }
    };

    logView();
  }, [sectionName, userName]);

  const logAction = async (action: string, metadata?: any) => {
    if (!userName) return;
    try {
      await supabase.from('usage_logs').insert([
        {
          user_name: userName,
          action,
          metadata,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  return { logAction };
}
