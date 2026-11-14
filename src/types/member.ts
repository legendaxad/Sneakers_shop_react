export type MemberType = 'ADMIN' | 'USER' | 'SHOP';
export type MemberStatus = 'ACTIVE' | 'BLOCK' | 'DELETE';

export interface DeliveryAddress {
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region?: string;
  postalCode?: string;
  country: string;
}

export interface Member {
  _id: string;
  memberType: MemberType;
  memberStatus: MemberStatus;
  memberNick: string;
  memberPhone: string;
  memberAddress?: string;
  memberDesc?: string;
  memberImage?: string;
  memberDeliveryAddress?: DeliveryAddress;
  memberPoint: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Public leaderboard entry from GET /member/top-users (no private fields). */
export interface TopMember {
  _id: string;
  memberNick: string;
  memberImage?: string;
  memberPoint: number;
}

/** The backend sets the `accessToken` cookie (httpOnly); only the member is returned. */
export interface AuthResponse {
  member: Member;
}

export interface LoginInput {
  memberIdentity: string;
  memberPassword: string;
}

export interface SignupInput {
  memberNick: string;
  memberPhone: string;
  memberPassword: string;
  memberAddress?: string;
  memberDesc?: string;
}

export interface ProfileUpdateInput {
  memberNick?: string;
  memberPhone?: string;
  memberPassword?: string;
  memberAddress?: string;
  memberDesc?: string;
  memberDeliveryAddress?: DeliveryAddress;
}
