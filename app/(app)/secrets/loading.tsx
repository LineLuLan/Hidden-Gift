import { PageSkeleton } from "@/components/shared/page-skeleton";

export default function SecretsLoading() {
  return <PageSkeleton title="Đang tải bí mật..." cards={6} />;
}
