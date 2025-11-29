import { useMenuStore } from '@/stores/store';
import { getShortcutLabel } from '@/utils/utils';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { Empty, Input, Modal } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchHistory from './components/SearchHistory';
import SearchResults from './components/SearchResults';
import Footer from './footer';
import { useSearch } from './hooks/useSearch';
import { useSearchHistory } from './hooks/useSearchHistory';
import './searchMenuModal.scss';
import Title from './title';
import type { SearchHistoryItem, SearchResultItem } from './types';
import useGlobalUIStore from '@/stores/globalUIStore';
import { useShallow } from 'zustand/shallow';

/**
 * 搜索菜单模态框组件
 */
const SearchMenuModal: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { menus } = useMenuStore();

  // 获取全局 UI 状态
  const { searchMenuModalOpen, setSearchMenuModalOpen } = useGlobalUIStore(
    useShallow((state) => ({
      searchMenuModalOpen: state.searchMenuModalOpen,
      setSearchMenuModalOpen: state.setSearchMenuModalOpen,
    }))
  );

  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showHistory, setShowHistory] = useState<boolean>(true);

  const inputRef = useRef<any>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const searchResults = useSearch(menus, searchValue);
  const { history, add, remove, clear, formatTime } = useSearchHistory();


  // 打开时聚焦
  useEffect(() => {
    if (searchMenuModalOpen) setTimeout(() => inputRef.current?.focus(), 80);
  }, [searchMenuModalOpen]);

  // 滚动到选中项
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (el) (el as HTMLElement).scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // 处理搜索输入
  const handleSearch = (value: string) => {
    setSearchValue(value);
    setSelectedIndex(0);
    setShowHistory(!value.trim());
  };

  // 处理选择
  const handleSelect = (item: SearchResultItem | SearchHistoryItem) => {
    add({ id: item.id, name: item.name, path: item.path, timestamp: Date.now() });
    navigate({ to: item.path });
    setSearchMenuModalOpen(false);
    setSearchValue('');
    setSelectedIndex(0);
  };

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const current = showHistory ? history : searchResults;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < current.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : current.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (current.length > 0) handleSelect(current[selectedIndex] as any);
        break;
      case 'Escape':
        setSearchMenuModalOpen(false);
        setSearchValue('');
        setSelectedIndex(0);
        break;
    }
  };

  return (
    <>
      <Input
        variant="filled"
        className="w-40!"
        readOnly
        placeholder={t('common.operation.search')}
        suffix={<div className="bg-white rounded-sm px-2" onClick={() => setSearchMenuModalOpen(true)}>{getShortcutLabel('ctrl+key')}</div>}
        prefix={<SearchOutlined className='text-[18px] cursor-pointer' />}
        onClick={() => setSearchMenuModalOpen(true)}
      />
      <Modal
        open={searchMenuModalOpen}
        footer={<Footer />}
        title={
          <Title searchValue={searchValue} onSearch={handleSearch} onKeyDown={handleKeyDown} inputRef={inputRef} />
        }
        classNames={{
          footer: 'p-2',
          body: 'h-[400px] overflow-y-scroll',
        }}
        onCancel={() => {
          setSearchMenuModalOpen(false);
          setSearchValue('');
          setSelectedIndex(0);
        }}
        width={600}
      >
        <div className="h-full flex flex-col">
          {showHistory ? (
            <div className="flex-1 overflow-hidden">
              <div className="searchHeader">
                {history.length > 0 && (
                  <button type="button" onClick={clear} className="clearButton">
                    清空历史
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto" ref={listRef as any}>
                {history.length > 0 ? (
                  <SearchHistory
                    items={history}
                    selectedIndex={selectedIndex}
                    onSelect={handleSelect}
                    onRemove={remove}
                    formatTime={formatTime}
                  />
                ) : (
                  <Empty description="暂无搜索历史" className="mt-8" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <div className="searchHeader py-1 px-2">
                <span className="headerTitle">搜索结果 ({searchResults.length})</span>
              </div>
              <div className="flex-1 overflow-y-auto" ref={listRef as any}>
                {searchResults.length > 0 ? (
                  <SearchResults items={searchResults} selectedIndex={selectedIndex} onSelect={handleSelect} />
                ) : (
                  <Empty
                    description={`未找到包含"${searchValue}"的菜单`}
                    className="mt-8"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default SearchMenuModal;
