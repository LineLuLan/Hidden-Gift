"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { CallBackProps, Step } from "react-joyride";

import { markTutorialComplete } from "@/lib/tutorial/actions";

// react-joyride uses window — load it client-only via default-export resolver.
const Joyride = dynamic(() => import("react-joyride").then((mod) => mod.default), { ssr: false });

const STEPS: Step[] = [
  {
    target: '[data-tutorial="hero"]',
    placement: "bottom",
    title: "Chào mừng tới Hidden Gift 🤍",
    content:
      "Đây là nơi nhóm bạn ghi điều ước, âm thầm chuẩn bị quà, viết thư hẹn giờ, và lưu kỷ niệm. Mình sẽ dẫn bạn đi 1 vòng nhanh.",
    disableBeacon: true,
  },
  {
    target: '[data-tutorial="feature-wishes"]',
    placement: "bottom",
    title: "Điều ước",
    content:
      "Ghi điều bạn mong nhận. Cả nhóm thấy chung — nhưng nếu ai âm thầm chuẩn bị quà, BẠN sẽ không biết đến lúc mở quà 🤫",
  },
  {
    target: '[data-tutorial="feature-secrets"]',
    placement: "bottom",
    title: "Bí mật",
    content:
      "Khi bạn 'claim' điều ước của người khác, hoặc tự tạo surprise tự nghĩ — quà đang chuẩn bị nằm ở đây. Người nhận không thấy đến khi bạn bấm 'Đã tặng'.",
  },
  {
    target: '[data-tutorial="feature-letters"]',
    placement: "bottom",
    title: "Thư hẹn giờ",
    content:
      "Viết hôm nay, gửi tới tương lai. Hẹn ngày kỷ niệm, sinh nhật, hay bất ngờ ngẫu hứng — thư tự động đến đúng giờ.",
  },
  {
    target: '[data-tutorial="feature-memories"]',
    placement: "top",
    title: "Kỷ niệm",
    content: "Album chia sẻ — upload ảnh và video. iPhone HEIC tự convert, ảnh tự resize cho nhẹ.",
  },
  {
    target: '[data-tutorial="feature-pings"]',
    placement: "top",
    title: "Ping nhanh",
    content:
      "Gửi 1 emoji + 1 dòng cho người ấy. Realtime — họ thấy toast bay lên ngay khi bạn bấm.",
  },
  {
    target: '[data-tutorial="invite-card"], [data-tutorial="hero"]',
    placement: "bottom",
    title: "Mời partner / squad",
    content:
      "Nhiều tính năng cần ít nhất 2 người. Vào Cài đặt → tạo mã mời → gửi cho người ấy hoặc cả nhóm bạn.",
  },
  {
    target: "body",
    placement: "center",
    title: "Xong rồi 💝",
    content:
      "Bạn có thể bật lại tutorial này bất cứ lúc nào ở Cài đặt. Chúc tụi mình nhiều khoảnh khắc đẹp!",
  },
];

interface TourProps {
  /** When true, the tour starts automatically. */
  autoStart: boolean;
}

export function Tour({ autoStart }: TourProps) {
  const [run, setRun] = useState<boolean>(autoStart);
  const [, startTransition] = useTransition();

  function handleCallback(data: CallBackProps) {
    const finishedStatuses: string[] = ["finished", "skipped"];
    if (finishedStatuses.includes(data.status)) {
      setRun(false);
      startTransition(async () => {
        const r = await markTutorialComplete();
        if (!r.ok) {
          toast.error("Không lưu được trạng thái hướng dẫn");
          return;
        }
        if (data.status === "finished") {
          toast.success("Hoàn thành tour — chúc tụi mình nhiều khoảnh khắc đẹp 💝");
        }
      });
    }
  }

  if (!run) return null;

  return (
    <Joyride
      steps={STEPS}
      run={run}
      continuous
      showSkipButton
      showProgress
      scrollToFirstStep
      disableScrolling={false}
      locale={{
        back: "Quay lại",
        close: "Đóng",
        last: "Kết thúc",
        next: "Tiếp",
        open: "Mở",
        skip: "Bỏ qua",
      }}
      styles={{
        options: {
          primaryColor: "hsl(347, 77%, 50%)",
          textColor: "hsl(240, 10%, 4%)",
          backgroundColor: "hsl(0, 0%, 100%)",
          overlayColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          fontSize: 14,
        },
        buttonNext: { borderRadius: 8, padding: "8px 16px" },
        buttonBack: { color: "hsl(240, 5%, 40%)", marginRight: 8 },
        buttonSkip: { color: "hsl(240, 5%, 50%)" },
      }}
      callback={handleCallback}
    />
  );
}
