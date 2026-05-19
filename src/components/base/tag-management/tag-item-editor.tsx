import { EditOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { Tag as AntdTag, App, Input } from 'antd';
import type React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useDebounceFn from '@/hooks/useDebounceFn';
import { tagService } from '@/services/engine';
import classNames from '@/utils/classnames';
import type { Tag } from './constant';

type TagItemEditorProps = {
  tag: Tag;
};

/**
 * 标签项编辑
 */
const TagItemEditor: React.FC<TagItemEditorProps> = ({ tag }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(tag.name);
  const { notification, modal } = App.useApp();
  const [pending, setPending] = useState<boolean>(false);

  /**
   * 编辑标签（应用标签走 engine tagService）
   */
  const editTag = async (tagID: string, newName: string) => {
    if (!newName || newName === tag.name || pending) {
      setIsEditing(false);
      return;
    }
    setPending(true);
    try {
      await tagService.updateTag(tagID, { name: newName });
      queryClient.invalidateQueries({ queryKey: ['tag_management_list'] });
      setIsEditing(false);
      notification.success({ title: t('common.updateSuccess') });
    } catch (err: unknown) {
      notification.error({
        title: t('common.updateFailed') + (err instanceof Error ? err.message : ''),
      });
    } finally {
      setPending(false);
    }
  };

  /**
   * 移除标签（应用标签走 engine tagService）
   */
  const removeTag = async (tagID: string) => {
    if (pending) {
      return;
    }
    setPending(true);
    try {
      await tagService.deleteTag(tagID);
      queryClient.invalidateQueries({ queryKey: ['tag_management_list'] });
      notification.success({ title: t('common.deleteSuccess') });
    } catch (err: unknown) {
      notification.error({
        title: t('common.deleteFailed') + (err instanceof Error ? err.message : ''),
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
    { wait: 200 }
  );

  return (
    <div
      className={classNames(
        'flex shrink-0 items-center gap-0.5 rounded-lg border border-solid border-gray-200 py-1 pl-2 pr-1 text-sm leading-5 text-gray-500'
      )}
    >
      {!isEditing && (
        <AntdTag
          closable
          onClose={() => {
            confirmDelete();
          }}
        >
          {tag.name}
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
  );
};
export default TagItemEditor;
