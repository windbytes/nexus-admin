import { App, Tag as AntdTag, Input } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useDebounceFn } from 'ahooks';
import type React from 'react';
import { useState } from 'react';
import { useTagStore } from '@/stores/useTagStore';
import { tagsService } from '@/services/common/tags/tagsApi';
import classNames from '@/utils/classnames';
import type { Tag } from './constant';
import { useQueryClient } from '@tanstack/react-query';

type TagItemEditorProps = {
  tag: Tag;
};

/**
 * 标签项编辑
 */
const TagItemEditor: React.FC<TagItemEditorProps> = ({ tag }) => {
  const { t } = useTranslation();
  // 只订阅 setTagList 方法，不订阅 tagList 避免重复渲染
  const { setTagList } = useTagStore();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(tag.name);
  const { notification, modal } = App.useApp();
  const [pending, setPending] = useState<boolean>(false);

  /**
   * 编辑标签
   */
  const editTag = async (tagID: string, newName: string) => {
    if (!newName || newName === tag.name || pending) {
      setIsEditing(false);
      return;
    }
    setPending(true);
    try {
      await tagsService.updateTag({ id: tagID, name: newName });
      // 更新 react-query 缓存
      queryClient.invalidateQueries({ queryKey: ['tag_management_list'] });
      setIsEditing(false);
      notification.success({
        title: t('common.updateSuccess'),
      });
    } catch (err: any) {
      notification.error({
        title: t('common.updateFailed') + err.message,
      });
    } finally {
      setPending(false);
    }
  };

  /**
   * 移除标签
   */
  const removeTag = async (tagID: string) => {
    if (pending) return;
    setPending(true);
    try {
      await tagsService.deleteTag(tagID);
      // 更新 react-query 缓存
      queryClient.invalidateQueries({ queryKey: ['tag_management_list'] });
      notification.success({
        title: t('common.deleteSuccess'),
      });
    } catch (err: any) {
      notification.error({
        title: t('common.deleteFailed') + err.message,
      });
    } finally {
      setPending(false);
    }
  };

  /**
   * 确认是否删除
   */
  const confirmDelete = () => {
    modal.confirm({
      title: t('common.tag.delete') + tag.name,
      content: t('common.tag.deleteTip'),
      okType: 'danger',
      onOk: async () => {
        handleRemove();
      },
    });
  };

  const { run: handleRemove } = useDebounceFn(
    () => {
      removeTag(tag.id);
    },
    { wait: 200 },
  );

  return (
    <>
      <div
        className={classNames(
          'flex shrink-0 items-center gap-0.5 rounded-lg border border-solid border-gray-200 py-1 pl-2 pr-1 text-sm leading-5 text-gray-500',
        )}
      >
        {!isEditing && (
          <AntdTag
            closable
            onClose={() => {
              if (tag.binding_count) {
                confirmDelete();
              } else {
                handleRemove();
              }
            }}
          >
            {tag.name} {tag.binding_count}
            <EditOutlined onClick={() => setIsEditing(true)} />
          </AntdTag>
        )}
        {isEditing && (
          <Input
            autoFocus
            value={name}
            size="small"
            type="text"
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              editTag(tag.id, name);
            }}
            onPressEnter={() => {
              editTag(tag.id, name);
            }}
          />
        )}
      </div>
    </>
  );
};
export default TagItemEditor;
