import { createClient } from '@supabase/supabase-js'

const getCreds = () => {
  return {
    url: import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('VITE_SUPABASE_URL') || '',
    key: import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('VITE_SUPABASE_ANON_KEY') || ''
  };
};

export const getSupabaseClient = () => {
  const { url, key } = getCreds();
  if (url && key) {
    return createClient(url, key);
  }
  return null;
};

export const syncResultToSupabase = async (packageId, sessionId, results, ip, attemptId) => {
  const client = getSupabaseClient();
  if (!client) return null;
  
  // We use upsert so that every 5 questions we just update the same row for this specific attempt
  const { data, error } = await client
    .from('pajak_exam_results')
    .upsert([
      { 
        attempt_id: attemptId, // Unique ID for this specific test session
        package_id: packageId, 
        session_id: sessionId, 
        results: results, 
        user_ip: ip,
        created_at: new Date().toISOString()
      }
    ], { onConflict: 'attempt_id' });
    
  if (error) console.error('Error syncing to Supabase:', error);
  return data;
};

export const fetchAllGlobalResults = async () => {
  const client = getSupabaseClient();
  if (!client) return [];
  
  const { data, error } = await client
    .from('pajak_exam_results')
    .select('*');
    
  if (error) {
    console.error('Error fetching global results:', error);
    return [];
  }
  return data.map(item => ({
    packageId: item.package_id,
    sessionId: item.session_id,
    results: item.results,
    ip: item.user_ip,
    timestamp: item.created_at
  }));
};
