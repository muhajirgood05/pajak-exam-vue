import { PACKAGES } from './soalBank.js';
import { getSupabaseClient, syncResultToSupabase, fetchAllGlobalResults } from './supabase.js';

// Simple statistics manager
// For 'Everyone' stats, in a real app we'd use Supabase/Firebase.
// Here we'll implement a structure that can be easily synced to GitHub or a DB.

export const saveResultLocally = async (packageId, sessionId, results, ip, attemptId) => {
  const allResults = JSON.parse(localStorage.getItem('pajak_exam_all_results') || '[]');
  
  // Find if this attempt already exists in local storage to update it (upsert locally)
  const existingIndex = allResults.findIndex(r => r.attemptId === attemptId);
  
  const resultEntry = {
    timestamp: new Date().toISOString(),
    packageId,
    sessionId,
    ip,
    attemptId,
    results // { questionId: isCorrect }
  };
  
  if (existingIndex > -1) {
    allResults[existingIndex] = resultEntry;
  } else {
    allResults.push(resultEntry);
  }
  
  localStorage.setItem('pajak_exam_all_results', JSON.stringify(allResults));

  // Sync to global DB if configured
  if (getSupabaseClient()) {
    await syncResultToSupabase(packageId, sessionId, results, ip, attemptId);
  }
  
  return resultEntry;
};

export const getAggregatedStats = (allResults) => {
  const stats = {}; // { packageId: { questionId: { correct: 0, wrong: 0, total: 0 } } }
  
  allResults.forEach(entry => {
    if (!stats[entry.packageId]) {
      stats[entry.packageId] = {
        questions: {},
        totalSubmissions: 0,
        uniqueIPs: new Set()
      };
    }
    
    stats[entry.packageId].totalSubmissions++;
    stats[entry.packageId].uniqueIPs.add(entry.ip);
    
    Object.entries(entry.results).forEach(([qId, resObj]) => {
      // Handle both old (boolean) and new (object) format
      const isCorrect = typeof resObj === 'boolean' ? resObj : resObj.correct;
      const kategori = typeof resObj === 'boolean' ? 'lainnya' : resObj.kategori;

      if (!stats[entry.packageId].questions[qId]) {
        stats[entry.packageId].questions[qId] = { correct: 0, wrong: 0, kategori: kategori };
      }
      if (isCorrect) {
        stats[entry.packageId].questions[qId].correct++;
      } else {
        stats[entry.packageId].questions[qId].wrong++;
      }
    });
  });
  
  // Convert Sets to counts
  Object.keys(stats).forEach(pkgId => {
    stats[pkgId].uniqueUserCount = stats[pkgId].uniqueIPs.size;
    delete stats[pkgId].uniqueIPs;
  });
  
  return stats;
};
export const getAllStats = async () => {
  const localResults = JSON.parse(localStorage.getItem('pajak_exam_all_results') || '[]');
  
  if (!getSupabaseClient()) return getAggregatedStats(localResults);

  const globalResults = await fetchAllGlobalResults();
  
  // Merge or just use global for "Everyone"
  // For now, let's use global if available as it should include everything
  return getAggregatedStats(globalResults.length > 0 ? globalResults : localResults);
};

export const getIP = async () => {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch (e) {
    return 'unknown';
  }
};
