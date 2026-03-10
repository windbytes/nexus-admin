/**
 * Engine 插件市场 API
 * 路径与后端 /engine/market 一致
 */
import type { PageResult } from '@/types/global';
import { HttpRequest } from '@/utils/request';
import type {
  MarketPluginListing,
  MarketPluginInstallation,
  MarketPluginReview,
  MarketListingVO,
  MarketSearchParams,
  MarketInstallRequest,
} from './types';

const MarketApi = {
  plugins: '/engine/market/plugins',
  pluginById: (id: string) => `/engine/market/plugins/${id}`,
  pluginOffline: (id: string) => `/engine/market/plugins/${id}/offline`,
  installations: '/engine/market/installations',
  installationUpgrade: (pluginId: string) => `/engine/market/installations/${pluginId}/upgrade`,
  installationDisable: (pluginId: string) => `/engine/market/installations/${pluginId}/disable`,
  installationEnable: (pluginId: string) => `/engine/market/installations/${pluginId}/enable`,
  installationDelete: (pluginId: string) => `/engine/market/installations/${pluginId}`,
  available: '/engine/market/available',
  reviews: (listingId: string) => `/engine/market/reviews/${listingId}`,
  reviewSubmit: '/engine/market/reviews',
};

export const marketService = {
  async search(params: MarketSearchParams): Promise<PageResult<MarketListingVO>> {
    return HttpRequest.get<PageResult<MarketListingVO>>(
      { url: MarketApi.plugins, params },
      { successMessageMode: 'none' }
    );
  },

  async getDetail(listingId: string): Promise<MarketListingVO> {
    return HttpRequest.get<MarketListingVO>(
      { url: MarketApi.pluginById(listingId) },
      { successMessageMode: 'none' }
    );
  },

  async publish(listing: Partial<MarketPluginListing>): Promise<MarketPluginListing> {
    return HttpRequest.post<MarketPluginListing>({ url: MarketApi.plugins, data: listing });
  },

  async updateListing(listingId: string, listing: Partial<MarketPluginListing>): Promise<MarketPluginListing> {
    return HttpRequest.put<MarketPluginListing>({
      url: MarketApi.pluginById(listingId),
      data: { ...listing, id: listingId },
    });
  },

  async offline(listingId: string): Promise<void> {
    await HttpRequest.put({ url: MarketApi.pluginOffline(listingId) });
  },

  async install(tenantId: string, request: MarketInstallRequest): Promise<MarketPluginInstallation> {
    return HttpRequest.post<MarketPluginInstallation>({
      url: MarketApi.installations,
      params: { tenantId },
      data: request,
    });
  },

  async upgrade(tenantId: string, pluginId: string, pluginVersionId: string): Promise<MarketPluginInstallation> {
    return HttpRequest.put<MarketPluginInstallation>({
      url: MarketApi.installationUpgrade(pluginId),
      params: { tenantId, pluginVersionId },
    });
  },

  async disable(tenantId: string, pluginId: string): Promise<void> {
    await HttpRequest.put({ url: MarketApi.installationDisable(pluginId), params: { tenantId } });
  },

  async enable(tenantId: string, pluginId: string): Promise<void> {
    await HttpRequest.put({ url: MarketApi.installationEnable(pluginId), params: { tenantId } });
  },

  async uninstall(tenantId: string, pluginId: string): Promise<void> {
    await HttpRequest.delete({ url: MarketApi.installationDelete(pluginId), params: { tenantId } });
  },

  async listInstallations(tenantId: string): Promise<MarketPluginInstallation[]> {
    const res = await HttpRequest.get<MarketPluginInstallation[]>(
      { url: MarketApi.installations, params: { tenantId } },
      { successMessageMode: 'none' }
    );
    return res ?? [];
  },

  async listAvailable(tenantId: string, pluginType?: string): Promise<MarketListingVO[]> {
    const res = await HttpRequest.get<MarketListingVO[]>(
      { url: MarketApi.available, params: { tenantId, pluginType } },
      { successMessageMode: 'none' }
    );
    return res ?? [];
  },

  async submitReview(review: Partial<MarketPluginReview>): Promise<MarketPluginReview> {
    return HttpRequest.post<MarketPluginReview>({ url: MarketApi.reviewSubmit, data: review });
  },

  async getReviews(listingId: string, page = 1, size = 20): Promise<PageResult<MarketPluginReview>> {
    return HttpRequest.get<PageResult<MarketPluginReview>>(
      { url: MarketApi.reviews(listingId), params: { page, size } },
      { successMessageMode: 'none' }
    );
  },
};
