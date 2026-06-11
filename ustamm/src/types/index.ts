export enum UserRole {
  CUSTOMER = 'customer',
  TRADESMAN = 'tradesman',
}

export enum JobStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum OfferStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export type Category =
  | 'elektrik'
  | 'su_tesisati'
  | 'tadilat'
  | 'boyaci'
  | 'marangoz'
  | 'temizlik'
  | 'bahce'
  | 'kombi'
  | 'klima'
  | 'diger';

export interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
  district: string;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
  profileImage?: string;
  bio?: string;
  categories?: Category[];
  rating: number;
  totalReviews: number;
  totalJobs: number;
  isVerified: boolean;
  location?: Location;
  fcmToken?: string;
  createdAt: Date;
}

export interface Job {
  id: string;
  customerId: string;
  title: string;
  description: string;
  category: Category;
  location: Location;
  status: JobStatus;
  budget: {
    min: number;
    max: number;
  };
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  acceptedOfferId?: string;
  tradesmanId?: string;
}

export interface Offer {
  id: string;
  jobId: string;
  tradesmanId: string;
  tradesmanName: string;
  tradesmanImage?: string;
  price: number;
  message: string;
  status: OfferStatus;
  createdAt: Date;
}

export interface Review {
  id: string;
  reviewerId: string;
  targetId: string;
  jobId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  read: boolean;
  createdAt: Date;
}

export interface PaymentTransaction {
  id: string;
  jobId: string;
  customerId: string;
  tradesmanId: string;
  amount: number;
  status: 'pending' | 'paid' | 'released' | 'refunded';
  paytrToken?: string;
  merchantOid: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  jobId: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export type RootStackParamList = {
  Welcome: undefined;
  Login: { role?: UserRole };
  Register: { role: UserRole };
  RoleSelect: { preSelectedRole?: UserRole };
  CustomerHome: undefined;
  TradesmanHome: undefined;
  JobDetail: { jobId: string };
  PostJob: undefined;
  MapSearch: undefined;
  Chat: { receiverId: string; jobId: string; receiverName: string };
  Review: { jobId: string; targetId: string; targetName: string };
  Payment: { jobId: string; amount: number; merchantOid: string };
  TradesmanProfile: { userId: string };
};
