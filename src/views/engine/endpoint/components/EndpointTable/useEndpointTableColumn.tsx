import {
  ApiOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  FileTextOutlined,
  HistoryOutlined,
  LinkOutlined,
  MoreOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { App, Button, Dropdown, type MenuProps, Switch, type TableProps, Tag, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { TABLE_ACTION_CELL_CLASSNAME, TABLE_ACTION_COLUMN_WIDTH } from '@/constants/table';
import { ENDPOINT_TYPE_OPTIONS, type Endpoint, type EndpointSelectOption } from '@/services/engine/endpoint/types';
import { useEndpointActions } from '../../hooks/useEndpointActions';
import type { DrawerType, ModalType } from '../../hooks/useEndpointModals';
import { useEndpointPermissions } from '../../hooks/useEndpointPermissions';

interface UseEndpointTableColumnProps {
  // 当前操作行的数据
  currentRow: Partial<Endpoint> | null;
  openModal: (name: ModalType, record?: Endpoint) => void;
  openDrawer: (name: DrawerType, record?: Endpoint) => void;
  // 成功的回调
  onSuccess?: () => void;
}

/**
 * @description: 端点表格列配置hook
 */
export const useEndpointTableColumns = (props: UseEndpointTableColumnProps) => {
  const { modal } = App.useApp();
  const { currentRow, onSuccess, openModal, openDrawer } = props;
  const { canEditEndpoint, canDeleteEndpoint, canExportEndpoint } = useEndpointPermissions();
  const { t } = useTranslation();
  // 操作hooks
  const { updateEndpointStatus, deleteEndpoint, exportConfig } = useEndpointActions({ currentRow, onSuccess });

  /**
   * 获取端点类型标签颜色
   */
  const getEndpointTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      http: 'blue',
      database: 'green',
      webservice: 'purple',
      file: 'orange',
      timer: 'cyan',
      mq: 'magenta',
    };
    return colorMap[type] || 'default';
  };

  /**
   * 获取端点类型名称
   */
  const getEndpointTypeName = (type: string): string => {
    const option = ENDPOINT_TYPE_OPTIONS?.find((opt: EndpointSelectOption) => opt.value === type);
    return option?.label || type;
  };

  // 更多操作菜单项
  const moreActionItems = (record: Endpoint): MenuProps['items'] => {
    return [
      {
        key: 'clone',
        label: '克隆',
        icon: <CopyOutlined />,
        onClick: () => {
          openModal('clone', record);
        },
        disabled: !canEditEndpoint,
      },
      {
        key: 'test',
        label: '测试',
        icon: <ThunderboltOutlined />,
        onClick: () => {
          openDrawer('test', record);
        },
      },
      {
        key: 'version',
        label: '版本管理',
        icon: <HistoryOutlined />,
        onClick: () => {
          openDrawer('version', record);
        },
      },
      {
        key: 'log',
        label: '变更记录',
        icon: <FileTextOutlined />,
        onClick: () => {
          openDrawer('log', record);
        },
      },
      {
        type: 'divider',
      },
      {
        key: 'callChainTrace',
        label: '链路追踪',
        icon: <LinkOutlined />,
        onClick: () => {
          openModal('callChainTrace', record);
        },
      },
      {
        key: 'dependencies',
        label: '关系图谱',
        icon: <ApiOutlined />,
        onClick: () => {
          openDrawer('dependencies', record);
        },
      },
      {
        type: 'divider',
      },
      {
        key: 'export',
        label: '导出配置',
        icon: <ExportOutlined />,
        disabled: !canExportEndpoint,
        onClick: () => {
          if (!canExportEndpoint) {
            modal.error({
              title: '权限不足',
              content: '您没有导出端点配置的权限，请联系管理员获取相应权限。',
            });
            return;
          }
          exportConfig(record.id, record.name);
        },
      },
      {
        key: 'delete',
        label: t('common.operation.delete'),
        icon: <DeleteOutlined />,
        disabled: !canDeleteEndpoint,
        danger: true,
        onClick: () => {
          if (!canDeleteEndpoint) {
            modal.error({
              title: '权限不足',
              content: '您没有删除端点的权限，请联系管理员获取相应权限。',
            });
            return;
          }
          modal.confirm({
            title: '确认删除',
            icon: <ExclamationCircleOutlined />,
            content: `确定要删除端点"${record.name}"吗？此操作不可恢复。`,
            okText: '确定',
            okButtonProps: {
              type: 'default',
              danger: true,
            },
            cancelText: '取消',
            cancelButtonProps: {
              type: 'primary',
            },
            onOk() {
              deleteEndpoint(record.id);
            },
          });
        },
      },
    ];
  };

  const columns: TableProps<Endpoint>['columns'] = [
    {
      dataIndex: 'id',
      title: 'ID',
      key: 'id',
      hidden: true,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      ellipsis: {
        showTitle: true,
      },
      render: (name: string) => (
        <Tooltip placement="topLeft" title={name}>
          {name}
        </Tooltip>
      ),
    },
    {
      title: '类型',
      dataIndex: 'endpointType',
      key: 'endpointType',
      width: 120,
      render: (type: string) => <Tag color={getEndpointTypeColor(type)}>{getEndpointTypeName(type)}</Tag>,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => category || '-',
    },
    {
      title: '模式',
      dataIndex: 'mode',
      key: 'mode',
      width: 80,
      align: 'center',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 220,
      ellipsis: {
        showTitle: false,
      },
      render: (description: string) => (
        <Tooltip placement="topLeft" title={description}>
          {description || '-'}
        </Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 100,
      render: (status: boolean, record: Endpoint) => (
        <Switch
          checked={status}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          onChange={(checked) => {
            updateEndpointStatus({
              ...record,
              status: checked,
            } as any);
          }}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      align: 'center',
      width: 180,
      sorter: (a: Endpoint, b: Endpoint) => (a.createTime || '').localeCompare(b.createTime || ''),
      render: (time: string) => time || '-',
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: TABLE_ACTION_COLUMN_WIDTH,
      fixed: 'end',
      render: (_, record: Endpoint) => (
        <div className={TABLE_ACTION_CELL_CLASSNAME}>
          {canEditEndpoint && (
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openModal('edit', record)}>
              {t('common.operation.edit')}
            </Button>
          )}
          <Dropdown menu={{ items: moreActionItems(record) ?? [] }} placement="bottom" trigger={['hover']}>
            <Button type="link" size="small" icon={<MoreOutlined />}>
              {t('common.operation.more')}
            </Button>
          </Dropdown>
        </div>
      ),
    },
  ];

  return columns;
};
