import Block from '../Block';
import Buitin from './Buitin';
import ColorMode from './ColorMode';
import MyTheme from './MyTheme';
import Radius from './Radius';

/**
 * 主题设置
 * @returns
 */
const Theme: React.FC = () => {
  return (
    <>
      {/* 主题 */}
      <Block title="主题">
        <MyTheme />
      </Block>
      {/* 内置主题 */}
      <Block title="内置主题">
        <Buitin />
      </Block>
      {/* 圆角 */}
      <Block title="圆角">
        <Radius />
      </Block>
      {/* 颜色模式 */}
      <Block title="其他">
        <ColorMode />
      </Block>
    </>
  );
};
export default Theme;
