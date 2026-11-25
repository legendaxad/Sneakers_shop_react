import type { AuthResponse, LoginInput, Member, MemberInput, MemberUpdateInput, TopMember } from '../../lib/types/member';
import { api } from './apiClient';

/**
 * Builds multipart/form-data for endpoints that accept an optional `memberImage`
 * upload. Signup omits empty optional fields; update keeps `''` so a cleared
 * field (e.g. bio) is still saved when a photo is uploaded at the same time.
 */
const toFormData = (fields: object, file: File, { skipEmpty }: { skipEmpty: boolean }): FormData => {
  const form = new FormData();
  form.append('memberImage', file);
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null || (skipEmpty && value === '')) return;
    form.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
  });
  return form;
};

/**
 * Member endpoints (/member/*). Errors reach callers as `ApiError`
 * (normalised by the apiClient interceptor).
 */
class MemberService {
  public async login(input: LoginInput): Promise<Member> {
    const { data } = await api.post<AuthResponse>('/member/login', input);
    return data.member;
  }

  /** Sends multipart/form-data when a profile image is attached, JSON otherwise. */
  public async signup(input: MemberInput, file?: File): Promise<Member> {
    const { data } = await api.post<AuthResponse>('/member/signup', file ? toFormData(input, file, { skipEmpty: true }) : input);
    return data.member;
  }

  public async logout(): Promise<void> {
    await api.post('/member/logout');
  }

  /** The signed-in member (GET /member/detail); 401 when there is no valid session cookie. */
  public async getMemberDetail(): Promise<Member> {
    const { data } = await api.get<Member>('/member/detail');
    return data;
  }

  /** Sends multipart/form-data when a new profile image is attached, JSON otherwise. */
  public async updateMember(input: MemberUpdateInput, file?: File): Promise<Member> {
    const { data } = await api.post<Member>('/member/update', file ? toFormData(input, file, { skipEmpty: false }) : input);
    return data;
  }

  public async getTopUsers(): Promise<TopMember[]> {
    const { data } = await api.get<TopMember[]>('/member/top-users');
    return data;
  }
}

export default MemberService;
