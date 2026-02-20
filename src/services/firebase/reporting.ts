import { collection, addDoc, Timestamp, query, where, getDocs, orderBy, limit, updateDoc, doc } from 'firebase/firestore';
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

  // Waze-style: 5 reports against a user → suspend
  if (reportData.reportedUserId) {
    try {
      const count = await getReportCountForUser(reportData.reportedUserId);
      if (count >= 5) {
        await setUserSuspended(reportData.reportedUserId);
      }
    } catch (err) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn('Report count/suspend check failed:', err);
    }
  }

  return docRef.id;
};

const REPORTS_COLLECTION = COLLECTIONS.REPORTS || 'reports';

/** Number of reports filed against this user (any status). */
export const getReportCountForUser = async (reportedUserId: string): Promise<number> => {
  const q = query(
    collection(firestore, REPORTS_COLLECTION),
    where('reportedUserId', '==', reportedUserId),
    limit(100)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
};

/** Mark user as suspended in Firestore (e.g. after 5 reports). They will be signed out on next auth check. */
export const setUserSuspended = async (userId: string): Promise<void> => {
  const userRef = doc(firestore, COLLECTIONS.USERS, userId);
  await updateDoc(userRef, { suspended: true });
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
