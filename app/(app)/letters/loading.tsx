import { PageSkeleton } from "@/components/shared/page-skeleton";

export default function LettersLoading() {
  return <PageSkeleton title="Đang tải thư..." cards={6} />;
}
