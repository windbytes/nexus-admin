import { useQuery } from '@tanstack/react-query';
import { Select } from 'antd';

// 字典选择器组件的props
interface DictionarySelectProps {
  dictCode: string;
  onChange: (value: string) => void;
}

// 字典选择器组件
const DictionarySelect: React.FC<DictionarySelectProps> = ({ dictCode, onChange }) => {
  // 加载字典数据
  const { data, isFetching } = useQuery({
    queryKey: ['component_dictionary', dictCode],
    queryFn: async () => {
      const response = await fetch(`/api/dict/${dictCode}`);
      const data = await response.json();
      return data;
    },
  });

  return <Select options={data} placeholder="请选择" onChange={onChange} loading={isFetching} />;
};

export default DictionarySelect;
