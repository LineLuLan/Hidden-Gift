import type { Metadata } from "next";

export const metadata: Metadata = { title: "Điều khoản Sử dụng" };

export default function TermsPage() {
  return (
    <div className="prose prose-sm dark:prose-invert mx-auto max-w-2xl px-4 py-12 sm:py-20">
      <h1>Điều khoản Sử dụng</h1>
      <p className="text-muted-foreground">Cập nhật lần cuối: 19 tháng 5, 2026</p>

      <h2>1. Chấp nhận</h2>
      <p>
        Bằng việc tạo tài khoản Hidden Gift, bạn đồng ý các điều khoản này. Nếu không đồng ý, vui
        lòng không sử dụng dịch vụ.
      </p>

      <h2>2. Mô tả dịch vụ</h2>
      <p>
        Hidden Gift là ứng dụng giúp couple ghi điều ước, chuẩn bị quà bí mật, gửi thư hẹn giờ, lưu
        kỷ niệm. Phiên bản Beta (Phase 1-2) miễn phí 100%. Phiên bản Pro (Phase 3+) có phí 29.000
        VND/tháng hoặc 149.000 VND/năm.
      </p>

      <h2>3. Tài khoản</h2>
      <ul>
        <li>Bạn phải từ 16 tuổi trở lên</li>
        <li>1 người = 1 tài khoản. Không tạo nhiều tài khoản để vượt giới hạn Free tier.</li>
        <li>Bảo vệ mật khẩu của mình. Chúng tôi không chịu trách nhiệm nếu bạn share password.</li>
        <li>Cung cấp thông tin trung thực (email phải là email bạn sở hữu)</li>
      </ul>

      <h2>4. Nội dung bạn tạo</h2>
      <p>
        Bạn giữ <strong>toàn bộ quyền sở hữu</strong> nội dung mình tạo (điều ước, thư, ảnh, nhật
        ký). Bạn cấp cho 100B Studio <strong>chỉ giới hạn</strong> license cần thiết để vận hành
        dịch vụ (lưu trữ, hiển thị cho bạn và partner, backup).
      </p>
      <p>Bạn cam kết KHÔNG đăng nội dung:</p>
      <ul>
        <li>Vi phạm pháp luật Việt Nam</li>
        <li>Khiêu dâm trẻ em, bạo lực, kích động thù hằn</li>
        <li>Xâm phạm bản quyền của người khác</li>
        <li>Spam hoặc lừa đảo</li>
      </ul>
      <p>Vi phạm dẫn tới khoá tài khoản và có thể báo cáo cơ quan chức năng.</p>

      <h2>5. Bí mật asymmetric</h2>
      <p>
        Tính năng bí mật ở tầng database hoạt động đúng như mô tả — partner KHÔNG thể đọc nội dung
        bạn chuẩn bị qua bất kỳ API public nào. Tuy nhiên, đây không phải bảo mật quân sự — đừng
        dùng app để lưu thông tin cực kỳ nhạy cảm (mã ngân hàng, bí mật quốc gia, v.v.).
      </p>

      <h2>6. Pro tier (Phase 3+)</h2>
      <ul>
        <li>Thanh toán qua PayOS (chuyển khoản ngân hàng Việt Nam)</li>
        <li>Tự động gia hạn nếu không huỷ trước ngày renew</li>
        <li>Hoàn tiền trong 7 ngày đầu nếu không hài lòng</li>
        <li>Huỷ bất cứ lúc nào trong Cài đặt → Subscription</li>
      </ul>

      <h2>7. Giới hạn Free tier (Phase 1-2)</h2>
      <ul>
        <li>5 điều ước đang chờ tại một thời điểm</li>
        <li>10MB / file ảnh hoặc video</li>
        <li>1 partner / tài khoản (couple mode)</li>
        <li>Không truy cập analytics nâng cao</li>
      </ul>

      <h2>8. Chấm dứt</h2>
      <p>
        Chúng tôi có thể đóng tài khoản nếu bạn vi phạm điều khoản. Bạn có thể đóng tài khoản bất cứ
        lúc nào — 30 ngày soft-delete để khôi phục, sau đó xoá hoàn toàn.
      </p>

      <h2>9. Miễn trừ trách nhiệm</h2>
      <p>
        Dịch vụ cung cấp &ldquo;như hiện trạng&rdquo; (as-is). Chúng tôi không bảo đảm 100% uptime
        hay dữ liệu không bao giờ mất. Tuy nhiên, chúng tôi backup hàng ngày và làm mọi cách hợp lý
        để giữ dữ liệu an toàn.
      </p>

      <h2>10. Giới hạn trách nhiệm</h2>
      <p>
        Trách nhiệm tối đa của 100B Studio với bất kỳ user nào là{" "}
        <strong>tương đương số tiền bạn đã trả trong 12 tháng gần nhất</strong>, hoặc 0 đồng nếu bạn
        dùng Free tier.
      </p>

      <h2>11. Luật áp dụng</h2>
      <p>
        Điều khoản này theo pháp luật Việt Nam. Tranh chấp ưu tiên giải quyết thông qua thương
        lượng. Nếu không thành, tòa án có thẩm quyền tại Hà Nội thụ lý.
      </p>

      <h2>12. Liên hệ</h2>
      <ul>
        <li>
          <strong>Hỗ trợ</strong>: support@hiddengift.vn
        </li>
        <li>
          <strong>Pháp lý</strong>: legal@hiddengift.vn
        </li>
      </ul>
    </div>
  );
}
