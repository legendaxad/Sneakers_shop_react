export type MemberType = 'ADMIN' | 'USER' | 'SHOP';
export type MemberStatus = 'ACTIVE' | 'BLOCK' | 'DELETE';

export interface Member {
  _id: string;
  memberType: MemberType;
  memberStatus: MemberStatus;
  memberNick: string;
  memberPhone: string;
  memberPassword?: string;
  memberAddress?: string;
  memberDesc?: string;
  memberImage?: string;
  memberPoint: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  member: Member;
  accessToken: string;
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
}
