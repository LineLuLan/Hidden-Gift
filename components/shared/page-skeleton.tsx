import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PageSkeletonProps {
  title?: string;
  /** How many card placeholders to render. */
  cards?: number;
  /** Max width container. */
  maxWidth?: "xl" | "2xl" | "3xl";
}

const WIDTH_CLASS: Record<NonNullable<PageSkeletonProps["maxWidth"]>, string> = {
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
};

export function PageSkeleton({
  title = "Đang tải...",
  cards = 4,
  maxWidth = "3xl",
}: PageSkeletonProps) {
  return (
    <div className={`mx-auto ${WIDTH_CLASS[maxWidth]} space-y-6`}>
      <header className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: cards }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="sr-only">{title}</p>
    </div>
  );
}
