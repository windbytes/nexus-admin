import { MinimapRender } from '@flowgram.ai/minimap-plugin';
import { Activity } from 'react';

/**
 * 缩略图
 * @param param0
 * @returns
 */
const MiniMap: React.FC<MiniMapProps> = ({ visible }) => {
  return (
    <Activity mode={visible ? 'visible' : 'hidden'}>
      <div className="absolute bottom-14 w-[198px]">
        <MinimapRender
          panelStyles={{}}
          containerStyles={{
            pointerEvents: 'auto',
            position: 'relative',
            top: 'unset',
            right: 'unset',
            bottom: 'unset',
            left: 'unset',
          }}
          inactiveStyle={{
            opacity: 1,
            scale: 1,
            translateX: 0,
            translateY: 0,
          }}
        />
      </div>
    </Activity>
  );
};
export default MiniMap;

type MiniMapProps = {
  visible: boolean;
};
