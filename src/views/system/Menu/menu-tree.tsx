import { CaretDownOutlined, ExportOutlined, ImportOutlined, PlusOutlined } from '@ant-design/icons';
import { Icon } from '@iconify-icon/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input, Space, Spin, Tooltip, Tree, Upload, Modal, App } from 'antd';
import type React from 'react';
import { useCallback, useState, useId, type Key } from 'react';
import { useTranslation } from 'react-i18next';
import { menuService, type MenuExportParams } from '@/services/system/menu/menuApi';
import { transformData } from '@/utils/utils';
import { usePermission } from '@/hooks/usePermission';

/**
 * 菜单树
 * @returns 菜单树
 */
const MenuTree: React.FC<MenuTreeProps> = ({ onSelectMenu, onOpenDrawer }) => {
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();
  const exportMenuNameId = useId();
  
  // 菜单名称检索（需要按回车的时候才能触发）
  const [searchText, setSearchText] = useState('');
  // 选中的树节点
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  // 导入导出相关状态
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportParams, setExportParams] = useState<MenuExportParams>({});

  // 新增菜单权限
  const hasAddPermission = usePermission(['system:menu:add']);
  // 批量导入权限
  const hasImportPermission = usePermission(['system:menu:import']);
  // 导出权限
  const hasExportPermission = usePermission(['system:menu:export']);

  // 查询菜单数据
  const { isLoading, data, refetch } = useQuery({
    // 依赖searchText, 当searchText变化时，会重新执行queryFn
    queryKey: ['sys_menu', searchText],
    queryFn: async () => {
      const res = await menuService.getAllMenus({ name: searchText });
      const expanded: string[] = [];
      const result = transformData(res || [], expanded, t);
      if (result.length > 0) {
        setSelectedKeys([result[0].id]);
        onSelectMenu(result[0]);
      }
      return result;
    },
  });

  // 导入菜单mutation
  const importMenuMutation = useMutation({
    mutationFn: async (file: File) => {
      return await menuService.importMenus(file);
    },
    onSuccess: (result) => {
      if (result.success) {
        message.success(`导入成功！成功导入 ${result.successCount} 条菜单`);
        // 重新获取菜单数据
        queryClient.invalidateQueries({ queryKey: ['sys_menu'] });
        setImportModalVisible(false);
      } else {
        modal.error({
          title: '菜单导入失败',
          content: `导入失败！失败 ${result.failCount} 条菜单。请检查导入文件格式或联系技术支持。`,
        });
      }
      
      // 显示详细结果
      if (result.details && result.details.length > 0) {
        const successDetails = result.details.filter(item => item.status === 'success');
        const failDetails = result.details.filter(item => item.status === 'fail');
        
        if (successDetails.length > 0) {
          message.info(`成功导入: ${successDetails.map(item => item.name).join(', ')}`);
        }
        
        if (failDetails.length > 0) {
          modal.error({
            title: '部分菜单导入失败',
            content: `以下菜单导入失败: ${failDetails.map(item => `${item.name}(${item.message})`).join(', ')}。请检查失败原因后重试。`,
          });
        }
      }
    },
    onError: (error) => {
      modal.error({
        title: '菜单导入失败',
        content: `导入菜单时发生错误：${error.message || '未知错误'}。请检查网络连接或联系技术支持。`,
      });
    }
  });

  // 导出菜单mutation
  const exportMenuMutation = useMutation({
    mutationFn: async (params: MenuExportParams) => {
      return await menuService.exportMenus(params);
    },
    onSuccess: (blob) => {
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `菜单数据_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('导出成功！');
      setExportModalVisible(false);
    },
    onError: (error) => {
      modal.error({
        title: '菜单导出失败',
        content: `导出菜单时发生错误：${error.message || '未知错误'}。请检查网络连接或联系技术支持。`,
      });
    }
  });

  // 选中菜单树节点
  const onSelect = useCallback(
    (selectedKeys: Key[], info: any) => {
      setSelectedKeys(selectedKeys);
      onSelectMenu(info.node);
    },
    [onSelectMenu],
  );

  /**
   * 验证文件格式
   * @param file 文件对象
   * @returns 是否通过验证
   */
  const validateFileFormat = useCallback((file: File): boolean => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    
    if (!allowedTypes.includes(file.type)) {
      modal.error({
        title: '文件格式不支持',
        content: '只支持 Excel 文件格式 (.xlsx, .xls)。请选择正确的文件格式后重试。',
      });
      return false;
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      modal.error({
        title: '文件过大',
        content: '文件大小不能超过 10MB。请选择较小的文件后重试。',
      });
      return false;
    }
    
    return true;
  }, [modal]);

  /**
   * 处理文件上传
   * @param file 文件对象
   */
  const handleFileUpload = useCallback(async (file: File) => {
    if (!validateFileFormat(file)) {
      return false;
    }
    
    try {
      await importMenuMutation.mutateAsync(file);
    } catch (error) {
      // 错误已在mutation中处理
    }
    
    return false; // 阻止自动上传
  }, [validateFileFormat, importMenuMutation]);

  /**
   * 导出菜单
   */
  const handleExport = useCallback(() => {
    setExportParams({ name: searchText });
    setExportModalVisible(true);
  }, [searchText]);

  /**
   * 确认导出
   */
  const confirmExport = useCallback(() => {
    exportMenuMutation.mutate(exportParams);
  }, [exportParams, exportMenuMutation]);

  // 检索菜单数据
  return (
    <>
      <Card
        className="h-full flex flex-col"
        classNames={{ body: 'flex flex-col h-[calc(100%-58px)] py-0! px-4!', header: 'py-3! px-4!' }}
        title={
          <div className="flex justify-between">
            <div>菜单列表</div>
            <Space>
              {hasAddPermission && (
                <Tooltip title="新增子菜单">
                  <Button type="text" icon={<PlusOutlined />} onClick={() => onOpenDrawer(true, 'add')} />
                </Tooltip>
              )}

              {hasImportPermission && (
                <Tooltip title="导入菜单">
                  <Button 
                    type="text" 
                    icon={<ImportOutlined className="text-blue-500!" />} 
                    onClick={() => setImportModalVisible(true)}
                  />
                </Tooltip>
              )}
              {hasExportPermission && (
                <Tooltip title="导出菜单">
                  <Button 
                    type="text" 
                    icon={<ExportOutlined className="text-orange-500!" />} 
                    onClick={handleExport}
                  />
                </Tooltip>
              )}
            </Space>
          </div>
        }
      >
        <Input.Search
          placeholder="请输入菜单名称"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          enterButton
          onSearch={() => refetch()}
          className="my-2"
        />
        {isLoading ? (
          <Spin indicator={<Icon icon="eos-icons:bubble-loading" width={24} />} />
        ) : (
          <Tree
            showLine
            blockNode
            showIcon
            rootClassName="flex-1 overflow-auto my-2!"
            treeData={data ?? []}
            defaultExpandAll
            selectedKeys={selectedKeys}
            switcherIcon={<CaretDownOutlined style={{ fontSize: '14px' }} />}
            onSelect={onSelect}
            fieldNames={{ title: 'name', key: 'id', children: 'children' }}
          />
        )}
      </Card>

      {/* 导入菜单模态框 */}
      <Modal
        title="导入菜单"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
        width={500}
      >
        <div className="space-y-4">
          <div className="text-gray-600 text-sm">
            <p>• 支持 Excel 文件格式 (.xlsx, .xls)</p>
            <p>• 文件大小不能超过 10MB</p>
            <p>• 请确保 Excel 文件包含必要的列：菜单名称、菜单类型、排序等</p>
          </div>
          
          <Upload
            accept=".xlsx,.xls"
            beforeUpload={handleFileUpload}
            showUploadList={false}
            disabled={importMenuMutation.isPending}
          >
            <Button 
              type="dashed" 
              block 
              icon={<ImportOutlined />}
              loading={importMenuMutation.isPending}
            >
              选择 Excel 文件
            </Button>
          </Upload>
          
          {importMenuMutation.isPending && (
            <div className="text-center text-blue-500">
              正在导入，请稍候...
            </div>
          )}
        </div>
      </Modal>

      {/* 导出菜单模态框 */}
      <Modal
        title="导出菜单"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        onOk={confirmExport}
        confirmLoading={exportMenuMutation.isPending}
        width={400}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor={exportMenuNameId} className="block text-sm font-medium text-gray-700 mb-2">
              菜单名称筛选
            </label>
            <Input
              id={exportMenuNameId}
              placeholder="请输入菜单名称（可选）"
              value={exportParams.name || ''}
              onChange={(e) => setExportParams(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          
          <div className="text-gray-600 text-sm">
            <p>• 将导出为 Excel 格式文件</p>
            <p>• 如果填写菜单名称，将只导出匹配的菜单</p>
            <p>• 不填写则导出所有菜单</p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default MenuTree;

export type MenuTreeProps = {
  /**
   * 选择菜单
   * @param menu 菜单
   */
  onSelectMenu: (menu: any) => void;

  /**
   * 打开抽屉
   * @param open 是否打开
   * @param operation 操作
   */
  onOpenDrawer: (open: boolean, operation: string) => void;
};
