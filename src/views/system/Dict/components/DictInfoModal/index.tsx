import { useQuery } from '@tanstack/react-query';
import { Divider, Form, Tabs } from 'antd';
import { memo, useEffect, useMemo } from 'react';
import DragModal from '@/components/modal/DragModal';
import { dictService } from '@/services/system/dict/dictApi';
import type {
  DictColumnRecord,
  DictDataManualRecord,
  DictModel,
  DictRecord,
  DictSourceRecord,
  DictType,
} from '@/services/system/dict/type.d';
import BasicInfoForm from './BasicInfoForm';
import ColumnMappingEditableTable from './ColumnMappingEditableTable';
import SourceConfigApi from './SourceConfigApi';
import SourceConfigManual from './SourceConfigManual';
import SourceConfigSql from './SourceConfigSql';

export type DictInfoModalAction = 'add' | 'edit' | 'view';

export type DictSubmitPayload = {
  basic: DictRecord;
  source?: DictSourceRecord;
  columns?: Partial<DictColumnRecord>[];
  manualData?: Partial<DictDataManualRecord>[];
};

interface DictInfoModalProps {
  open: boolean;
  action: DictInfoModalAction;
  dictInfo: DictModel | null;
  onOk: (payload: DictSubmitPayload) => void;
  onCancel: () => void;
}

/** 列映射表单项（含 id 便于后端 diff） */
function toFormColumns(rows: { id?: string; [k: string]: unknown }[]): Partial<DictColumnRecord>[] {
  return rows.map((r) => ({
    id: r.id as string | undefined,
    columnKey: r.columnKey,
    columnName: r.columnName,
    dataType: r.dataType,
    sourceField: r.sourceField,
    isPrimary: !!r.isPrimary,
    isLabel: !!r.isLabel,
    sortable: !!r.sortable,
    searchable: !!r.searchable,
    orderIndex: Number(r.orderIndex) || 0,
  }));
}

/** 手工数据表单项转提交结构 */
function toFormManualData(
  rows: { id?: string; data?: Record<string, unknown>; orderIndex?: number; enabled?: boolean }[]
): Partial<DictDataManualRecord>[] {
  return rows.map((r) => ({
    id: r.id,
    data: r.data ?? {},
    orderIndex: r.orderIndex ?? 0,
    enabled: r.enabled !== false,
  }));
}

/**
 * 数据字典新增/编辑/查看弹窗
 * - 基本信息 + 按类型切换的数据源配置（MANUAL/SQL/API）
 * - SQL/API 且已有时显示列映射可编辑表；MANUAL 且已有时显示手工数据可编辑表
 */
const DictInfoModal: React.FC<DictInfoModalProps> = ({ open, action, dictInfo, onOk, onCancel }) => {
  const [form] = Form.useForm();
  const dictType = Form.useWatch('dictType', form);
  const isView = action === 'view';
  const hasDictId = !!dictInfo?.id;
  /** SQL/API 时列映射与字典一起保存，不要求先保存字典 */
  const isColumnMappingType = dictType === 'SQL' || dictType === 'API';
  const showManualData = hasDictId && dictType === 'MANUAL';

  const { data: sourceList } = useQuery({
    queryKey: ['dict_source', dictInfo?.id],
    queryFn: () => (dictInfo?.id ? dictService.listSourceByDictId(dictInfo.id) : Promise.resolve([])),
    enabled: open && !!dictInfo?.id,
  });

  const { data: columnList } = useQuery({
    queryKey: ['dict_columns', dictInfo?.id],
    queryFn: () => (dictInfo?.id ? dictService.listColumnByDictId(dictInfo.id) : Promise.resolve([])),
    enabled: open && hasDictId && isColumnMappingType,
  });

  const { data: manualDataList } = useQuery({
    queryKey: ['dict_manual_data', dictInfo?.id],
    queryFn: () => (dictInfo?.id ? dictService.listDataManualByDictId(dictInfo.id) : Promise.resolve([])),
    enabled: open && showManualData,
  });

  const source = useMemo(() => sourceList?.[0] ?? null, [sourceList]);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (dictInfo) {
      form.setFieldsValue({
        ...dictInfo,
        source: source
          ? {
              sqlText: source.sqlText,
              dbType: source.dbType,
              dbDatasourceName: source.dbDatasourceName,
              apiUrl: source.apiUrl,
              httpMethod: source.httpMethod,
              refreshMode: source.refreshMode,
              refreshIntervalSec: source.refreshIntervalSec,
            }
          : undefined,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ enabled: true, cacheEnabled: true, dictType: 'MANUAL' });
    }
  }, [open, dictInfo, source, form]);

  useEffect(() => {
    if (!open || !hasDictId) {
      return;
    }
    if (isColumnMappingType && columnList) {
      form.setFieldValue(
        'columns',
        columnList.map((c) => ({
          id: c.id,
          columnKey: c.columnKey,
          columnName: c.columnName,
          dataType: c.dataType,
          sourceField: c.sourceField,
          isPrimary: c.isPrimary,
          isLabel: c.isLabel,
          sortable: c.sortable,
          searchable: c.searchable,
          orderIndex: c.orderIndex,
        }))
      );
    }
    if (showManualData && manualDataList) {
      form.setFieldValue(
        'manualData',
        manualDataList.map((m) => ({
          id: m.id,
          data: m.data ?? {},
          orderIndex: m.orderIndex,
          enabled: m.enabled,
        }))
      );
    }
  }, [open, hasDictId, isColumnMappingType, showManualData, columnList, manualDataList, form]);

  const handleOk = () => {
    form.validateFields().then((values: Record<string, unknown>) => {
      const basic: DictRecord = {
        dictCode: values.dictCode as string,
        dictName: values.dictName as string,
        dictType: values.dictType as DictType,
        description: values.description as string | undefined,
        enabled: !!values.enabled,
        cacheEnabled: !!values.cacheEnabled,
        cacheTtlSec: values.cacheTtlSec != null ? Number(values.cacheTtlSec) : undefined,
      };
      if (dictInfo?.id) {
        basic.id = dictInfo.id;
        basic.version = dictInfo.version;
      }

      let sourceRecord: DictSourceRecord | undefined;
      const src = values.source as Record<string, unknown> | undefined;
      if (src && (values.dictType === 'SQL' || values.dictType === 'API')) {
        sourceRecord = {
          dictId: dictInfo?.id ?? '',
          sourceType: values.dictType as DictSourceRecord['sourceType'],
          sqlText: src.sqlText as string | undefined,
          dbType: src.dbType as DictSourceRecord['dbType'],
          dbDatasourceName: src.dbDatasourceName as string | undefined,
          apiUrl: src.apiUrl as string | undefined,
          httpMethod: src.httpMethod as string | undefined,
          refreshMode: src.refreshMode as string | undefined,
          refreshIntervalSec: src.refreshIntervalSec != null ? Number(src.refreshIntervalSec) : undefined,
        };
        if (source?.id) {
          sourceRecord.id = source.id;
        }
      }

      const payload: DictSubmitPayload = { basic, source: sourceRecord };
      const dictId = basic.id;
      if (isColumnMappingType && Array.isArray(values.columns)) {
        payload.columns = toFormColumns(values.columns as { id?: string; [k: string]: unknown }[]);
        if (dictId && payload.columns) {
          payload.columns.forEach((c) => {
            (c as DictColumnRecord).dictId = dictId;
          });
        }
      }
      if (dictType === 'MANUAL' && Array.isArray(values.manualData)) {
        payload.manualData = toFormManualData(
          values.manualData as { id?: string; data?: Record<string, unknown>; orderIndex?: number; enabled?: boolean }[]
        );
        if (dictId && payload.manualData) {
          payload.manualData.forEach((m) => {
            (m as DictDataManualRecord).dictId = dictId;
          });
        }
      }
      onOk(payload);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const title = action === 'view' ? '字典详情' : action === 'add' ? '新增字典' : '编辑字典';

  return (
    <DragModal
      title={title}
      open={open}
      onOk={handleOk}
      okButtonProps={{ disabled: isView }}
      onCancel={handleCancel}
      width={1200}
      classNames={{
        body: 'h-[70vh] overflow-y-auto p-2',
      }}
    >
      <Form
        form={form}
        disabled={isView}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        initialValues={{ enabled: true, cacheEnabled: true }}
      >
        <BasicInfoForm disabled={isView} />
        {dictType === 'MANUAL' && (
          <>
            <Divider titlePlacement="left">数据源配置</Divider>
            <SourceConfigManual disabled={isView} />
          </>
        )}
        {(dictType === 'SQL' || dictType === 'API') && (
          <>
            <Divider titlePlacement="left">数据来源与列映射</Divider>
            <Tabs
              items={[
                {
                  key: 'columns',
                  label: '列映射',
                  children: <ColumnMappingEditableTable disabled={isView} />,
                },
                {
                  key: 'source',
                  label: dictType === 'SQL' ? 'SQL 配置' : 'API 配置',
                  children:
                    dictType === 'SQL' ? <SourceConfigSql disabled={isView} /> : <SourceConfigApi disabled={isView} />,
                },
              ]}
            />
          </>
        )}
      </Form>
    </DragModal>
  );
};

export default memo(DictInfoModal);
