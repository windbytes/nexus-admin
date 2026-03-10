/**
 * Engine 端点管理 API
 * 路径与后端 /engine/endpoints、/engine/endpoint-configs 一致
 */
import type { PageResult } from '@/types/global';
import { HttpRequest } from '@/utils/request';
import type { Endpoint, EndpointConfig, EndpointSearchParams } from './types';

const EndpointsApi = {
  list: '/engine/endpoints',
  getById: (id: string) => `/engine/endpoints/${id}`,
  create: '/engine/endpoints',
  update: (id: string) => `/engine/endpoints/${id}`,
  delete: (id: string) => `/engine/endpoints/${id}`,
  batchDelete: '/engine/endpoints/batch',
};

const EndpointConfigsApi = {
  list: '/engine/endpoint-configs',
  getById: (id: string) => `/engine/endpoint-configs/${id}`,
  create: '/engine/endpoint-configs',
  update: (id: string) => `/engine/endpoint-configs/${id}`,
  delete: (id: string) => `/engine/endpoint-configs/${id}`,
};

export const endpointService = {
  async getEndpointList(params: EndpointSearchParams): Promise<PageResult<Endpoint>> {
    return HttpRequest.get<PageResult<Endpoint>>(
      { url: EndpointsApi.list, params },
      { successMessageMode: 'none' }
    );
  },

  async getById(id: string): Promise<Endpoint | null> {
    return HttpRequest.get<Endpoint>({ url: EndpointsApi.getById(id) }, { successMessageMode: 'none' });
  },

  async addEndpoint(endpoint: Partial<Endpoint>): Promise<Endpoint> {
    return HttpRequest.post<Endpoint>({ url: EndpointsApi.create, data: endpoint });
  },

  async updateEndpoint(id: string, endpoint: Partial<Endpoint>): Promise<Endpoint> {
    return HttpRequest.put<Endpoint>({ url: EndpointsApi.update(id), data: { ...endpoint, id } });
  },

  async deleteEndpoint(id: string): Promise<void> {
    await HttpRequest.delete({ url: EndpointsApi.delete(id) });
  },

  async batchDelete(ids: string[]): Promise<number> {
    return HttpRequest.delete<number>({ url: EndpointsApi.batchDelete, data: ids });
  },
};

export const endpointConfigService = {
  async list(endpointType?: string, page = 1, size = 20): Promise<PageResult<EndpointConfig>> {
    const params: Record<string, unknown> = { page, size };
    if (endpointType) params.endpointType = endpointType;
    return HttpRequest.get<PageResult<EndpointConfig>>(
      { url: EndpointConfigsApi.list, params },
      { successMessageMode: 'none' }
    );
  },

  async getById(id: string): Promise<EndpointConfig | null> {
    return HttpRequest.get<EndpointConfig>({ url: EndpointConfigsApi.getById(id) }, { successMessageMode: 'none' });
  },

  async create(config: Partial<EndpointConfig>): Promise<EndpointConfig> {
    return HttpRequest.post<EndpointConfig>({ url: EndpointConfigsApi.create, data: config });
  },

  async update(id: string, config: Partial<EndpointConfig>): Promise<EndpointConfig> {
    return HttpRequest.put<EndpointConfig>({ url: EndpointConfigsApi.update(id), data: { ...config, id } });
  },

  async delete(id: string): Promise<void> {
    await HttpRequest.delete({ url: EndpointConfigsApi.delete(id) });
  },
};
