import type { ProductCollection, ProductStatus } from '../enums/product.enum';

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

/** Sort keys accepted by GET /product/all?order=… */
export type ProductOrder = 'createdAt' | 'productPrice' | 'productViews';

/** Query for GET /product/all (and, without paging/order, GET /product/count). */
export interface ProductInquiry {
  page?: number;
  limit?: number;
  order?: ProductOrder;
  productCollection?: ProductCollection;
  search?: string;
  /** Comma-separated product ids (max 50); used for wishlist / recently viewed. */
  ids?: string;
}

export type ProductCountInquiry = Omit<ProductInquiry, 'page' | 'limit' | 'order'>;
