import type { Metadata } from "next";

export const metadata: Metadata = { title: "Chính sách Bảo mật" };

export default function PrivacyPage() {
  return (
    <div className="prose prose-sm dark:prose-invert mx-auto max-w-2xl px-4 py-12 sm:py-20">
      <h1>Chính sách Bảo mật</h1>
      <p className="text-muted-foreground">Cập nhật lần cuối: 19 tháng 5, 2026</p>

      <h2>1. Phạm vi</h2>
      <p>
        Chính sách này áp dụng cho ứng dụng Hidden Gift (hiddengift.vn) do 100B Studio vận hành,
        tuân thủ Luật Bảo vệ Dữ liệu Cá nhân Việt Nam (PDPL 2026) và GDPR ở mức tương thích cao.
      </p>

      <h2>2. Dữ liệu chúng tôi thu thập</h2>
      <ul>
        <li>
          <strong>Thông tin tài khoản</strong>: email, mật khẩu (mã hoá bcrypt qua Supabase Auth),
          tên hiển thị.
        </li>
        <li>
          <strong>Nội dung bạn nhập</strong>: điều ước, bí mật, thư hẹn giờ, nhật ký crush, ảnh kỷ
          niệm. Lưu trong database Supabase (region Singapore).
        </li>
        <li>
          <strong>Dữ liệu kỹ thuật</strong>: IP, user-agent, thời gian truy cập, page views (qua
          PostHog hoặc Plausible — tuỳ user chọn opt-out).
        </li>
        <li>
          <strong>Cookies cần thiết</strong>: phiên đăng nhập Supabase Auth. Không có cookie quảng
          cáo, không tracking cross-site.
        </li>
      </ul>

      <h2>3. Mục đích sử dụng</h2>
      <ul>
        <li>Cung cấp tính năng app (lưu trữ, hiển thị, xoá nội dung bạn tạo)</li>
        <li>Bảo mật tài khoản và phát hiện lạm dụng</li>
        <li>Cải thiện sản phẩm qua thống kê tổng hợp (không định danh)</li>
        <li>Gửi email giao dịch (xác nhận, thông báo letter delivered)</li>
      </ul>
      <p>
        Chúng tôi <strong>KHÔNG</strong> bán dữ liệu cá nhân, không huấn luyện mô hình AI từ nội
        dung của bạn, không gửi marketing email mà bạn không đồng ý.
      </p>

      <h2>4. Bí mật asymmetric (đặc trưng kỹ thuật)</h2>
      <p>
        Hidden Gift sử dụng Postgres Row-Level Security để enforce bí mật giữa couple. Điều ước, bí
        mật đang chuẩn bị, nhật ký crush được isolate ở tầng database — partner KHÔNG thể đọc qua
        bất kỳ API nào, kể cả khi có token. Đây là tính năng cốt lõi, không phải tính năng phụ.
      </p>

      <h2>5. Chia sẻ dữ liệu</h2>
      <p>Chúng tôi chia sẻ dữ liệu với các nhà cung cấp dịch vụ sau:</p>
      <ul>
        <li>
          <strong>Supabase</strong> (Singapore) — lưu trữ database + auth
        </li>
        <li>
          <strong>Cloudflare R2</strong> hoặc Supabase Storage — lưu ảnh/video kỷ niệm
        </li>
        <li>
          <strong>Resend</strong> — gửi email giao dịch
        </li>
        <li>
          <strong>Trigger.dev</strong> — xử lý job định kỳ (giao thư đúng giờ)
        </li>
        <li>
          <strong>PostHog</strong> — analytics tổng hợp (có thể opt-out trong Cài đặt)
        </li>
        <li>
          <strong>Sentry</strong> — ghi nhận lỗi kỹ thuật (không gồm nội dung user)
        </li>
      </ul>
      <p>
        Tất cả nhà cung cấp tuân thủ tiêu chuẩn SOC 2 hoặc tương đương. Hợp đồng xử lý dữ liệu (DPA)
        đã ký.
      </p>

      <h2>6. Quyền của bạn (PDPL 2026)</h2>
      <ul>
        <li>
          <strong>Quyền truy cập</strong>: xem toàn bộ dữ liệu cá nhân chúng tôi giữ (xuất JSON qua
          Cài đặt → Xuất dữ liệu).
        </li>
        <li>
          <strong>Quyền sửa</strong>: chỉnh sửa nickname, email, mật khẩu trong Cài đặt.
        </li>
        <li>
          <strong>Quyền xoá</strong>: xoá tài khoản trong Cài đặt. 30 ngày soft-delete, sau đó xoá
          hoàn toàn khỏi database + storage backup.
        </li>
        <li>
          <strong>Quyền rút lại đồng ý</strong>: tắt analytics, tắt email marketing bất cứ lúc nào.
        </li>
        <li>
          <strong>Quyền khiếu nại</strong>: liên hệ Cục An toàn Thông tin (Bộ Thông tin và Truyền
          thông) nếu thấy quyền bị xâm phạm.
        </li>
      </ul>

      <h2>7. Bảo mật</h2>
      <ul>
        <li>TLS 1.3 cho mọi kết nối</li>
        <li>Mật khẩu hash bcrypt (Supabase Auth managed)</li>
        <li>RLS policies kiểm soát quyền truy cập dữ liệu ở tầng DB</li>
        <li>Backup database hàng ngày, retention 7 ngày</li>
        <li>Vé bug bounty: liên hệ security@hiddengift.vn</li>
      </ul>

      <h2>8. Trẻ em</h2>
      <p>
        Hidden Gift dành cho người từ <strong>16 tuổi trở lên</strong>. Nếu chúng tôi phát hiện tài
        khoản dưới 16, sẽ xoá ngay lập tức.
      </p>

      <h2>9. Lưu trữ dữ liệu</h2>
      <p>
        Database lưu ở region Singapore (ap-southeast-1). Theo PDPL 2026 Điều 9, đây là chuyển dữ
        liệu xuyên biên giới hợp pháp với mục đích vận hành dịch vụ, đã có cơ chế bảo vệ tương
        đương.
      </p>

      <h2>10. Thay đổi chính sách</h2>
      <p>
        Khi có thay đổi quan trọng, chúng tôi thông báo qua email + banner trong app ít nhất 30 ngày
        trước khi có hiệu lực.
      </p>

      <h2>11. Liên hệ</h2>
      <ul>
        <li>
          <strong>Privacy Officer</strong>: privacy@hiddengift.vn
        </li>
        <li>
          <strong>Security</strong>: security@hiddengift.vn
        </li>
        <li>
          <strong>Địa chỉ</strong>: 100B Studio, Hà Nội (sẽ cập nhật khi đăng ký doanh nghiệp)
        </li>
      </ul>
    </div>
  );
}
