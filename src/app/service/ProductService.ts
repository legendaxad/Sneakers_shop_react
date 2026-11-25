import type { Product, ProductCountInquiry, ProductInquiry } from '../../lib/types/product';
import { api, isNoData, toApiError } from './apiClient';

/** Product endpoints (/product/*). */
class ProductService {
  /** Returns an empty list when nothing matches (backend answers 404 "No data found!"). */
  public async getProducts(input: ProductInquiry = {}): Promise<Product[]> {
    try {
      const { data } = await api.get<Product[]>('/product/all', { params: input });
      return data;
    } catch (err) {
      const error = toApiError(err);
      if (isNoData(error)) return [];
      throw error;
    }
  }

  public async getProductCount(input: ProductCountInquiry = {}): Promise<number> {
    const { data } = await api.get<{ total: number }>('/product/count', { params: input });
    return data.total;
  }

  /**
   * Loads specific products (wishlist, recently viewed) in the given order.
   * Uses /product/all?ids=… so no product views are recorded. Unavailable
   * products are simply absent from the result.
   */
  public async getProductsByIds(ids: string[]): Promise<Product[]> {
    const unique = [...new Set(ids)].slice(0, 50);
    if (!unique.length) return [];
    const list = await this.getProducts({ ids: unique.join(','), page: 1, limit: 50 });
    const byId = new Map(list.map((product) => [product._id, product]));
    return unique.map((id) => byId.get(id)).filter((product): product is Product => !!product);
  }

  /** One product; the backend records a view for signed-in members. */
  public async getProduct(productId: string): Promise<Product> {
    const { data } = await api.get<Product>(`/product/${encodeURIComponent(productId)}`);
    return data;
  }
}

export default ProductService;
