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

export interface IProductGet {
  status?: number;
  categoryId?: number;
}

export interface IGetProductByName {
  name: string;
  status?: number;
}
