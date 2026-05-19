import { PageSkeleton } from "@/components/shared/page-skeleton";

export default function SettingsLoading() {
  return <PageSkeleton title="Đang tải cài đặt..." cards={3} maxWidth="2xl" />;
}
