import { initI18n } from './i18n';

/**
 * 启动初始化入口
 *
 * 统一编排挂载前初始化逻辑。当前先接入 syndra-admin 入口中的 i18n 初始化，
 * 后续可继续扩展 auth、theme、websocket 等启动任务。
 */
export async function bootstrap() {
  await initI18n();
}
