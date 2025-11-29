import { useQuery } from "@tanstack/react-query";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import echarts from "@/config/echartsConfig";
import type { CategoryData } from "../../mockData";
import {
	getFlowCategoryBarChartOption,
	getResponsiveChartOption,
} from "../chartConfigs";

// 模拟获取类别数据的API
const fetchCategoryData = async (): Promise<CategoryData> => {
	// 模拟API延迟
	await new Promise((resolve) => setTimeout(resolve, 300));

	return {
		categories: [
			"财务审批流程",
			"人事变动申请",
			"设备采购申请",
			"项目立项流程",
			"合同审批流程",
			"报销申请流程",
			"请假申请流程",
			"培训申请流程",
		],
		values: [156, 89, 234, 67, 189, 312, 145, 78],
		total: 1320,
		colors: [
			"#1890ff",
			"#52c41a",
			"#faad14",
			"#f5222d",
			"#722ed1",
			"#13c2c2",
			"#eb2f96",
			"#fa8c16",
		],
	};
};

export const FlowCategoryChart: React.FC = () => {
	const chartRef = useRef<HTMLDivElement>(null);
	const chartInstance = useRef<echarts.ECharts | null>(null);
	const [chartData, setChartData] = useState<CategoryData | null>(null);
	const resizeObserverRef = useRef<ResizeObserver | null>(null);

	const { data: categoryData, isLoading } = useQuery({
		queryKey: ["flowCategoryData"],
		queryFn: fetchCategoryData,
		staleTime: 5 * 60 * 1000, // 5分钟
	});

	useEffect(() => {
		if (categoryData) {
			setChartData(categoryData);
		}
	}, [categoryData]);

	useEffect(() => {
		if (!chartRef.current || !chartData) return;

		// 检查DOM尺寸是否可用
		const checkAndInitChart = () => {
			if (!chartRef.current) return;

			const { clientWidth, clientHeight } = chartRef.current;
			// 如果DOM尺寸为0，延迟初始化
			if (clientWidth === 0 || clientHeight === 0) {
				requestAnimationFrame(checkAndInitChart);
				return;
			}

			// 初始化图表
			if (!chartInstance.current) {
				chartInstance.current = echarts.init(chartRef.current);
			}

			// 使用配置工具生成图表选项
			const baseOption = getFlowCategoryBarChartOption(chartData);
			const isMobile = window.innerWidth < 768;
			const option = getResponsiveChartOption(baseOption, isMobile);

			// 设置图表选项
			chartInstance.current.setOption(option);
		};

		// 使用 requestAnimationFrame 确保DOM已渲染
		requestAnimationFrame(checkAndInitChart);

		// 使用 ResizeObserver 监听容器尺寸变化
		resizeObserverRef.current = new ResizeObserver(() => {
			if (chartInstance.current) {
				chartInstance.current.resize();
			}
		});

		if (chartRef.current) {
			resizeObserverRef.current.observe(chartRef.current);
		}

		// 响应式处理（保留原有的resize监听作为备用）
		const handleResize = () => {
			chartInstance.current?.resize();
		};

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
			if (resizeObserverRef.current) {
				resizeObserverRef.current.disconnect();
				resizeObserverRef.current = null;
			}
			if (chartInstance.current) {
				chartInstance.current.dispose();
				chartInstance.current = null;
			}
		};
	}, [chartData]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-gray-500">加载中...</div>
			</div>
		);
	}

	if (!chartData) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-gray-500">暂无数据</div>
			</div>
		);
	}

	return (
		<div className="w-full">
			<div className="text-center mb-4">
				<div className="text-2xl font-bold text-gray-800">
					{chartData.total.toLocaleString()}
				</div>
				<div className="text-sm text-gray-500">总流程量</div>
			</div>

			<div ref={chartRef} className="w-full h-64" />

			{/* 图例 */}
			<div className="mt-4 grid grid-cols-2 gap-2">
				{chartData.categories.map((category, index) => (
					<div
						key={`legend-${category}`}
						className="flex items-center justify-between text-xs"
					>
						<div className="flex items-center">
							<div
								className="w-3 h-3 rounded mr-2"
								style={{
									background: `linear-gradient(to bottom, ${chartData.colors[index]}40, ${chartData.colors[index]})`,
								}}
							></div>
							<span className="text-gray-700 truncate">{category}</span>
						</div>
						<span className="text-gray-800 font-medium">
							{chartData.values[index]?.toLocaleString()}
						</span>
					</div>
				))}
			</div>
		</div>
	);
};
