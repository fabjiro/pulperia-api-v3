import { UserRes } from '../../user/interface/user.interface';

export interface IAuthRes {
  user: UserRes;
  token: string;
  refreshToken: string;
}
