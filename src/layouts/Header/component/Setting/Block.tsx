/**
 * 设置页面的块组件
 * @returns
 */
const Block: React.FC<BlockProps> = ({ title, children }) => {
  return (
    <div className="flex flex-col py-4 px-0">
      <h3 className="letter-spacing-[-0.4px] font-bold m-0 mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
};
export default Block;

export type BlockProps = {
  children?: React.ReactNode;
  title?: string;
};
