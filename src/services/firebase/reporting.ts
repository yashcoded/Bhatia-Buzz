import { collection, addDoc, Timestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firestore } from './config';
import { COLLECTIONS } from '../../constants/config';

export type ReportType = 'spam' | 'inappropriate' | 'harassment' | 'fake' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface Report {
  id?: string;
  userId: string;
  reportedUserId?: string;
  reportedPostId?: string;
  reportedRequestId?: string;
  reportedProfileId?: string;
  reportType: ReportType;
  description?: string;
  status: ReportStatus;
  adminNotes?: string;
  createdAt: string; // ISO string for Redux
}

/**
 * Create a report
 */
export const createReport = async (
  userId: string,
  reportData: {
    reportedUserId?: string;
    reportedPostId?: string;
    reportedRequestId?: string;
    reportedProfileId?: string;
    reportType: ReportType;
    description?: string;
  }
): Promise<string> => {
  const report: Omit<Report, 'id' | 'createdAt'> = {
    userId,
    ...reportData,
    status: 'pending',
  };

  const docRef = await addDoc(collection(firestore, COLLECTIONS.REPORTS || 'reports'), {
    ...report,
    createdAt: Timestamp.now(),
  });

  return docRef.id;
};

/**
 * Get reports for a user (admin only)
 */
export const getReports = async (status?: ReportStatus): Promise<Report[]> => {
  let q = query(
    collection(firestore, COLLECTIONS.REPORTS || 'reports'),
    orderBy('createdAt', 'desc')
  );

  if (status) {
    q = query(q, where('status', '==', status));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
  })) as Report[];
};
