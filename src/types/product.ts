export enum ProductCollection {
  RUNNING = 'RUNNING',
  CASUAL = 'CASUAL',
  BASKETBALL = 'BASKETBALL',
  FOOTBALL = 'FOOTBALL',
  TRAINING = 'TRAINING',
  LIFESTYLE = 'LIFESTYLE',
  OTHER = 'OTHER',
}

export enum ProductStatus {
  PAUSE = 'PAUSE',
  PROCESS = 'PROCESS',
  DELETE = 'DELETE',
}

export interface Product {
  _id: string;
  productName: string;
  productBrand: string;
  productCategory: ProductCollection;
  productPrice: number;
  productDesc: string;
  productImages: string[];
  productSizes: number[];
  productLeftCount: number;
  productStatus: ProductStatus;
  productViews: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  order?: 'createdAt' | 'productPrice';
  productCollection?: ProductCollection;
  search?: string;
}
