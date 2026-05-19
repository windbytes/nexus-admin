import { HttpRequest } from '@/utils/request';
import type { MarketListingVO, NodeCategory, PluginDefinition, PluginVersion } from './types';

/**
 * Engine 插件管理 API
 * 路径与后端 /engine/plugins 一致
 */
const PluginsApi = {
  registryGrouped: '/engine/plugins/registry/grouped',
  registry: '/engine/plugins/registry',
  registryCategory: (category: NodeCategory) => `/engine/plugins/registry/category/${category}`,
  definitions: '/engine/plugins/definitions',
  definitionById: (id: string) => `/engine/plugins/definitions/${id}`,
  versions: (pluginId: string) => `/engine/plugins/definitions/${pluginId}/versions`,
  available: '/engine/plugins/available',
};

export const pluginService = {
  async getRegistryGrouped(): Promise<Record<string, unknown[]>> {
    const res = await HttpRequest.get<Record<string, unknown[]>>(
      { url: PluginsApi.registryGrouped },
      { successMessageMode: 'none' }
    );
    return res ?? {};
  },

  async getRegistry(): Promise<unknown[]> {
    const res = await HttpRequest.get<unknown[]>({ url: PluginsApi.registry }, { successMessageMode: 'none' });
    return Array.isArray(res) ? res : [];
  },

  async getByCategory(category: NodeCategory): Promise<unknown[]> {
    const res = await HttpRequest.get<unknown[]>(
      { url: PluginsApi.registryCategory(category) },
      { successMessageMode: 'none' }
    );
    return Array.isArray(res) ? res : [];
  },

  async listDefinitions(tenantId: string, pluginType?: string): Promise<PluginDefinition[]> {
    const res = await HttpRequest.get<PluginDefinition[]>(
      { url: PluginsApi.definitions, params: { tenantId, pluginType } },
      { successMessageMode: 'none' }
    );
    return res ?? [];
  },

  async createDefinition(definition: Partial<PluginDefinition>): Promise<PluginDefinition> {
    return HttpRequest.post<PluginDefinition>({ url: PluginsApi.definitions, data: definition });
  },

  async updateDefinition(id: string, definition: Partial<PluginDefinition>): Promise<PluginDefinition> {
    return HttpRequest.put<PluginDefinition>({ url: PluginsApi.definitionById(id), data: { ...definition, id } });
  },

  async publishVersion(pluginId: string, version: Partial<PluginVersion>): Promise<PluginVersion> {
    return HttpRequest.post<PluginVersion>({
      url: PluginsApi.versions(pluginId),
      data: { ...version, pluginId },
    });
  },

  async listAvailable(pluginType?: string): Promise<MarketListingVO[]> {
    const res = await HttpRequest.get<MarketListingVO[]>(
      { url: PluginsApi.available, params: { pluginType } },
      { successMessageMode: 'none' }
    );
    return res ?? [];
  },
};
