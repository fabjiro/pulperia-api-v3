export interface ICreateProduct {
  name: string;
  image: string;
  category: number;
  status?: number;
}

export interface IUpdateProduct {
  name?: string;
  image?: string;
  category?: number;
  status?: number;
}
