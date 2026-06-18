/* ============================================================
   VUA BÁNH TRÁNG - MENU  (JavaScript thuần, không framework)
   Nhiệm vụ:
   1) Đọc số bàn từ URL (?ban=5)
   2) Tải dữ liệu từ menu-data.js
   3) Vẽ danh mục + danh sách món
   4) Lọc theo danh mục + tìm kiếm theo tên
   5) Xử lý các trạng thái: loading / lỗi / không tìm thấy
   6) Nút gọi quán / Zalo / gọi nhân viên
   ============================================================ */

/* ---- Lưu dữ liệu sau khi tải, để lọc/tìm không cần tải lại ---- */
let DATA = null;            // toàn bộ nội dung menu-data.js
let activeCategory = "all"; // danh mục đang chọn ("all" = tất cả)
let keyword = "";           // từ khóa tìm kiếm

/* ---- Lấy nhanh phần tử HTML theo id ---- */
const $ = (id) => document.getElementById(id);

/* ============================================================
   1) HÀM TIỆN ÍCH
   ============================================================ */

/* Định dạng tiền Việt: 50000 -> "50.000đ" */
function formatPrice(value) {
  // toLocaleString("vi-VN") tự thêm dấu chấm ngăn cách hàng nghìn
  return Number(value).toLocaleString("vi-VN") + "đ";
}

/* Hiển thị giá 1 món: có giaMax -> dạng khoảng "50.000đ – 70.000đ" */
function priceText(m) {
  const base = formatPrice(m.gia);
  if (m.giaMax && Number(m.giaMax) > Number(m.gia)) {
    return base + " – " + formatPrice(m.giaMax);
  }
  return base;
}

/* Bỏ dấu tiếng Việt + chuyển thường -> để tìm kiếm "ga" ra "gà".
   Giúp khách gõ không dấu vẫn tìm được món. */
function normalize(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")                     // tách chữ và dấu
    .replace(/[̀-ͯ]/g, "")      // xóa dấu thanh (combining marks)
    .replace(/đ/g, "d")                   // đ -> d
    .replace(/Đ/g, "d");                  // Đ -> d
}

/* Chống XSS: KHÔNG bao giờ nhét text của dữ liệu thẳng vào innerHTML.
   Hàm này tạo text an toàn (trình duyệt tự escape). */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text == null ? "" : String(text);
  return div.innerHTML;
}

/* Đọc tham số trên URL, ví dụ ?ban=5 -> "5" */
function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/* ============================================================
   2) SỐ BÀN (từ URL ?ban=...)
   ============================================================ */
function setupTableNumber() {
  const ban = getQueryParam("ban");
  // Chỉ chấp nhận số 1-3 chữ số để tránh nội dung lạ trên URL
  if (ban && /^\d{1,3}$/.test(ban)) {
    $("banNumber").textContent = ban;
    $("banLabel").hidden = false;
    document.title = "Bàn " + ban + " - Vua Bánh Tráng";
  }
}

/* ============================================================
   3) TẢI DỮ LIỆU MÓN (từ file menu-data.js)
   menu-data.js được nạp qua thẻ <script> trong index.html và
   gán dữ liệu vào window.MENU_DATA. Cách này chạy được CẢ KHI
   nhấp đúp mở file trên máy (không bị trình duyệt chặn như fetch),
   VÀ chạy tốt trên GitHub Pages.
   ============================================================ */
function loadMenu() {
  showState("loading");
  try {
    // Kiểm tra dữ liệu đã được menu-data.js nạp chưa
    if (!window.MENU_DATA || !Array.isArray(window.MENU_DATA.monAn)) {
      throw new Error("Thiếu hoặc sai dữ liệu trong menu-data.js");
    }
    DATA = window.MENU_DATA;

    applyShopInfo();    // điền tên quán, SĐT, Zalo
    renderCategories(); // vẽ thanh danh mục
    render();           // vẽ danh sách món
    showState("done");
  } catch (err) {
    // Sai cú pháp trong menu-data.js -> hiện trạng thái lỗi, KHÔNG để trắng trang
    console.error("Lỗi đọc menu:", err);
    showState("error");
  }
}

/* Điền thông tin quán vào header và các nút liên hệ */
function applyShopInfo() {
  const quan = DATA.quan || {};
  // Phụ đề dưới tên quán: có thì hiện, để trống ("") thì ẩn luôn (không chừa chỗ)
  const sub = $("quanMoTa");
  if (quan.moTa) {
    sub.textContent = quan.moTa;
    sub.hidden = false;
  } else {
    sub.hidden = true;
  }

  // Nút gọi điện
  if (quan.soDienThoai) {
    $("callBtn").href = "tel:" + quan.soDienThoai;
  }
  // Nút Zalo (mở app Zalo / zalo.me)
  if (quan.zalo) {
    $("zaloBtn").href = "https://zalo.me/" + quan.zalo;
  }

  // Footer: địa chỉ + hotline (chỉ hiện nếu có dữ liệu)
  const footer = $("siteFooter");
  let hasFooter = false;
  if (quan.diaChi) {
    $("footerAddr").innerHTML = "📍 " + escapeHtml(quan.diaChi);
    hasFooter = true;
  }
  if (quan.soDienThoai) {
    // Bấm số gọi luôn trên điện thoại; hiển thị có dấu chấm cho dễ đọc
    const sdtHienThi = String(quan.soDienThoai).replace(/(\d{4})(\d{3})(\d{3})$/, "$1.$2.$3");
    $("footerPhone").innerHTML =
      '📞 Hotline: <a href="tel:' + escapeHtml(quan.soDienThoai) + '">' + escapeHtml(sdtHienThi) + "</a>";
    hasFooter = true;
  }
  if (hasFooter) footer.hidden = false;
}

/* ============================================================
   4) VẼ THANH DANH MỤC
   ============================================================ */
function renderCategories() {
  const wrap = $("categories");
  const list = DATA.danhMuc || [];

  // Nút "Tất cả" luôn đứng đầu
  let html = `<button type="button" class="chip chip--active" data-cat="all">Tất cả</button>`;
  list.forEach((dm) => {
    html += `<button type="button" class="chip" data-cat="${escapeHtml(dm.id)}">${escapeHtml(dm.ten)}</button>`;
  });
  wrap.innerHTML = html;

  // Gắn sự kiện click cho từng nút danh mục
  wrap.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      // Đổi nút đang chọn
      wrap.querySelectorAll(".chip").forEach((b) => b.classList.remove("chip--active"));
      btn.classList.add("chip--active");
      render();
      // Cuộn lên đầu để user thấy kết quả lọc từ trên xuống (tránh bị "lạc" giữa trang)
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Cuộn chip đang chọn vào GIỮA thanh (trên mobile thanh cuộn ngang -> chip không bị che ở mép)
      const target = btn.offsetLeft - (wrap.clientWidth - btn.offsetWidth) / 2;
      wrap.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
    });
  });
}

/* ============================================================
   5) VẼ DANH SÁCH MÓN (có lọc danh mục + tìm kiếm)
   ============================================================ */
function render() {
  const monAn = DATA.monAn || [];
  const kw = normalize(keyword);

  // Lọc theo danh mục đang chọn
  let items = monAn.filter((m) => activeCategory === "all" || m.danhMuc === activeCategory);

  // Lọc theo từ khóa (tìm trong tên + mô tả, không phân biệt dấu)
  if (kw) {
    items = items.filter(
      (m) => normalize(m.ten).includes(kw) || normalize(m.moTa).includes(kw)
    );
  }

  const menuEl = $("menuList");

  // Không có món phù hợp -> hiện thông báo
  if (items.length === 0) {
    menuEl.innerHTML = "";
    $("emptyState").hidden = false;
    return;
  }
  $("emptyState").hidden = true;

  // Nhóm món theo danh mục để có tiêu đề từng nhóm.
  // Khi đang tìm kiếm hoặc đã chọn 1 danh mục thì hiển thị phẳng cho gọn.
  const showGroups = activeCategory === "all" && !kw;

  if (showGroups) {
    let html = "";
    DATA.danhMuc.forEach((dm) => {
      const group = items.filter((m) => m.danhMuc === dm.id);
      if (group.length === 0) return;
      html += `<h2 class="group__title" id="${escapeHtml(dm.id)}">${escapeHtml(dm.ten)}</h2>`;
      html += `<div class="menu menu--grid">` + group.map(dishHTML).join("") + `</div>`;
    });
    menuEl.className = "menu";
    menuEl.innerHTML = html;
  } else {
    menuEl.className = "menu menu--grid";
    menuEl.innerHTML = items.map(dishHTML).join("");
  }

  // Sau khi vẽ xong, gắn xử lý ảnh lỗi (fallback)
  attachImageFallback();
}

/* Tạo HTML cho 1 thẻ món. Mọi dữ liệu đều qua escapeHtml -> an toàn XSS. */
function dishHTML(m) {
  const badge = m.noiBat ? `<span class="dish__badge">⭐ Nổi bật</span>` : "";
  // Biệt danh hoàng gia (Hoàng Cung, Nhà Vua...) -> nhãn vàng nhỏ
  const biet = m.biet ? `<span class="dish__biet">👑 ${escapeHtml(m.biet)}</span>` : "";
  const anh = escapeHtml(m.anh || "");
  return `
    <article class="dish">
      ${badge}
      <div class="dish__img-wrap">
        <img class="dish__img" src="${anh}" alt="${escapeHtml(m.ten)}" loading="lazy" data-name="${escapeHtml(m.ten)}" />
      </div>
      <div class="dish__body">
        <h3 class="dish__name">${escapeHtml(m.ten)} ${biet}</h3>
        <p class="dish__desc">${escapeHtml(m.moTa)}</p>
        <div class="dish__price">${priceText(m)}</div>
      </div>
    </article>`;
}

/* Nếu ảnh không tải được (chưa có file trong images/) -> hiện icon thay thế,
   tránh hình vỡ xấu xí. */
function attachImageFallback() {
  document.querySelectorAll(".dish__img").forEach((img) => {
    const showFallback = () => {
      // tránh gọi lại nhiều lần
      if (img.dataset.fallbackDone) return;
      img.dataset.fallbackDone = "1";
      img.parentElement.innerHTML = '<div class="dish__img dish__img--fallback">🍽️</div>';
    };
    img.addEventListener("error", showFallback);
    // Nếu ảnh đã lỗi TRƯỚC khi kịp gắn listener (file:// tải rất nhanh) -> xử lý ngay
    if (img.complete && img.naturalWidth === 0) showFallback();
  });
}

/* ============================================================
   6) QUẢN LÝ TRẠNG THÁI HIỂN THỊ
   ============================================================ */
function showState(state) {
  $("loadingState").hidden = state !== "loading";
  $("errorState").hidden = state !== "error";
  // emptyState do hàm render() tự quản lý
  if (state !== "done") $("emptyState").hidden = true;
  $("menuList").hidden = state !== "done";
}

/* ============================================================
   7) TÌM KIẾM
   ============================================================ */
function setupSearch() {
  const input = $("searchInput");
  const clearBtn = $("searchClear");

  input.addEventListener("input", () => {
    keyword = input.value.trim();
    clearBtn.hidden = keyword.length === 0;
    render();
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    keyword = "";
    clearBtn.hidden = true;
    input.focus();
    render();
  });
}

/* ============================================================
   8) NÚT "GỌI NHÂN VIÊN" -> hiện toast
   ============================================================ */
function setupStaffButton() {
  const toast = $("toast");
  let timer = null;

  $("staffBtn").addEventListener("click", () => {
    const ban = getQueryParam("ban");
    toast.textContent = ban
      ? `🔔 Đã báo nhân viên tới bàn ${ban}!`
      : "🔔 Đã báo nhân viên, vui lòng chờ!";
    toast.hidden = false;
    // ép trình duyệt vẽ lại để hiệu ứng chạy
    requestAnimationFrame(() => toast.classList.add("toast--show"));

    clearTimeout(timer);
    timer = setTimeout(() => {
      toast.classList.remove("toast--show");
      setTimeout(() => (toast.hidden = true), 250);
    }, 2500);
  });
}

/* ============================================================
   9) XEM ẢNH MENU GỐC (lightbox)
   ============================================================ */
function setupLightbox() {
  const box = $("lightbox");
  const open = () => { box.hidden = false; document.body.style.overflow = "hidden"; };
  const close = () => { box.hidden = true; document.body.style.overflow = ""; };

  $("viewOriginalBtn").addEventListener("click", open);
  $("lightboxClose").addEventListener("click", close);
  // Bấm vào nền đen (ngoài ảnh) cũng đóng
  box.addEventListener("click", (e) => { if (e.target === box) close(); });
  // Phím Esc để đóng (trên máy tính)
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

/* ============================================================
   KHỞI ĐỘNG
   ============================================================ */
function init() {
  setupTableNumber();
  setupSearch();
  setupStaffButton();
  setupLightbox();
  $("retryBtn").addEventListener("click", loadMenu); // nút "Tải lại" khi lỗi
  loadMenu();
}

// Chạy init sau khi HTML đã sẵn sàng
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
