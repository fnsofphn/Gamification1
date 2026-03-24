import { supabase } from '../lib/supabase/client';
import { env } from '../lib/env';

const isDemo = env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co';
const DEMO_PARTICIPANTS_KEY = 'demo_participants';
const canUseStorage = typeof window !== 'undefined';

export const participantsService = {
  async createParticipant(displayName: string, unitName?: string) {
    if (isDemo) {
      const participant = {
        id: 'demo-participant-' + Date.now(),
        display_name: displayName,
        unit_name: unitName || null,
        created_at: new Date().toISOString(),
      };

      if (canUseStorage) {
        const participants = JSON.parse(window.localStorage.getItem(DEMO_PARTICIPANTS_KEY) || '[]');
        window.localStorage.setItem(DEMO_PARTICIPANTS_KEY, JSON.stringify([participant, ...participants]));
      }

      return participant;
    }
    const { data, error } = await supabase
      .from('participants')
      .insert({ display_name: displayName, unit_name: unitName || null })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
