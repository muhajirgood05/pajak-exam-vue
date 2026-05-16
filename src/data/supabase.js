import { createClient } from '@supabase/supabase-js'

// These should be set in environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export const syncResultToSupabase = async (packageId, sessionId, results, ip) => {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('pajak_exam_results')
    .insert([
      { 
        package_id: packageId, 
        session_id: sessionId, 
        results: results, 
        user_ip: ip,
        created_at: new Date().toISOString()
      }
    ]);
    
  if (error) console.error('Error syncing to Supabase:', error);
  return data;
};

export const fetchAllGlobalResults = async () => {
  if (!supabase) return [];
  
  const { data, error } = await supabase
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
