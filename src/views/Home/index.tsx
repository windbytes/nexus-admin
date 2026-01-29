import { Button, Card, Col, DatePicker, Row } from "antd";
import DocumentPieChart from "./DocumentPieChart";
import EndpointStatistics from "./EndpointStatistics";
import style from "./home.module.scss";
import ShortCutMenu from "./ShortCutMenu";
import StatusLineChart from "./StatusLineChart";

const { RangePicker } = DatePicker;

/**
 * 首页
 * @returns 组件内容
 */
function Home() {
	return (
		<>
			<Row gutter={8}>
				<Col span={16}>
					<Card className={style["cardTitleBar"]} style={{ height: "300px" }}>
						欢迎
					</Card>
				</Col>
				<Col span={8}>
					<Card
						style={{ height: "300px" }}
						styles={{ header: { borderBottom: "none" } }}
						title="快捷菜单"
						extra={
							<Button color="default" variant="filled" size="small">
								配置
							</Button>
						}
					>
						<ShortCutMenu />
					</Card>
				</Col>
			</Row>
			<Row gutter={8} style={{ marginTop: "8px" }}>
				<Col span={12}>
					<Card
						styles={{
							header: { borderBottom: "none" },
							body: { height: "350px", width: "100%" },
						}}
						title="引擎状态"
					>
						<StatusLineChart />
					</Card>
				</Col>
				<Col span={12}>
					<Card
						styles={{
							header: { borderBottom: "none" },
							body: { height: "350px" },
						}}
						title="端点统计"
					>
						<EndpointStatistics />
					</Card>
				</Col>
			</Row>
			<Row gutter={8} style={{ marginTop: "8px" }}>
				<Col span={8}>
					<Card
						styles={{
							header: { borderBottom: "none" },
							body: { height: "450px", width: "100%" },
						}}
						title="请求占比"
					>
						<DocumentPieChart />
					</Card>
				</Col>
				<Col span={16}>
					<Card
						styles={{
							header: { borderBottom: "none" },
							body: { height: "450px", width: "100%" },
						}}
						title="每日消息统计"
						extra={<RangePicker />}
					>
						菜单
					</Card>
				</Col>
			</Row>
			<pre>
				1、流程统计看板（Dashboard） 1、今日/本周运行流程数 2、成功/失败流程统计
				3、异常流程预警 4、热门流程 TOP5 5、流程运行时间趋势图 2、快捷入口
				1、新建流程 2、流程模板库 3、流程监控 4、节点管理 / 节点开发 5、操作日志
				3、待办提醒 / 异常警报 1、失败流程列表 2、等待人工处理的流程
				3、警告级别的系统通知
			</pre>
		</>
	);
}
export default Home;
