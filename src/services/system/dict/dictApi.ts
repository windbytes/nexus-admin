import type { PageResult } from '@/types/global';
import { HttpRequest } from '@/utils/request';
import type {
  DictColumnModel,
  DictColumnRecord,
  DictDataManualModel,
  DictDataManualQueryParams,
  DictDataManualRecord,
  DictModel,
  DictRecord,
  DictSaveFullRequest,
  DictSearchParams,
  DictSourceModel,
  DictSourceRecord,
} from './type.d';

/**
 * 数据字典相关接口路径枚举
 */
const DictAction = {
  /** 分页查询字典列表 */
  queryDictListPage: '/system/dict/queryDictListPage',
  /** 根据 id 查询字典详情 */
  getDictById: '/system/dict/getDictById',
  /** 根据编码查询字典 */
  getDictByCode: '/system/dict/getDictByCode',
  /** 新增字典定义 */
  addDict: '/system/dict/addDict',
  /** 更新字典定义 */
  updateDict: '/system/dict/updateDict',
  /** 一次提交保存字典及关联表（定义、数据源、列映射、手工数据） */
  saveDictFull: '/system/dict/saveDictFull',
  /** 逻辑删除字典定义 */
  deleteDict: '/system/dict/deleteDict',
  /** 按字典 id 查询数据源配置列表 */
  listSource: '/system/dict/listSource',
  /** 保存数据源配置 */
  saveDictSource: '/system/dict/saveDictSource',
  /** 按字典 id 查询列映射列表 */
  listColumn: '/system/dict/listColumn',
  /** 新增列映射 */
  addDictColumn: '/system/dict/addDictColumn',
  /** 更新列映射 */
  updateDictColumn: '/system/dict/updateDictColumn',
  /** 删除列映射 */
  deleteDictColumn: '/system/dict/deleteDictColumn',
  /** 按字典 id 查询手工数据列表（仅启用） */
  listDataManual: '/system/dict/listDataManual',
  /** 分页查询某字典下的手工数据 */
  pageDataManual: '/system/dict/pageDataManual',
  /** 新增手工数据项 */
  addDictDataManual: '/system/dict/addDictDataManual',
  /** 更新手工数据项 */
  updateDictDataManual: '/system/dict/updateDictDataManual',
  /** 删除手工数据项 */
  deleteDictDataManual: '/system/dict/deleteDictDataManual',
} as const;

/**
 * 数据字典服务接口定义
 */
export interface IDictService {
  /** 分页查询字典列表 */
  queryDictListPage(params: DictSearchParams): Promise<PageResult<DictModel>>;
  /** 根据 id 查询字典详情 */
  getDictById(id: string): Promise<DictModel>;
  /** 根据编码查询字典 */
  getDictByCode(dictCode: string): Promise<DictModel>;
  /** 新增字典定义 */
  addDict(record: DictRecord): Promise<number>;
  /** 更新字典定义 */
  updateDict(record: DictRecord): Promise<number>;
  /** 一次提交保存字典及关联表 */
  saveDictFull(request: DictSaveFullRequest): Promise<number>;
  /** 逻辑删除字典定义 */
  deleteDict(id: string): Promise<boolean>;
  /** 按字典 id 查询数据源配置列表 */
  listSourceByDictId(dictId: string): Promise<DictSourceModel[]>;
  /** 保存数据源配置（新增或更新） */
  saveDictSource(record: DictSourceRecord): Promise<number>;
  /** 按字典 id 查询列映射列表 */
  listColumnByDictId(dictId: string): Promise<DictColumnModel[]>;
  /** 新增列映射 */
  addDictColumn(record: DictColumnRecord): Promise<number>;
  /** 更新列映射 */
  updateDictColumn(record: DictColumnRecord): Promise<number>;
  /** 删除列映射 */
  deleteDictColumn(id: string): Promise<boolean>;
  /** 按字典 id 查询手工数据列表（仅启用） */
  listDataManualByDictId(dictId: string): Promise<DictDataManualModel[]>;
  /** 分页查询某字典下的手工数据 */
  pageDataManual(params: DictDataManualQueryParams): Promise<PageResult<DictDataManualModel>>;
  /** 新增手工数据项 */
  addDictDataManual(record: DictDataManualRecord): Promise<number>;
  /** 更新手工数据项 */
  updateDictDataManual(record: DictDataManualRecord): Promise<number>;
  /** 删除手工数据项 */
  deleteDictDataManual(id: string): Promise<boolean>;
}

/**
 * 数据字典服务实现
 */
export const dictService: IDictService = {
  /** @inheritdoc */
  async queryDictListPage(params: DictSearchParams): Promise<PageResult<DictModel>> {
    const res = await HttpRequest.post(
      { url: DictAction.queryDictListPage, data: params },
      { successMessageMode: 'none' }
    );
    return res;
  },

  /** @inheritdoc */
  async getDictById(id: string): Promise<DictModel> {
    return HttpRequest.get({ url: `${DictAction.getDictById}/${id}` }, { successMessageMode: 'none' });
  },

  /** @inheritdoc */
  async getDictByCode(dictCode: string): Promise<DictModel> {
    return HttpRequest.get({ url: DictAction.getDictByCode, params: { dictCode } }, { successMessageMode: 'none' });
  },

  /** @inheritdoc */
  async addDict(record: DictRecord): Promise<number> {
    return HttpRequest.post({ url: DictAction.addDict, data: record });
  },

  /** @inheritdoc */
  async updateDict(record: DictRecord): Promise<number> {
    return HttpRequest.post({ url: DictAction.updateDict, data: record });
  },

  /**
   * 一次提交保存字典及关联表（定义、数据源、列映射、手工数据），后端在一个事务内全量覆盖关联表。
   * @param request 包含 basic（必填）、source（可选）、columns（可选）、manualData（可选）
   * @returns 字典更新影响行数
   */
  async saveDictFull(request: DictSaveFullRequest): Promise<number> {
    return HttpRequest.post({ url: DictAction.saveDictFull, data: request });
  },

  /** @inheritdoc */
  async deleteDict(id: string): Promise<boolean> {
    return HttpRequest.post({ url: `${DictAction.deleteDict}/${id}` });
  },

  /** @inheritdoc */
  async listSourceByDictId(dictId: string): Promise<DictSourceModel[]> {
    return HttpRequest.get({ url: DictAction.listSource, params: { dictId } }, { successMessageMode: 'none' });
  },

  /** @inheritdoc */
  async saveDictSource(record: DictSourceRecord): Promise<number> {
    return HttpRequest.post({ url: DictAction.saveDictSource, data: record });
  },

  /** @inheritdoc */
  async listColumnByDictId(dictId: string): Promise<DictColumnModel[]> {
    return HttpRequest.get({ url: DictAction.listColumn, params: { dictId } }, { successMessageMode: 'none' });
  },

  /** @inheritdoc */
  async addDictColumn(record: DictColumnRecord): Promise<number> {
    return HttpRequest.post({ url: DictAction.addDictColumn, data: record });
  },

  /** @inheritdoc */
  async updateDictColumn(record: DictColumnRecord): Promise<number> {
    return HttpRequest.post({ url: DictAction.updateDictColumn, data: record });
  },

  /** @inheritdoc */
  async deleteDictColumn(id: string): Promise<boolean> {
    return HttpRequest.post({ url: `${DictAction.deleteDictColumn}/${id}` });
  },

  /** @inheritdoc */
  async listDataManualByDictId(dictId: string): Promise<DictDataManualModel[]> {
    return HttpRequest.get({ url: DictAction.listDataManual, params: { dictId } }, { successMessageMode: 'none' });
  },

  /** @inheritdoc */
  async pageDataManual(params: DictDataManualQueryParams): Promise<PageResult<DictDataManualModel>> {
    const res = await HttpRequest.post(
      { url: DictAction.pageDataManual, data: params },
      { successMessageMode: 'none' }
    );
    return res;
  },

  /** @inheritdoc */
  async addDictDataManual(record: DictDataManualRecord): Promise<number> {
    return HttpRequest.post({ url: DictAction.addDictDataManual, data: record });
  },

  /** @inheritdoc */
  async updateDictDataManual(record: DictDataManualRecord): Promise<number> {
    return HttpRequest.post({ url: DictAction.updateDictDataManual, data: record });
  },

  /** @inheritdoc */
  async deleteDictDataManual(id: string): Promise<boolean> {
    return HttpRequest.post({ url: `${DictAction.deleteDictDataManual}/${id}` });
  },
};
