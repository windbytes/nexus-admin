import { Card, Form, Skeleton } from 'antd';
import type React from 'react';
import { lazy, Suspense, useEffect, useRef } from 'react';
import ActionButtons from './components/ActionButtons';
import EndpointTypeForm from './components/EndpointTypeForm';
import EndpointTypeList from './components/EndpointTypeList';
import SchemaFieldsTable, { type SchemaFieldsTableRef } from './components/SchemaFieldsTable';
import { useEndpointConfigPage } from './hooks/useEndpointConfigPage';

// 懒加载预览弹窗组件（进入页面即预取 chunk，减少首次点击预览时的等待）
const PreviewModal = lazy(() => import('./preview/PreviewModal'));

/**
 * 端点配置维护主页面
 */
const EndpointConfig: React.FC = () => {
  const [basicForm] = Form.useForm();
  const schemaFieldsTableRef = useRef<SchemaFieldsTableRef>(null);

  useEffect(() => {
    void import('./preview/PreviewModal');
  }, []);
  const {
    selectedType,
    isEditing,
    previewVisible,
    listLoading,
    editingSchemaFields,
    savePending,
    listData,
    paginationConfig,
    previewConfig,
    setPreviewVisible,
    handleSelectType,
    handleAdd,
    handlePreview,
    handleEdit,
    handleSave,
    handleCancel,
    handleDelete,
    handleExport,
    handleImport,
    handleSearch,
    handleSchemaFieldsChange,
    handleBatchExport,
  } = useEndpointConfigPage({
    basicForm,
    schemaFieldsTableRef,
  });

  return (
    <>
      <div className="h-full flex gap-2">
        {/* 左侧：端点类型列表 */}
        <EndpointTypeList
          data={listData}
          loading={listLoading}
          {...(selectedType?.id && { selectedId: selectedType.id })}
          onSelect={handleSelectType}
          onAdd={handleAdd}
          onSearch={handleSearch}
          onBatchExport={handleBatchExport}
          onImport={handleImport}
          pagination={paginationConfig}
        />

        {/* 右侧：配置详情 */}
        <Card
          className="flex-1 min-w-0"
          styles={{
            body: {
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          {/* 基础信息 */}
          <EndpointTypeForm form={basicForm} selectedType={selectedType} isEditing={isEditing} />

          {/* Schema配置 */}
          <SchemaFieldsTable
            loading={listLoading}
            ref={schemaFieldsTableRef}
            fields={editingSchemaFields}
            disabled={!isEditing}
            onChange={handleSchemaFieldsChange}
          />

          {/* 底部操作按钮 */}
          <ActionButtons
            isEditing={isEditing}
            hasSelected={!!selectedType}
            saveLoading={savePending}
            onPreview={handlePreview}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            onDelete={handleDelete}
            onExport={handleExport}
            onImport={handleImport}
          />
        </Card>
      </div>
      {/* 预览弹窗 - 使用 Suspense 包裹懒加载组件 */}
      {previewVisible && (
        <Suspense fallback={<Skeleton active />}>
          <PreviewModal visible={previewVisible} config={previewConfig} onClose={() => setPreviewVisible(false)} />
        </Suspense>
      )}
    </>
  );
};

export default EndpointConfig;
