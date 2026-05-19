-- Hidden Gift — Seed curated gift ideas (30 entries)
-- Public read; replaces AI-generated suggestions per CLAUDE.md Decision #1.
-- Categories: sinh-nhat / ky-niem / valentine / 8-3 / 20-10 / random
-- Personas: student / office-worker / long-distance
-- Budgets: low (<200k) / mid (200-500k) / high (500k+) VND

INSERT INTO public.gift_ideas (title, description, category, occasion, price_min, price_max, persona_fit, emoji, popularity)
VALUES
-- Sinh nhật (birthday)
('Vòng tay handmade kết tên', 'Vòng dây thừng có chữ cái đính tên người yêu', 'sinh-nhat', ARRAY['birthday'], 80000, 250000, ARRAY['student'], '💍', 95),
('Sổ tay da thật khắc tên', 'Notebook bìa da PU khắc laser tên + ngày sinh', 'sinh-nhat', ARRAY['birthday'], 200000, 500000, ARRAY['office-worker'], '📓', 88),
('Hoa sáp + đèn LED hộp gỗ', 'Hộp gỗ kính chứa hoa sáp + đèn dây vàng', 'sinh-nhat', ARRAY['birthday', 'anniversary'], 300000, 700000, ARRAY['student', 'office-worker'], '🌹', 92),
('Cốc đôi đổi màu khi rót nóng', 'Cặp cốc sứ in ảnh, lộ hình khi đổ nước nóng', 'sinh-nhat', ARRAY['birthday'], 150000, 350000, ARRAY['student'], '☕', 75),
('Tai nghe Bluetooth tone pastel', 'Earbuds True Wireless màu hồng/be hợp Gen Z', 'sinh-nhat', ARRAY['birthday'], 500000, 1500000, ARRAY['student', 'office-worker'], '🎧', 90),

-- Kỷ niệm (anniversary)
('Bản đồ sao đêm gặp nhau', 'Print A3 vị trí sao tối hôm bắt đầu yêu', 'ky-niem', ARRAY['anniversary', '100-days'], 250000, 600000, ARRAY['long-distance', 'office-worker'], '✨', 96),
('Album ảnh polaroid 50 tấm', 'Album scrapbook ảnh kèm chú thích tay viết', 'ky-niem', ARRAY['anniversary', '100-days'], 200000, 450000, ARRAY['student'], '📸', 89),
('Hộp 365 lý do yêu em', 'Hộp gỗ chứa 365 mẩu giấy ghi lý do, bóc 1 mỗi ngày', 'ky-niem', ARRAY['anniversary'], 150000, 400000, ARRAY['student', 'long-distance'], '💌', 94),
('Trang sức couple bạc 925', 'Cặp dây chuyền hoặc nhẫn bạc khắc tọa độ', 'ky-niem', ARRAY['anniversary'], 500000, 1500000, ARRAY['office-worker'], '💎', 87),
('Tranh canvas vẽ chibi 2 người', 'Custom drawing chibi gửi qua email + in canvas 30x40cm', 'ky-niem', ARRAY['anniversary', '100-days'], 250000, 500000, ARRAY['student'], '🎨', 82),

-- Valentine (14/2)
('Hộp socola Lindor 75 viên', 'Combo socola Thuỵ Sĩ đủ vị classic', 'valentine', ARRAY['valentine'], 350000, 700000, ARRAY['office-worker'], '🍫', 91),
('Bó hoa giấy 99 bông pastel', 'Bó hoa giấy thủ công, không héo, lưu vĩnh viễn', 'valentine', ARRAY['valentine'], 200000, 500000, ARRAY['student'], '💐', 84),
('Voucher spa couple 90 phút', 'Massage thư giãn 2 người tại spa Hà Nội/HCM', 'valentine', ARRAY['valentine', 'anniversary'], 800000, 2000000, ARRAY['office-worker'], '💆', 78),
('Set nến thơm aromatherapy', 'Combo 3 nến soy wax mùi vanilla/sakura/cedar', 'valentine', ARRAY['valentine', 'random'], 150000, 400000, ARRAY['student', 'office-worker'], '🕯️', 86),

-- 8/3 (International Women''s Day)
('Mỹ phẩm Innisfree set 5 món', 'Bộ skincare cơ bản: cleanser/toner/serum/cream/mask', 'random', ARRAY['8-3', '20-10'], 600000, 1200000, ARRAY['office-worker'], '🧴', 80),
('Hoa hồng tươi 21 bông Ecuador', 'Hoa nhập, vòng đời 7-10 ngày, kèm thiệp', 'random', ARRAY['8-3', '20-10', 'valentine'], 400000, 800000, ARRAY['office-worker'], '🌷', 79),

-- 20/10 (Vietnam Women''s Day)
('Khăn lụa Tằm tơ Hà Nội', 'Khăn 100% silk in hoạ tiết hoa sen', 'random', ARRAY['20-10', '8-3'], 350000, 800000, ARRAY['office-worker'], '🧣', 72),

-- Long-distance specific
('Vòng tay nhịp tim đôi', 'Cặp vòng tay đeo cảm biến rung khi đối phương chạm', 'ky-niem', ARRAY['long-distance', 'anniversary'], 1500000, 3000000, ARRAY['long-distance'], '💞', 83),
('Voucher Grab/Be 500k', 'Gửi qua app, dùng đi gặp nhau ngày retrun', 'random', ARRAY['long-distance', 'random'], 500000, 1000000, ARRAY['long-distance'], '🚗', 70),
('Hộp đồ ăn vặt quê 1.5kg', 'Combo bánh đặc sản, mứt, hạt — share-pack 2 người', 'random', ARRAY['long-distance', 'random'], 200000, 400000, ARRAY['long-distance', 'student'], '🍪', 76),

-- Random / Spontaneous
('Sách "Tuesdays with Morrie"', 'Sách dịch best-seller về tình thân và giá trị sống', 'random', ARRAY['random'], 80000, 150000, ARRAY['student', 'office-worker'], '📖', 65),
('Bộ Lego mini Bonsai 878 mảnh', 'Lego trang trí bàn làm việc, lắp 2-3 giờ', 'random', ARRAY['random', 'birthday'], 800000, 1200000, ARRAY['office-worker'], '🪴', 81),
('Bàn phím cơ Akko hồng', 'Keyboard 75% switch nâu, đèn RGB — hợp office Gen Z', 'random', ARRAY['random', 'birthday'], 1500000, 2500000, ARRAY['office-worker'], '⌨️', 73),
('Áo hoodie couple oversize', 'Hoodie 2 màu kèm in tên/biểu tượng cá nhân', 'random', ARRAY['anniversary', 'random'], 350000, 700000, ARRAY['student'], '🧥', 85),
('Bộ trà sữa Phúc Long quà tặng', 'Hộp trà loose-leaf + ấm + cốc gỗ', 'random', ARRAY['random'], 250000, 500000, ARRAY['student', 'office-worker'], '🍵', 68),
('Khoá học online Skillshare 1 năm', 'Gift card subscription truy cập 20k+ khoá', 'random', ARRAY['birthday', 'random'], 800000, 1500000, ARRAY['office-worker'], '🎓', 71),
('Túi tote canvas vẽ tay', 'Túi vải custom vẽ minh hoạ theo yêu cầu', 'random', ARRAY['random', 'birthday'], 150000, 300000, ARRAY['student'], '👜', 77),
('Camera in liền Fujifilm Mini 12', 'Polaroid camera mới — chụp + in tức thì', 'random', ARRAY['anniversary', 'birthday'], 1500000, 2200000, ARRAY['student', 'office-worker'], '📷', 93),
('Sét nail gel + đèn UV mini', 'Bộ sơn móng tự làm tại nhà, 5 màu pastel', 'random', ARRAY['8-3', 'random'], 250000, 500000, ARRAY['student'], '💅', 69),
('Đồng hồ casio LA-680 retro', 'Đồng hồ vintage 80s, mặt vuông gold/silver', 'random', ARRAY['birthday', 'random'], 600000, 900000, ARRAY['student', 'office-worker'], '⌚', 74)
ON CONFLICT DO NOTHING;
