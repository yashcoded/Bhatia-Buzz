// User Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  createdAt: string; // ISO string for Redux serialization
  role: 'user' | 'admin';
  profile?: UserProfile;
  /** Set from Firebase Auth; true after user verifies email via link */
  emailVerified?: boolean;
  /** True when user has been suspended (e.g. 5+ reports). Checked on load; suspended users are signed out. */
  suspended?: boolean;
}

export interface UserProfile {
  userId: string;
  bio?: string;
  location?: string;
  interests?: string[];
  profileImage?: string;
}

// Post Types
export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  imageUrl?: string;
  createdAt: string; // ISO string for Redux serialization
  likes: number;
  comments: Comment[];
  likedBy: string[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string; // ISO string for Redux serialization
}

// Request Types
export interface Request {
  id: string;
  type: 'condolence' | 'celebration' | 'match';
  userId: string;
  userName: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: string; // ISO string for Redux serialization
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  adminNotified?: boolean; // Track if admin has been notified
  matchDetails?: {
    profileId1?: string;
    profileId2?: string;
    matchScore?: number;
  }; // For match requests
}

// Matrimonial Types
export interface MatrimonialProfile {
  id: string;
  userId: string;
  personalInfo: PersonalInfo;
  familyInfo: FamilyInfo;
  preferences: Preferences;
  photos: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string; // ISO string for Redux serialization
  adminNotes?: string;
}

export interface PersonalInfo {
  name: string;
  surname: string;
  age?: number; // Can be calculated from dateOfBirth
  dateOfBirth: string; // Format: DD/MM/YYYY
  gender: 'male' | 'female';
  height: string; // Display: 5'6" or 170 cm
  heightInCm?: number; // Stored for conversion (show both units on cards)
  physicalDisability: boolean;
  timeOfBirth?: string; // Format: HH:MM AM/PM
  placeOfBirth: string;
  nativePlace: string;
  engagedBeforeOrDivorcee: boolean;
  caste?: string;
  religion?: string;
  gotra?: string;
  complexion?: string;
  education: string; // Qualification
  occupation: string; // Job
  nationality?: string;
  presentAddress: string;
  emailId: string; // Contact
  phoneNumber?: string;
  bio?: string;
}

export interface FamilyInfo {
  fatherName: string; // Father
  motherName: string; // Mother
  grandParents?: string;
  maternalGrandParents?: string;
  siblings?: number;
  youngerBrothers?: number; // number of younger siblings
  youngerSiblingNames?: string; // names of younger siblings
  familyBackground?: string;
}

export interface Preferences {
  minAge?: number;
  maxAge?: number;
  education?: string[];
  location?: string[];
  other?: string;
}

export interface Match {
  id: string;
  profileId1: string;
  profileId2: string;
  matchScore: number;
  createdAt: string; // ISO string for Redux serialization
  status: 'pending' | 'accepted' | 'rejected';
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Feed: undefined;
  PanjaKhada: undefined;
  Requests: { openMyRequests?: boolean } | undefined;
  Matrimonial: undefined;
  Profile: undefined;
  RequestDetail: { requestId: string };
  MatrimonialDetail: { profileId: string };
  MatrimonialSwipe: undefined;
  MatchFilter: undefined;
  Settings: undefined;
  EditProfile: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  CreateMatrimonialProfile: undefined;
  AboutDeveloper: undefined;
  AdminPendingRequests: undefined;
  AdminPendingMatrimonial: undefined;
};
// Redux State Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface FeedState {
  posts: Post[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

export interface RequestsState {
  requests: Request[];
  loading: boolean;
  error: string | null;
}

export interface MatrimonialState {
  profiles: MatrimonialProfile[];
  currentProfile?: MatrimonialProfile;
  matches: Match[];
  loading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  feed: FeedState;
  requests: RequestsState;
  matrimonial: MatrimonialState;
}


