export interface ICreateCategory {
  name: string;
  status?: number;
}

export interface IUpdateCategory {
  name?: string;
  status?: number;
  image?: string;
}

export interface IGetCategoryFilter {
  actives: boolean;
}
