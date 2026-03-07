import DragModal from '@/components/modal/DragModal';

/**
 * 导入DSL文件
 * @returns
 */
const ImportDsl: React.FC<ImportDslModelProps> = ({ open, onClose }) => {
  return (
    <DragModal centered open={open} title="导入DSL" onCancel={onClose}>
      <h1>ImportDsl</h1>
    </DragModal>
  );
};
export default ImportDsl;

export interface ImportDslModelProps {
  open: boolean;
  onClose: () => void;
}
