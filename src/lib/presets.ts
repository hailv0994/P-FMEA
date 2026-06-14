/**
 * Bối cảnh công ty & các quy trình mẫu của PRO2 — Astemo Hà Nội (VNHN).
 * Dùng cho: (1) prompt Gemini để AI bám sát sản phẩm thực tế;
 * (2) nút "mẫu nhanh" nạp quy trình sản phẩm vào ô nhập.
 */

export const COMPANY_CONTEXT = `Bối cảnh nhà máy: Công ty TNHH Astemo Hà Nội (VNHN) — sản xuất GIẢM XÓC trước/sau
cho xe máy xăng và xe máy điện. Nhóm PRO2 (Production Engineering) phụ trách:
- Fork Pipe: Tiện → khoan lỗ thoát dầu → mài → mạ Ni-Cr cứng → đánh bóng.
- Rod: Tiện → cán ren → mạ Ni-Cr cứng hoặc Cr trang trí → đánh bóng.
- Damper Case Comp: Hàn (spot / project / condenser / seam / MAG).
Các hỏng hóc quan trọng trong lĩnh vực này thường liên quan tới: rò/chảy dầu,
độ bền & độ kín mối hàn, độ bền mỏi của trục, mòn phớt, kích thước/độ đồng tâm/độ nhám
bề mặt trượt, chiều dày & độ bám dính lớp mạ, dung sai ren.
Hãy đề xuất các dạng hỏng hóc, nguyên nhân, kiểm soát và biện pháp BÁM SÁT sản phẩm và
quy trình trên; KHÔNG đưa nội dung chung chung không liên quan tới giảm xóc xe máy.`;

export interface ProductPreset {
  id: string;
  label: string;
  projectName: string;
  steps: string;
}

export const PRODUCT_PRESETS: ProductPreset[] = [
  {
    id: "fork-pipe",
    label: "Fork Pipe",
    projectName: "Fork Pipe",
    steps: [
      "Tiện Fork Pipe",
      "Khoan lỗ thoát dầu",
      "Mài bề mặt trượt",
      "Mạ Ni-Cr cứng",
      "Đánh bóng",
    ].join("\n"),
  },
  {
    id: "rod",
    label: "Rod",
    projectName: "Rod",
    steps: [
      "Tiện Rod",
      "Cán ren",
      "Mạ Ni-Cr cứng / Cr trang trí",
      "Đánh bóng",
    ].join("\n"),
  },
  {
    id: "damper-case",
    label: "Damper Case Comp",
    projectName: "Damper Case Comp",
    steps: [
      "Hàn spot Damper Case",
      "Hàn project",
      "Hàn condenser",
      "Hàn seam",
      "Hàn MAG",
      "Kiểm tra độ bền & độ kín mối hàn",
    ].join("\n"),
  },
];
