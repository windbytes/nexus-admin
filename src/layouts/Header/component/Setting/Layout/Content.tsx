import ContentCompact from '../icons/ContentCompact';
import HeaderNav from '../icons/HeaderNav';
import './layout.scss';

/**
 * 预设内容布局
 */
const PRESET = [
  {
    name: 'wide',
    type: HeaderNav,
  },
  {
    name: 'compact',
    type: ContentCompact,
  },
];

/**
 * 内容设置
 * @returns
 */
const Content: React.FC = () => {
  return (
    <div className='flex w-full gap-5'>
      {PRESET.map((item) => (
        <div key={item.name} className='w-24 cursor-pointer flex flex-col'>
          <div className="outline-box flex items-center justify-center">
            {(() => {
              const Comp = item.type;
              return <Comp />;
            })()}
          </div>
          <div className="layoutTitle">{item.name}</div>
        </div>
      ))}
    </div>
  );
};
export default Content;
