/**
 * 工具栏占位命令：为配置中使用的所有 command 注册 no-op，避免点击时报「未注册命令」
 * 后续由具体功能或插件替换为真实实现
 */
import { registerCommand } from '../core/extension';

/**
 * 占位命令处理器：无实际操作，仅避免「未注册命令」报错。
 * 示例：开发时可打印入参便于调试；正式实现时由插件通过 registerCommand 覆盖。
 */
const noop = (...args: unknown[]): void => {
  if (import.meta.env?.DEV && args.length > 0) {
    console.info('[NWriter.Toolbar] 占位命令被触发，参数:', args);
  }
};

const PLACEHOLDER_COMMANDS = [
  'format.painter',
  'edit.paste',
  'edit.cut',
  'format.font',
  'format.fontSize',
  'format.fontLarger',
  'format.fontSmaller',
  'format.case',
  'format.clear',
  'format.bold',
  'format.italic',
  'format.underline',
  'format.strikethrough',
  'format.highlight',
  'format.fontColor',
  'format.bulletList',
  'format.numberList',
  'format.indentDecrease',
  'format.indentIncrease',
  'format.alignLeft',
  'format.alignCenter',
  'format.alignRight',
  'format.alignJustify',
  'style.body',
  'style.h1',
  'style.h2',
  'style.set',
  'edit.findReplace',
  'edit.select',
  'insert.blankPage',
  'insert.cover',
  'insert.pageBreak',
  'insert.pageNumber',
  'insert.headerFooter',
  'insert.table',
  'insert.image',
  'insert.shape',
  'insert.textBox',
  'insert.chart',
  'insert.symbol',
  'insert.equation',
  'insert.comment',
  'insert.link',
  'page.marginTop',
  'page.marginBottom',
  'page.marginLeft',
  'page.marginRight',
  'page.orientation',
  'page.paperSize',
  'page.theme',
  'page.watermark',
  'ref.toc',
  'ref.updateToc',
  'ref.footnote',
  'ref.endnote',
  'review.comment',
  'review.track',
  'review.accept',
  'review.reject',
  'view.fullscreen',
  'view.page',
  'view.outline',
  'view.ruler',
  'view.grid',
  'view.zoom',
  'table.insertRow',
  'table.insertCol',
  'table.merge',
  'tools.template',
  'tools.snippet',
];

export function registerToolbarPlaceholderCommands(): void {
  for (const name of PLACEHOLDER_COMMANDS) {
    registerCommand(name, noop);
  }
}
