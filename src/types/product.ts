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

export type ProductOrder = 'createdAt' | 'productPrice' | 'productViews';

export interface ProductFilters {
  page?: number;
  limit?: number;
  order?: ProductOrder;
  productCollection?: ProductCollection;
  search?: string;
}
