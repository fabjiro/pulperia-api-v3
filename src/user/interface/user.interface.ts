export interface UserRegister {
  name: string;
  email: string;
  password: string;
  rol?: number;
  avatar?: number;
}

export interface UserRes {
  name: string;
  avatar: UserAvatarRes;
}

export interface UserAvatarRes {
  original_link: string;
  min_link: string;
}
