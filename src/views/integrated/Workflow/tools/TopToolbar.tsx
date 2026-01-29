import { AppstoreOutlined, HistoryOutlined, PlayCircleOutlined, RollbackOutlined } from '@ant-design/icons';
import { useNavigate } from '@tanstack/react-router';
import { Badge, Button, Space, Tag, Tooltip, theme } from 'antd';
import { IconRunHistory } from '../assets/icon-run-history';

/**
 * 顶部工具栏组件
 * @param appId 应用ID
 * @returns
 */
const TopToolbar: React.FC<{ appId: string }> = ({ appId }) => {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  return (
    <div className="absolute top-0 left-0 right-0 z-20 px-3 h-14 flex items-center justify-between">
      {/* 左侧：自动保存状态 */}
      <div className="flex items-center gap-2 text-sm" style={{ color: token.colorTextSecondary }}>
        <span>自动保存 22:10:05 · 未发布</span>
      </div>

      {/* 中间：项目名称（空白） */}
      <div className="flex-1 flex items-center justify-center">
        <Tag color="green" className="text-[16px]! p-1! cursor-pointer!">
          {/* 项目名称 */}
          应用ID ：{appId}
        </Tag>
      </div>

      {/* 右侧：操作按钮 */}
      <Space size="small">
        <Tooltip title="回到应用中心" color="white">
          <Button icon={<RollbackOutlined />} onClick={() => navigate({ to: `/integrated/apps`, replace: true })} />
        </Tooltip>
        <Button icon={<PlayCircleOutlined />} onClick={() => console.log('预览')}>
          预览
        </Button>
        <Tooltip title="查看运行记录" color="white">
          <Button icon={IconRunHistory} onClick={() => console.log('运行记录')} />
        </Tooltip>

        <Badge count={1} offset={[-5, 5]}>
          <Button icon={<AppstoreOutlined />} onClick={() => console.log('检查清单')}>
            检查清单
          </Button>
        </Badge>
        <Button type="primary" onClick={() => console.log('发布')}>
          发布
        </Button>
        <Tooltip title="版本历史" color="white">
          <Button icon={<HistoryOutlined />} onClick={() => console.log('版本历史')} />
        </Tooltip>
      </Space>
    </div>
  );
};

export default TopToolbar;
