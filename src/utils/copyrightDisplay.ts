/** 产品首次版权年份；跨年展示为「起始年-当前年」，随本机日期自动更新 */
const COPYRIGHT_RANGE_START_YEAR = 2025;

/**
 * 用于页脚/登录页等固定文案中的年份区间（含当年，不写死「至今」字样）。
 */
export function copyrightYearRangeFrom(startYear: number = COPYRIGHT_RANGE_START_YEAR): string {
  const now = new Date().getFullYear();
  return now <= startYear ? String(startYear) : `${startYear}-${now}`;
}
