export interface ICreateProduct {
  name: string;
  category: number;
  image?: string;
  status?: number;
}

export interface IUpdateProduct {
  name?: string;
  image?: string;
  category?: number;
  status?: number;
}
