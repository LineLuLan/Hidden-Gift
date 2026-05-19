/**
 * @file lib/email/templates.ts
 * @description Vietnamese email templates. Inline HTML so no JSX/MJML dependency
 *              needed. Pass user-supplied values via simple interpolation
 *              (already HTML-escaped by caller).
 */

const BRAND_COLOR = "#d63384"; // matches --color-primary rose

function shell(content: string, preheader: string) {
  return `<!doctype html><html lang="vi">
    <head><meta charset="utf-8"><title>Hidden Gift</title></head>
    <body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;">
      <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#fafafa;">
        <tr><td align="center" style="padding:24px;">
          <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:100%;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee;">
            <tr><td style="padding:24px 32px;border-bottom:1px solid #f0f0f0;">
              <a href="https://hiddengift.vn" style="color:${BRAND_COLOR};font-weight:600;text-decoration:none;letter-spacing:1px;">HIDDEN GIFT</a>
            </td></tr>
            <tr><td style="padding:32px;">${content}</td></tr>
            <tr><td style="padding:16px 32px;border-top:1px solid #f0f0f0;color:#888;font-size:12px;">
              © ${new Date().getFullYear()} Hidden Gift · 100B Studio · Hà Nội
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function welcomeEmail(displayName: string): { subject: string; html: string } {
  return {
    subject: "Chào mừng tới Hidden Gift 💝",
    html: shell(
      `<h1 style="margin:0 0 16px;font-size:24px;">Chào ${escapeHtml(displayName)} 👋</h1>
       <p style="margin:0 0 12px;">Cảm ơn bạn đã đăng ký Hidden Gift — app couple bí mật ở tầng database.</p>
       <p style="margin:0 0 16px;">Bắt đầu nhanh:</p>
       <ul style="margin:0 0 16px;padding-left:20px;line-height:1.6;">
         <li>Ghi vài <strong>điều ước</strong> riêng tư đầu tiên</li>
         <li>Mời partner qua mã ở <strong>Cài đặt</strong></li>
         <li>Hoặc bắt đầu với <strong>Solo Crush mode</strong> nếu đang thầm thương</li>
       </ul>
       <p style="margin:24px 0 0;"><a href="https://hiddengift.vn" style="background:${BRAND_COLOR};color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Mở app</a></p>`,
      `Chào ${displayName}, cảm ơn bạn đã đăng ký Hidden Gift`,
    ),
  };
}

export function letterDeliveredEmail(params: {
  recipientName: string;
  senderName: string;
  letterSubject: string;
  letterUrl: string;
}): { subject: string; html: string } {
  const { recipientName, senderName, letterSubject, letterUrl } = params;
  return {
    subject: `✉️ Thư mới từ ${senderName}: ${letterSubject}`,
    html: shell(
      `<h1 style="margin:0 0 16px;font-size:24px;">${escapeHtml(senderName)} vừa gửi bạn một thư 💌</h1>
       <p style="margin:0 0 12px;">Tiêu đề: <strong>${escapeHtml(letterSubject)}</strong></p>
       <p style="margin:0 0 24px;">${escapeHtml(recipientName)} ơi, mở app để đọc nha.</p>
       <p><a href="${letterUrl}" style="background:${BRAND_COLOR};color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Đọc thư ngay</a></p>`,
      `${senderName} vừa gửi bạn một thư mới qua Hidden Gift`,
    ),
  };
}

export function inviteEmail(params: { inviterName: string; inviteUrl: string }): {
  subject: string;
  html: string;
} {
  const { inviterName, inviteUrl } = params;
  return {
    subject: `${inviterName} mời bạn join Hidden Gift 💝`,
    html: shell(
      `<h1 style="margin:0 0 16px;font-size:24px;">${escapeHtml(inviterName)} muốn dùng app này cùng bạn</h1>
       <p style="margin:0 0 12px;">Hidden Gift là app couple bí mật ở tầng database — partner KHÔNG thấy điều ước hay bí mật bạn đang chuẩn bị.</p>
       <p style="margin:0 0 24px;">Bấm link để nhận lời mời:</p>
       <p><a href="${inviteUrl}" style="background:${BRAND_COLOR};color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Nhận lời mời</a></p>
       <p style="margin:24px 0 0;color:#888;font-size:12px;">Nếu nút không hoạt động, copy link: ${inviteUrl}</p>`,
      `${inviterName} mời bạn join Hidden Gift`,
    ),
  };
}
