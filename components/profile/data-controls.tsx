"use client";

import { useTransition } from "react";
import { Download, AlertTriangle, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cancelDeletion, exportMyData, requestDeletion } from "@/lib/profile/actions";
import { formatDate, formatRelative } from "@/lib/utils/format";

interface DataControlsProps {
  deletionRequestedAt: string | null;
}

export function DataControls({ deletionRequestedAt }: DataControlsProps) {
  const [pending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      const r = await exportMyData();
      if (!r.ok || !r.data) {
        toast.error(r.error ?? "Lỗi xuất dữ liệu");
        return;
      }
      const blob = new Blob([JSON.stringify(r.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hidden-gift-export-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Đã xuất file JSON");
    });
  };

  const handleRequestDelete = () => {
    if (
      !confirm("Yêu cầu xoá tài khoản? Bạn có 30 ngày để huỷ trước khi dữ liệu bị xoá hoàn toàn.")
    )
      return;
    startTransition(async () => {
      const r = await requestDeletion();
      if (!r.ok) toast.error(r.error ?? "Lỗi");
      else toast.success("Đã yêu cầu xoá — có 30 ngày để đổi ý");
    });
  };

  const handleCancelDelete = () => {
    startTransition(async () => {
      const r = await cancelDeletion();
      if (!r.ok) toast.error(r.error ?? "Lỗi");
      else toast.success("Đã huỷ yêu cầu xoá");
    });
  };

  const deletionDeadline = deletionRequestedAt
    ? new Date(new Date(deletionRequestedAt).getTime() + 30 * 24 * 60 * 60 * 1000)
    : null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Dữ liệu của bạn</CardTitle>
          <CardDescription>
            Xuất toàn bộ dữ liệu cá nhân dưới dạng JSON. PDPL 2026 Điều 16 — quyền truy cập dữ liệu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleExport} disabled={pending}>
            <Download className="h-4 w-4" />
            {pending ? "Đang chuẩn bị..." : "Tải file JSON"}
          </Button>
        </CardContent>
      </Card>

      {deletionRequestedAt && deletionDeadline ? (
        <Card className="border-destructive/40">
          <CardHeader>
            <div className="bg-destructive/10 text-destructive inline-flex h-10 w-10 items-center justify-center rounded-lg">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <CardTitle className="mt-2">Tài khoản đang chờ xoá</CardTitle>
            <CardDescription>
              Yêu cầu vào {formatDate(deletionRequestedAt)} ({formatRelative(deletionRequestedAt)}).
              Dữ liệu xoá hoàn toàn sau {formatDate(deletionDeadline)}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                Đăng nhập lại trong vòng 30 ngày để huỷ xoá. Sau hạn, không hồi phục được.
              </AlertDescription>
            </Alert>
            <Button
              className="mt-4"
              variant="outline"
              onClick={handleCancelDelete}
              disabled={pending}
            >
              <RotateCcw className="h-4 w-4" />
              Huỷ yêu cầu xoá
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Xoá tài khoản</CardTitle>
            <CardDescription>
              30 ngày soft-delete — bạn có thể đổi ý. Sau đó xoá hoàn toàn khỏi database + storage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="ghost"
              onClick={handleRequestDelete}
              disabled={pending}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Yêu cầu xoá tài khoản
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
