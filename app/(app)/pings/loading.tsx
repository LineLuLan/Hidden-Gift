import { PageSkeleton } from "@/components/shared/page-skeleton";

export default function PingsLoading() {
  return <PageSkeleton title="Đang tải ping..." cards={3} maxWidth="2xl" />;
}
