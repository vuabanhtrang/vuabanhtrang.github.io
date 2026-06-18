# 🍽️ Menu Vua Bánh Tráng (Web tĩnh + QR theo bàn)

Trang menu cho khách **quét mã QR tại bàn → mở web xem menu** (món, ảnh, giá, mô tả).
Không cần đăng nhập, không cần backend, không cần database. Chạy **miễn phí** trên GitHub Pages.

- Chỉ dùng **HTML + CSS + JavaScript thuần**.
- Dữ liệu món nằm trong **`menu-data.js`** — bạn tự sửa món/giá rất dễ.
- Ảnh nằm trong thư mục **`images/`**.
- Thiết kế **mobile-first** (ưu tiên điện thoại), responsive, chữ to dễ đọc.
- ✅ **Nhấp đúp `index.html` là xem được ngay trên máy** (không cần cài gì).

---

## 📁 Cấu trúc thư mục

```
menu-quan/
├── index.html          ← trang chính (khung giao diện)
├── style.css           ← màu sắc, bố cục (tông xanh lá + vàng)
├── script.js           ← xử lý: hiển thị, lọc, tìm kiếm
├── menu-data.js        ← ⭐ DỮ LIỆU MÓN ĂN (bạn sửa file này)
├── vbt-logo-full.png   ← logo quán
├── images/
│   ├── menu-goc.jpg    ← ảnh menu gốc (nút "Xem ảnh menu gốc")
│   └── (ảnh từng món)  ← bạn thêm ảnh riêng cho mỗi món vào đây
└── README.md           ← file hướng dẫn này
```

> 💡 Vì sao dùng `menu-data.js` thay vì `menu.json`?
> Nếu để dữ liệu trong `.json`, khi bạn **nhấp đúp mở file trên máy**, trình duyệt
> (Chrome…) sẽ **chặn không cho đọc** → báo "Không tải được menu". Dùng `menu-data.js`
> nạp qua thẻ `<script>` thì chạy được **cả khi mở trên máy lẫn trên GitHub Pages**.

---

## ✏️ PHẦN 1: Cách THÊM / SỬA MÓN (file `menu-data.js`)

Mở `menu-data.js` bằng Notepad (hoặc VS Code). Bỏ qua phần ghi chú ở đầu,
mỗi món là một khối như sau:

```js
{
  "id": 25,
  "ten": "Trộn me cay",
  "biet": "Công Chúa",
  "moTa": "Bánh tráng trộn sốt me cay, đậu phộng rang.",
  "gia": 28000,
  "danhMuc": "tron",
  "anh": "images/tron-me-cay.jpg",
  "noiBat": false
}
```

**Giải thích từng dòng:**

| Trường | Ý nghĩa | Lưu ý |
|--------|---------|-------|
| `id` | Số thứ tự món | Mỗi món một số **khác nhau** |
| `ten` | Tên món | |
| `biet` | Biệt danh hoàng gia (👑) | Vd "Hoàng Cung", "Nhà Vua". Không có thì để `""` |
| `moTa` | Mô tả ngắn | Nên ngắn gọn 1–2 câu |
| `gia` | Giá tiền | **Chỉ ghi số**, không dấu chấm: `28000` (web tự hiện `28.000đ`) |
| `giaMax` | Giá tối đa (giá khoảng) | Chỉ thêm khi giá là khoảng. Vd `"gia": 50000, "giaMax": 70000` → hiện `50.000đ – 70.000đ` |
| `danhMuc` | Thuộc nhóm nào | Phải trùng `id` trong phần `danhMuc` (xem bên dưới) |
| `anh` | Đường dẫn ảnh | `images/ten-anh.jpg` |
| `noiBat` | Gắn nhãn ⭐ Nổi bật | `true` = có, `false` = không |

> ✅ File `menu-data.js` đã có sẵn **24 món thật** của quán (lấy từ menu PDF).
> Bạn chỉ cần thêm/sửa nếu muốn.

### Cách thêm món mới
1. Copy nguyên một khối `{ ... }` của món có sẵn.
2. Dán vào (nhớ có **dấu phẩy `,`** ngăn cách giữa các món).
3. Sửa nội dung. Đổi `id` thành số mới.
4. Lưu file. Tải lại trang web (F5) là thấy.

### Các nhóm danh mục (gần đầu `menu-data.js`)
```js
"danhMuc": [
  { "id": "tron",        "ten": "Bánh tráng trộn" },
  { "id": "cuon",        "ten": "Bánh tráng cuốn" },
  { "id": "phoi-suong",  "ten": "Phơi sương trộn" },
  { "id": "tre-chan-ga", "ten": "Tré · Chân gà · Gỏi xoài" },
  { "id": "cham",        "ten": "Bánh tráng chấm" },
  { "id": "nuong",       "ten": "Bánh tráng nướng" }
],
```
Muốn thêm nhóm mới (ví dụ "Combo"): thêm một dòng `{ "id": "combo", "ten": "Combo" }`,
rồi món nào thuộc combo thì ghi `"danhMuc": "combo"`.

### ⚠️ Lưu ý quan trọng khi sửa
- Mọi chữ phải nằm trong **dấu nháy kép `"`** (không phải nháy đơn `'`).
- Giữa các món / các dòng phải có **dấu phẩy `,`** — nhưng món / dòng **cuối cùng KHÔNG có phẩy**.
- **Đừng xóa** dòng `window.MENU_DATA = {` ở trên cùng và dấu `};` ở cuối file.
- Nếu web báo "Không tải được menu" sau khi sửa → thường là **sai/thiếu dấu phẩy hoặc dấu nháy**.
  Mở web, nhấn **F12** → tab **Console** sẽ thấy dòng báo lỗi đỏ chỉ ra chỗ sai.

### Sửa thông tin quán (gần đầu file)
```js
"quan": {
  "ten": "Vua Bánh Tráng",
  "moTa": "Đặc sản bánh tráng Tây Ninh - ngon chuẩn vị",
  "soDienThoai": "0900000000",   // ← đổi thành SĐT thật của quán
  "zalo": "0900000000"            // ← đổi thành số Zalo thật
},
```

---

## 🖼️ PHẦN 2: Cách thêm ẢNH MÓN

1. Bỏ ảnh vào thư mục **`images/`**.
2. Tên ảnh phải **khớp** với trường `"anh"` trong `menu-data.js`.
   - menu-data.js: `"anh": "images/banh-trang-me.jpg"`
   - → ảnh đặt tên đúng: `banh-trang-me.jpg` trong `images/`
3. **Tên ảnh không dấu, không khoảng trắng** (dùng gạch ngang). Ví dụ `goi-cuon-tom.jpg`.
4. Nên nén ảnh nhẹ (dưới 200KB) tại **https://tinypng.com** để khách tải nhanh.

> Nếu chưa có ảnh, web vẫn chạy — chỗ thiếu ảnh sẽ hiện biểu tượng 🍽️.

### Tên ảnh cần đặt cho 24 món có sẵn
Để ảnh từng món hiện lên, đặt ảnh vào `images/` đúng tên sau (xem cột `anh` trong `menu-data.js`):
`tron-truyen-thong.jpg`, `tron-bo-den.jpg`, `tron-top-mo-long-dao.jpg`, `tron-kho-dac-biet.jpg`,
`cuon-thap-cam.jpg`, `cuon-bo-den.jpg`, `cuon-trung-long-dao.jpg`, `cuon-me-bo.jpg`,
`deo-vo-top-mo.jpg`, `deo-muoi-toi.jpg`, `deo-bo-den.jpg`, `deo-thap-cam.jpg`,
`tre-tron-binh-dinh.jpg`, `chan-ga-sot-thai.jpg`, `chan-ga-sot-mam.jpg`, `com-chay-cha-bong.jpg`,
`goi-xoai-ngu-sac.jpg`, `goi-xoai-bo-den.jpg`,
`cham-me-trung.jpg`, `cham-muoi-ganh.jpg`, `cham-long-dao-top-mo.jpg`,
`nuong-trung-long-dao.jpg`, `nuong-trung-pho-mai.jpg`, `nuong-thap-cam.jpg`

> 🖼️ **Ảnh menu gốc:** khách bấm nút **"Xem ảnh menu gốc"** ở đầu trang sẽ thấy
> nguyên tấm menu đầy đủ hình của quán (file `images/menu-goc.jpg`).

---

## 👀 PHẦN 3: Xem thử trên máy

Chỉ cần **nhấp đúp vào `index.html`** → web mở bằng trình duyệt và chạy ngay.
Không cần cài Python, Node hay bất cứ phần mềm nào.

> Sau khi sửa `menu-data.js`, quay lại trình duyệt nhấn **F5** để xem thay đổi.

---

## 🚀 PHẦN 4: Đưa web lên GitHub Pages (MIỄN PHÍ)

> Mục tiêu: có một đường link dạng `https://tentaikhoan.github.io/menu-quan/` để gắn vào QR.

### Bước 1 — Tạo tài khoản GitHub
- Vào https://github.com → **Sign up** → tạo tài khoản (miễn phí).

### Bước 2 — Tạo kho chứa code (repository)
1. Bấm dấu **+** góc trên phải → **New repository**.
2. **Repository name**: gõ `menu-quan` (tên này sẽ nằm trong link).
3. Chọn **Public** (bắt buộc để Pages miễn phí hoạt động).
4. Bấm **Create repository**.

### Bước 3 — Tải code lên (cách dễ nhất, không cần cài gì)
1. Trong repo vừa tạo, bấm **uploading an existing file** (hoặc tab **Add file → Upload files**).
2. Kéo–thả **TẤT CẢ** file và thư mục: `index.html`, `style.css`, `script.js`,
   `menu-data.js`, `vbt-logo-full.png`, và **cả thư mục `images/`**.
3. Kéo xuống dưới, bấm **Commit changes**.

### Bước 4 — Bật GitHub Pages
1. Trong repo, vào tab **Settings**.
2. Menu trái chọn **Pages**.
3. Mục **Source** chọn **Deploy from a branch**.
4. Mục **Branch** chọn **main** + thư mục **/ (root)** → bấm **Save**.
5. Đợi 1–2 phút, tải lại trang. GitHub sẽ hiện:
   **"Your site is live at https://tentaikhoan.github.io/menu-quan/"**
6. Đó chính là **LINK MENU** của bạn. Mở thử trên điện thoại.

### Bước 5 — Mỗi lần sửa món sau này
- Vào repo → mở `menu-data.js` → bấm ✏️ (Edit) → sửa → **Commit changes**.
- Đợi ~1 phút, web tự cập nhật.
- Nếu chưa thấy đổi: tăng số `?v=1` thành `?v=2` trong `index.html`
  (3 chỗ: style.css, menu-data.js, script.js) để buộc điện thoại tải bản mới.

---

## 📱 PHẦN 5: Tạo MÃ QR cho từng bàn

Mỗi bàn có một link **khác nhau** nhờ tham số `?ban=` ở cuối link:

| Bàn | Link để tạo QR |
|-----|----------------|
| Bàn 1 | `https://tentaikhoan.github.io/menu-quan/?ban=1` |
| Bàn 2 | `https://tentaikhoan.github.io/menu-quan/?ban=2` |
| Bàn 5 | `https://tentaikhoan.github.io/menu-quan/?ban=5` |

> Khi khách quét, số bàn hiện ở góc phải header, và nút "Gọi nhân viên" báo đúng số bàn.
> Nếu không cần số bàn, chỉ dùng link gốc (bỏ `?ban=...`).

### Cách tạo QR (miễn phí)
1. Vào **https://www.qr-code-generator.com** hoặc **https://qrcode.tec-it.com**.
2. Chọn loại **URL / Website**.
3. Dán link kèm số bàn, ví dụ `https://tentaikhoan.github.io/menu-quan/?ban=5`.
4. Bấm tạo → **Download** ảnh QR (chọn PNG, kích thước lớn để in nét).
5. Lặp lại cho từng bàn (đổi số `?ban=`).
6. In QR ra, ép nhựa/dán lên bàn. Xong!

---

## 🎨 PHẦN 6: Đổi màu giao diện (tùy chọn)

Mở `style.css`, ngay đầu file có phần `:root` chứa các màu. Đổi mã màu ở đây
là đổi toàn bộ giao diện:

```css
--green:      #2e7d32;   /* màu xanh lá chính */
--yellow:     #fdd835;   /* màu vàng điểm nhấn */
--cream:      #fffdf5;   /* màu nền */
```

---

## ❓ Sự cố thường gặp

| Hiện tượng | Cách xử lý |
|-----------|-----------|
| "Không tải được menu" | `menu-data.js` bị sai/thiếu dấu phẩy, nháy, hoặc lỡ xóa `window.MENU_DATA = {` / `};`. Nhấn **F12 → Console** xem dòng báo lỗi đỏ |
| Sửa món rồi web không đổi | Nhấn **F5**; trên GitHub thì đợi 1–2 phút hoặc tăng `?v=1` → `?v=2` trong `index.html` |
| Ảnh không hiện (ra 🍽️) | Tên ảnh trong `images/` chưa khớp với `"anh"` trong menu-data.js (chú ý hoa/thường) |
| Logo không hiện | Kiểm tra `vbt-logo-full.png` đã ở cùng cấp với `index.html` |
| Số bàn không hiện | Link phải có `?ban=` + số, ví dụ `?ban=5` |

---

Chúc quán đông khách! 🥢
