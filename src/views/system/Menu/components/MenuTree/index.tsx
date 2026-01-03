import { CaretDownOutlined, ExportOutlined, ImportOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Input, Space, Spin, Tooltip, Tree } from 'antd';
import type React from 'react';
import { type Key, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BubbleLoading } from '@/components/icons';
import { menuService } from '@/services/system/menu/menuApi';
import { transformData } from '@/utils/utils';
import type { ModalType } from '../../hooks/useMenuModals';
import { useMenuPermissions } from '../../hooks/useMenuPermissions';
import { useModalState } from '../hooks/useModalState';
import ExportModal from './components/ExportModal';
import ImportModal from './components/ImportModal';

export type MenuTreeProps = {
  /**
   * 选择菜单
   * @param menu 菜单
   */
  onSelectMenu: (menu: any) => void;

  /**
   * 打开抽屉
   * @param name 操作类型
   */
  openModal: (name: ModalType) => void;
};

/**
 * 菜单树
 * @returns 菜单树
 */
const MenuTree: React.FC<MenuTreeProps> = ({ onSelectMenu, openModal }) => {
  const { t } = useTranslation();
  const permissions = useMenuPermissions();

  // 菜单名称检索（需要按回车的时候才能触发）
  const [searchText, setSearchText] = useState('');
  // 选中的树节点
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  // 导入导出模态框状态
  const importModal = useModalState();
  const exportModal = useModalState();

  // 查询菜单数据
  const { isFetching, data, refetch } = useQuery({
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

  // 选中菜单树节点
  const onSelect = (selectedKeys: Key[], info: any) => {
    setSelectedKeys(selectedKeys);
    onSelectMenu(info.node);
  };

  // 检索菜单数据
  return (
    <>
      <Card
        className="w-80 h-full flex flex-col"
        classNames={{ body: 'flex flex-col h-[calc(100%-58px)] py-0! px-4!', header: 'py-3! px-4!' }}
        title={
          <div className="flex justify-between">
            <div>菜单列表</div>
            <Space>
              {permissions.canAddMenu && (
                <Tooltip title="新增子菜单">
                  <Button type="text" icon={<PlusOutlined />} onClick={() => openModal('add')} />
                </Tooltip>
              )}

              {permissions.canImportMenu && (
                <Tooltip title="导入菜单">
                  <Button
                    type="text"
                    icon={<ImportOutlined className="text-blue-500!" />}
                    onClick={() => importModal.openModal()}
                  />
                </Tooltip>
              )}
              {permissions.canExportMenu && (
                <Tooltip title="导出菜单">
                  <Button
                    type="text"
                    icon={<ExportOutlined className="text-orange-500!" />}
                    onClick={() => exportModal.openModal()}
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
        {isFetching ? (
          <Spin indicator={<BubbleLoading width={24} />} />
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
      <ImportModal open={importModal.open} onClose={importModal.closeModal} />

      {/* 导出菜单模态框 */}
      <ExportModal open={exportModal.open} onClose={exportModal.closeModal} searchText={searchText} />
    </>
  );
};

export default MenuTree;
