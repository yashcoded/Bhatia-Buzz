/**
 * Data Export Utility
 * Implements GDPR "Right to Data Portability" - allows users to export their data
 */

import { User, Post, Request, MatrimonialProfile } from '../types';
import * as firestoreService from '../services/firebase/firestore';

export interface UserDataExport {
  user: User;
  posts: Post[];
  requests: Request[];
  matrimonialProfile?: MatrimonialProfile;
  exportDate: string;
  exportVersion: string;
}

/**
 * Export all user data for GDPR compliance
 */
export async function exportUserData(userId: string, userData?: User): Promise<UserDataExport> {
  try {
    // Fetch user's posts
    const allPosts = await firestoreService.getPosts();
    const userPosts = allPosts.filter(post => post.userId === userId);
    
    // Fetch user's requests
    const allRequests = await firestoreService.getRequests();
    const userRequests = allRequests.filter(request => request.userId === userId);
    
    // Fetch matrimonial profile if exists
    let matrimonialProfile: MatrimonialProfile | undefined;
    try {
      const profiles = await firestoreService.getMatrimonialProfiles();
      matrimonialProfile = profiles.find(p => p.userId === userId);
    } catch (error) {
      console.log('No matrimonial profile found or error fetching:', error);
    }
    
    const exportData: UserDataExport = {
      user: userData || ({} as User), // User data should be passed from the component
      posts: userPosts,
      requests: userRequests,
      matrimonialProfile,
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
    };
    
    return exportData;
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw new Error('Failed to export user data');
  }
}

/**
 * Convert export data to JSON string
 */
export function exportDataToJSON(data: UserDataExport): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Download export data (for web) or share (for mobile)
 */
export async function downloadUserData(data: UserDataExport): Promise<void> {
  const jsonString = exportDataToJSON(data);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // For mobile, you would use a sharing mechanism
  // For web, you would trigger a download
  if (typeof window !== 'undefined' && window.navigator) {
    // Web download
    const link = document.createElement('a');
    link.href = url;
    link.download = `bhatia-buzz-data-export-${data.exportDate.split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

