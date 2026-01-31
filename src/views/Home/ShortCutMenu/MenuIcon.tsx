import { Image } from 'antd';
import avatar from '@/assets/images/avatar.png';

const MenuIcon: React.FC = () => {
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="menu-icon-item" style={{ width: '17%' }}>
          <Image width={60} src={avatar} preview={false} />
          <div className="menu-icon-item-name">菜单名称</div>
        </div>
      ))}
    </>
  );
};
export default MenuIcon;
