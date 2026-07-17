import { usePreferencesStore } from '@/shared/stores/preferences.store';
import BreadcrumbNav from './BreadcrumbNav';

/**
 * 面包屑导航
 */
const BreadcrumbNavWrapper = () => {
  const breadcrumbEnable = usePreferencesStore((state) => state.preferences.breadcrumb.enable);
  return breadcrumbEnable && <BreadcrumbNav />;
};

export default BreadcrumbNavWrapper;
