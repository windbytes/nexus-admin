import { roleService } from '@/services/system/role/roleApi';
import type { UserSearchParams } from '@/services/system/role/type';
import { usePreferencesStore } from '@/stores/store';
import {
  CloseOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  ManOutlined,
  PlusOutlined,
  RedoOutlined,
  SearchOutlined,
  WarningOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import { Icon } from '@iconify/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  App,
  Button,
  Card,
  Col,
  ConfigProvider,
  Drawer,
  Form,
  Input,
  type InputRef,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  type TableProps,
  Tooltip,
} from 'antd';
import { isEqual } from 'lodash-es';
import { memo, useRef, useState } from 'react';
import AddUser from './AddUserModal';

/**
 * 给角色分配用户
 * @returns
 */
const RoleUserDrawer: React.FC<RoleUserDrawerProps> = ({ open, roleId, onCancel }) => {
  const { modal, message } = App.useApp();
  const colorError = usePreferencesStore((state) => state.preferences.theme.colorError);
  // 添加用户弹窗的打开关闭
  const [openAddUser, setOpenAddUser] = useState<boolean>(false);
  // 检索表单
  const [form] = Form.useForm();
  // 当前选中的行数据
  const [selRows, setSelectedRows] = useState<any[]>([]);
  // 第一个检索框
  const ref = useRef<InputRef>(null);

  // 查询参数（包含分页参数）
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    pageNum: 1,
    pageSize: 20,
  });

  // 查询用户数据
  const { isLoading, data, refetch } = useQuery({
    queryKey: ['sys_role_users_drawer', [roleId, searchParams]],
    queryFn: () => roleService.getRoleUser(roleId, searchParams),
    enabled: open,
  });

  // 删除用户的mutation
  const deleteRoleUserMutation = useMutation({
    mutationFn: (userIds: string[]) => roleService.assignRoleUser(roleId, userIds, 'remove'),
    onSuccess: () => {
      message.success('删除用户成功');
      // 刷新表格数据
      refetch();
      // 清空选择项
      setSelectedRows([]);
    },
    onError: (error: any) => {
      modal.error({
        title: '删除用户失败',
        content: error.message,
      });
    },
  });

  /**
   * 定义表格的列
   */
  const columns: TableProps['columns'] = [
    {
      title: 'id',
      dataIndex: 'id',
      hidden: true,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      width: 80,
      align: 'center',
      hidden: true,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      width: 80,
      align: 'left',
    },
    {
      title: '实名',
      dataIndex: 'realName',
      width: 80,
      align: 'left',
    },
    {
      title: '性别',
      dataIndex: 'sex',
      width: 80,
      align: 'center',
      render: (text) => {
        return text === 1 ? <ManOutlined className="text-blue-400!" /> : <WomanOutlined className="text-pink-400!" />;
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 80,
      fixed: 'right',
      align: 'center',
      render: (_text, record) => {
        return (
          <Popconfirm
            title="移除用户"
            description="确定从该角色下移除当前用户吗？"
            onConfirm={() => deleteRoleUser(record['id'])}
            icon={<WarningOutlined style={{ color: colorError }} />}
          >
            <Tooltip title="移除用户">
              <Button
                type="text"
                icon={<Icon icon="fluent:delete-dismiss-24-filled" className="text-xl block text-[#ff4d4f]" />}
              />
            </Tooltip>
          </Popconfirm>
        );
      },
    },
  ];

  /**
   * 分页改变事件
   * @param page 页数
   * @param pageSize 每页数量
   */
  const onPageSizeChange = (page: number, pageSize: number) => {
    setSearchParams({
      ...searchParams,
      pageNum: page,
      pageSize: pageSize,
    });
  };

  /**
   * 表单检索
   */
  const onFinish = (values: UserSearchParams) => {
    const search = {
      ...values,
      pageNum: searchParams.pageNum,
      pageSize: searchParams.pageSize,
    };
    // 判断参数是否发生变化
    if (isEqual(search, searchParams)) {
      // 参数没有变化，手动刷新数据
      refetch();
      return;
    }
    setSearchParams((prev: UserSearchParams) => ({ ...prev, ...search }));
  };

  /**
   * 多行选中的配置
   */
  const rowSelection: TableProps['rowSelection'] = {
    // 行选中的回调
    onChange(_selectedRowKeys, selectedRows) {
      setSelectedRows(selectedRows);
    },
    columnWidth: 32,
    fixed: true,
    selectedRowKeys: selRows.map((item) => item.id),
  };

  /**
   * 打开添加用户弹窗
   */
  const addUser = () => {
    setOpenAddUser(true);
  };

  /**
   * 取消添加用户
   */
  const cancelAddUser = () => {
    setOpenAddUser(false);
    ref.current?.focus();
  };

  /**
   * 删除单个用户
   * @param id 用户ID
   */
  const deleteRoleUser = (id: string) => {
    deleteRoleUserMutation.mutate([id]);
  };

  /**
   * 批量删除用户
   * @param id 用户ID
   */
  const deleteBatch = (id?: string) => {
    // 删除操作需要二次确定
    modal.confirm({
      title: '删除用户',
      icon: <ExclamationCircleFilled />,
      content: '确定删除用户吗？数据删除后将无法恢复！',
      onOk() {
        // 调用删除接口，删除成功后刷新页面数据
        const ids = selRows.map((item: any) => item.id);
        id && ids.push(id);
        deleteRoleUserMutation.mutate(ids);
      },
    });
  };

  /**
   * 处理确定按钮的点击事件
   * @param count 选中的数量
   */
  const handleOk = (count: number) => {
    // 如果选中的数量为0，则直接关闭弹窗，不刷新表格，否则刷新表格
    if (count === 0) {
      cancelAddUser();
      return;
    }
    refetch();
    cancelAddUser();
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Form: {
            itemMarginBottom: 0,
          },
        },
      }}
    >
      <Drawer
        title="分配用户"
        size={920}
        open={open}
        closeIcon={false}
        extra={<Button type="text" icon={<CloseOutlined />} onClick={onCancel} />}
        onClose={onCancel}
        classNames={{ footer: 'text-right', body: 'flex flex-col' }}
      >
        <Card>
          <Form form={form} onFinish={onFinish}>
            <Row gutter={12}>
              <Col span={6}>
                <Form.Item className="mb-0" name="username" label="用户名" colon={false}>
                  <Input autoFocus allowClear autoComplete="off" ref={ref} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item className="mb-0" name="realName" label="实际名" colon={false}>
                  <Input allowClear autoComplete="off" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item className="mb-0" name="sex" label="性别" colon={false}>
                  <Select
                    allowClear
                    options={[
                      { value: '', label: '请选择', disabled: true },
                      { value: 1, label: '男' },
                      { value: 0, label: '女' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={6} style={{ textAlign: 'right' }}>
                <Space>
                  <Button type="primary" htmlType="submit" loading={isLoading} icon={<SearchOutlined />}>
                    检索
                  </Button>
                  <Button
                    type="default"
                    icon={<RedoOutlined />}
                    onClick={() => {
                      form.resetFields();
                    }}
                  >
                    重置
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Card>
        <Card className="mt-4! flex-1 min-h-0" styles={{ body: { height: '100%' } }}>
          <Space>
            <Button type="primary" onClick={addUser} icon={<PlusOutlined />}>
              添加用户
            </Button>
            <Button icon={<DeleteOutlined />} danger disabled={selRows.length === 0} onClick={() => deleteBatch()}>
              批量删除
            </Button>
          </Space>
          {/* 表格数据 */}
          <Table
            className="mt-2"
            size="small"
            columns={columns}
            dataSource={data?.['data'] || []}
            loading={isLoading}
            bordered
            rowKey="id"
            pagination={{
              pageSize: searchParams.pageSize,
              current: searchParams.pageNum,
              showQuickJumper: true,
              hideOnSinglePage: false,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
              total: data?.['total'],
              onChange(page, pageSize) {
                onPageSizeChange(page, pageSize);
              },
            }}
            scroll={{ x: 'max-content' }}
            rowSelection={{ ...rowSelection }}
          />
        </Card>
      </Drawer>
      {/* 添加用户弹窗 */}
      <AddUser roleId={roleId} open={openAddUser} onCancel={cancelAddUser} onOk={handleOk} />
    </ConfigProvider>
  );
};

export default memo(RoleUserDrawer);

export interface RoleUserDrawerProps {
  open: boolean;
  // 角色id
  roleId: string;
  // 点击取消的回调
  onCancel: (e: any) => void;
}
