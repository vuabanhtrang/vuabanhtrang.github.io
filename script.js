/* ============================================================
   VUA BÁNH TRÁNG - MENU + ĐẶT MÓN  (JavaScript thuần, không framework)
   Nhiệm vụ:
   1) Đọc số bàn từ URL (?ban=5)
   2) Tải MENU ĐỘNG từ API POS (GET /api/public/menu) — KHÔNG dùng menu-data.js
      vì đơn cần đúng ProductId (Guid) của POS để nhân viên xác nhận.
   3) Vẽ danh mục + danh sách món (mỗi món có nút +/- thêm vào giỏ)
   4) Lọc theo danh mục + tìm kiếm theo tên
   5) Giỏ hàng nổi dưới màn hình → mở giỏ → "Gửi đơn" → POST /api/public/orders
   6) Trạng thái: loading / lỗi / không tìm thấy / gửi đơn
   7) Nút gọi quán / Zalo / gọi nhân viên
   ============================================================ */

/* ====== CẤU HÌNH ====== */
/* API POS công khai. Trang khách ở github.io gọi cross-origin tới domain quán
   (server đã whitelist origin github.io trong CORS). */
const API_BASE = "https://vuabanhtrang.shop";

/* ---- State ---- */
let DATA = null;            // { quan, danhMuc[], monAn[] } — đã map từ API về shape cũ
let activeCategory = "all";
let keyword = "";
let cart = {};             // { productId: { id, ten, gia, anh, qty } }
let tableNumber = null;    // số bàn từ ?ban=
let sending = false;       // chống double-submit khi gửi đơn

const $ = (id) => document.getElementById(id);

/* ============================================================
   1) HÀM TIỆN ÍCH
   ============================================================ */
function formatPrice(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text == null ? "" : String(text);
  return div.innerHTML;
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/* ============================================================
   2) SỐ BÀN (từ URL ?ban=...)
   ============================================================ */
function setupTableNumber() {
  const ban = getQueryParam("ban");
  if (ban && /^\d{1,4}$/.test(ban)) {
    tableNumber = parseInt(ban, 10);
    $("banNumber").textContent = ban;
    $("banLabel").hidden = false;
    document.title = "Bàn " + ban + " - Vua Bánh Tráng";
  }
}

/* ============================================================
   3) TẢI MENU ĐỘNG TỪ API POS
   Response: { categories:[{id,name,sortOrder}], items:[{id,name,price,imageUrl,categoryId,categoryName}] }
   → map về shape cũ { danhMuc:[{id,ten}], monAn:[{id,ten,gia,anh,danhMuc}] } để tái dùng render().
   ============================================================ */
async function loadMenu() {
  showState("loading");
  try {
    const res = await fetch(API_BASE + "/api/public/menu", {
      headers: { "Accept": "application/json" }
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const api = await res.json();

    DATA = {
      quan: {
        ten: "Vua Bánh Tráng",
        soDienThoai: "0978035530",
        zalo: "0978035530",
        diaChi: "224 Phan Đăng Lưu, Kiến An"
      },
      // Danh mục: chỉ giữ danh mục CÓ món (tránh tab rỗng)
      danhMuc: (api.categories || []).map((c) => ({ id: c.id, ten: c.name })),
      monAn: (api.items || []).map((it) => ({
        id: it.id,                    // GUID thật của POS — gửi lên khi đặt
        ten: it.name,
        moTa: "",                     // API công khai không trả mô tả
        gia: it.price,
        anh: it.imageUrl || "",
        danhMuc: it.categoryId,
        noiBat: false,
        biet: ""
      }))
    };

    // Bỏ danh mục không có món nào
    const catsWithItems = new Set(DATA.monAn.map((m) => m.danhMuc));
    DATA.danhMuc = DATA.danhMuc.filter((dm) => catsWithItems.has(dm.id));

    if (DATA.monAn.length === 0) throw new Error("Menu trống");

    applyShopInfo();
    renderCategories();
    render();
    renderCartBar();
    showState("done");
  } catch (err) {
    console.error("Lỗi tải menu:", err);
    showState("error");
  }
}

function applyShopInfo() {
  const quan = DATA.quan || {};
  const sub = $("quanMoTa");
  if (quan.moTa) { sub.textContent = quan.moTa; sub.hidden = false; }
  else { sub.hidden = true; }

  if (quan.soDienThoai) $("callBtn").href = "tel:" + quan.soDienThoai;
  if (quan.zalo) $("zaloBtn").href = "https://zalo.me/" + quan.zalo;

  const footer = $("siteFooter");
  let hasFooter = false;
  if (quan.diaChi) {
    $("footerAddr").innerHTML = "📍 " + escapeHtml(quan.diaChi);
    hasFooter = true;
  }
  if (quan.soDienThoai) {
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

  let html = `<button type="button" class="chip chip--active" data-cat="all">Tất cả</button>`;
  list.forEach((dm) => {
    html += `<button type="button" class="chip" data-cat="${escapeHtml(dm.id)}">${escapeHtml(dm.ten)}</button>`;
  });
  wrap.innerHTML = html;

  wrap.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      wrap.querySelectorAll(".chip").forEach((b) => b.classList.remove("chip--active"));
      btn.classList.add("chip--active");
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
      const target = btn.offsetLeft - (wrap.clientWidth - btn.offsetWidth) / 2;
      wrap.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
    });
  });
}

/* ============================================================
   5) VẼ DANH SÁCH MÓN
   ============================================================ */
function render() {
  const monAn = DATA.monAn || [];
  const kw = normalize(keyword);

  let items = monAn.filter((m) => activeCategory === "all" || m.danhMuc === activeCategory);
  if (kw) {
    items = items.filter((m) => normalize(m.ten).includes(kw) || normalize(m.moTa).includes(kw));
  }

  const menuEl = $("menuList");

  if (items.length === 0) {
    menuEl.innerHTML = "";
    $("emptyState").hidden = false;
    return;
  }
  $("emptyState").hidden = true;

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

  attachImageFallback();
  attachDishControls();
}

/* Tạo HTML cho 1 thẻ món — kèm nút thêm/+/- (theo trạng thái giỏ). */
function dishHTML(m) {
  const badge = m.noiBat ? `<span class="dish__badge">⭐ Nổi bật</span>` : "";
  const biet = m.biet ? `<span class="dish__biet">👑 ${escapeHtml(m.biet)}</span>` : "";
  const anh = escapeHtml(m.anh || "");
  const desc = m.moTa ? `<p class="dish__desc">${escapeHtml(m.moTa)}</p>` : "";
  return `
    <article class="dish" data-id="${escapeHtml(m.id)}">
      ${badge}
      <div class="dish__img-wrap">
        <img class="dish__img" src="${anh}" alt="${escapeHtml(m.ten)}" loading="lazy" data-name="${escapeHtml(m.ten)}" />
      </div>
      <div class="dish__body">
        <h3 class="dish__name">${escapeHtml(m.ten)} ${biet}</h3>
        ${desc}
        <div class="dish__bottom">
          <div class="dish__price">${formatPrice(m.gia)}</div>
          <div class="dish__cart" data-id="${escapeHtml(m.id)}"></div>
        </div>
      </div>
    </article>`;
}

/* Vẽ cụm điều khiển giỏ trên TỪNG món (nút "Thêm" hoặc "− qty +"). */
function attachDishControls() {
  document.querySelectorAll(".dish__cart").forEach((box) => {
    const id = box.dataset.id;
    renderDishControl(box, id);
  });
}

function renderDishControl(box, id) {
  const qty = cart[id] ? cart[id].qty : 0;
  if (qty <= 0) {
    box.innerHTML = `<button type="button" class="dish__add" aria-label="Thêm vào giỏ">+ Thêm</button>`;
    box.querySelector(".dish__add").addEventListener("click", () => changeQty(id, +1));
  } else {
    box.innerHTML = `
      <div class="qty">
        <button type="button" class="qty__btn qty__minus" aria-label="Bớt">−</button>
        <span class="qty__num">${qty}</span>
        <button type="button" class="qty__btn qty__plus" aria-label="Thêm">+</button>
      </div>`;
    box.querySelector(".qty__minus").addEventListener("click", () => changeQty(id, -1));
    box.querySelector(".qty__plus").addEventListener("click", () => changeQty(id, +1));
  }
}

function attachImageFallback() {
  document.querySelectorAll(".dish__img").forEach((img) => {
    const showFallback = () => {
      if (img.dataset.fallbackDone) return;
      img.dataset.fallbackDone = "1";
      img.parentElement.innerHTML = '<div class="dish__img dish__img--fallback">🍽️</div>';
    };
    img.addEventListener("error", showFallback);
    if (img.complete && img.naturalWidth === 0) showFallback();
  });
}

/* ============================================================
   6) GIỎ HÀNG
   ============================================================ */
function findDish(id) {
  return (DATA.monAn || []).find((m) => m.id === id);
}

function changeQty(id, delta) {
  const dish = findDish(id);
  if (!dish) return;
  const cur = cart[id] ? cart[id].qty : 0;
  const next = Math.max(0, Math.min(99, cur + delta));
  if (next === 0) {
    delete cart[id];
  } else {
    cart[id] = { id: dish.id, ten: dish.ten, gia: dish.gia, anh: dish.anh, qty: next };
  }
  // Cập nhật chỉ cụm control của món này (tránh vẽ lại cả lưới)
  const box = document.querySelector(`.dish__cart[data-id="${cssEscape(id)}"]`);
  if (box) renderDishControl(box, id);
  renderCartBar();
  // Nếu modal giỏ đang mở -> cập nhật luôn
  if (!$("cartModal").hidden) renderCartModal();
}

/* Escape id (GUID) cho querySelector — GUID an toàn nhưng dùng cho chắc */
function cssEscape(s) {
  return (window.CSS && CSS.escape) ? CSS.escape(s) : String(s).replace(/[^a-zA-Z0-9\-]/g, "\\$&");
}

function cartCount() {
  return Object.values(cart).reduce((s, it) => s + it.qty, 0);
}
function cartTotal() {
  return Object.values(cart).reduce((s, it) => s + it.gia * it.qty, 0);
}

/* Thanh giỏ nổi dưới (chỉ hiện khi có món) */
function renderCartBar() {
  const bar = $("cartBar");
  const count = cartCount();
  if (count <= 0) {
    bar.hidden = true;
    document.body.classList.remove("has-cart");
    return;
  }
  bar.hidden = false;
  document.body.classList.add("has-cart");   // chừa chỗ dưới cho thanh giỏ
  $("cartBarCount").textContent = count;
  $("cartBarTotal").textContent = formatPrice(cartTotal());
}

/* Mở/đóng modal giỏ */
function openCart() {
  if (cartCount() <= 0) return;
  renderCartModal();
  $("cartModal").hidden = false;
  document.body.style.overflow = "hidden";
}
function closeCart() {
  $("cartModal").hidden = true;
  document.body.style.overflow = "";
}

function renderCartModal() {
  const list = $("cartItems");
  const items = Object.values(cart);
  if (items.length === 0) { closeCart(); return; }

  list.innerHTML = items.map((it) => `
    <div class="cart-item" data-id="${escapeHtml(it.id)}">
      <div class="cart-item__info">
        <div class="cart-item__name">${escapeHtml(it.ten)}</div>
        <div class="cart-item__price">${formatPrice(it.gia)}</div>
      </div>
      <div class="qty qty--sm">
        <button type="button" class="qty__btn qty__minus" aria-label="Bớt">−</button>
        <span class="qty__num">${it.qty}</span>
        <button type="button" class="qty__btn qty__plus" aria-label="Thêm">+</button>
      </div>
      <div class="cart-item__line">${formatPrice(it.gia * it.qty)}</div>
    </div>
  `).join("");

  list.querySelectorAll(".cart-item").forEach((row) => {
    const id = row.dataset.id;
    row.querySelector(".qty__minus").addEventListener("click", () => changeQty(id, -1));
    row.querySelector(".qty__plus").addEventListener("click", () => changeQty(id, +1));
  });

  $("cartTotal").textContent = formatPrice(cartTotal());
}

/* ============================================================
   7) GỬI ĐƠN → POST /api/public/orders
   ============================================================ */
async function submitOrder() {
  if (sending) return;

  if (cartCount() <= 0) return;

  // Bắt buộc có số bàn (đơn cần biết bàn nào cho nhân viên)
  if (!tableNumber) {
    showSendResult(false, "Thiếu số bàn. Vui lòng quét lại mã QR trên bàn của bạn.");
    return;
  }

  sending = true;
  const btn = $("cartSubmit");
  btn.disabled = true;
  btn.textContent = "Đang gửi...";

  const note = $("cartNote").value.trim();
  const body = {
    tableNumber: tableNumber,
    items: Object.values(cart).map((it) => ({ productId: it.id, quantity: it.qty })),
    note: note || null
  };

  try {
    const res = await fetch(API_BASE + "/api/public/orders?ban=" + encodeURIComponent(tableNumber), {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      cart = {};
      renderCartBar();
      render();              // reset nút +/- trên lưới
      closeCart();
      showSendResult(true, "Đơn của bàn " + tableNumber + " đã gửi! Nhân viên sẽ xác nhận ngay.");
    } else {
      const msg = data && data.message ? data.message : "Không gửi được đơn. Vui lòng thử lại.";
      showSendResult(false, msg);
    }
  } catch (err) {
    console.error("Lỗi gửi đơn:", err);
    showSendResult(false, "Lỗi mạng. Kiểm tra kết nối rồi thử lại.");
  } finally {
    sending = false;
    btn.disabled = false;
    btn.textContent = "Gửi đơn";
  }
}

/* Thông báo kết quả gửi đơn (toast lớn ở giữa) */
function showSendResult(ok, message) {
  const box = $("resultModal");
  $("resultIcon").textContent = ok ? "✅" : "⚠️";
  $("resultMsg").textContent = message;
  box.querySelector(".result__card").className = "result__card " + (ok ? "result__card--ok" : "result__card--err");
  box.hidden = false;
}

/* ============================================================
   8) TRẠNG THÁI HIỂN THỊ
   ============================================================ */
function showState(state) {
  $("loadingState").hidden = state !== "loading";
  $("errorState").hidden = state !== "error";
  if (state !== "done") $("emptyState").hidden = true;
  $("menuList").hidden = state !== "done";
}

/* ============================================================
   9) TÌM KIẾM
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
   10) NÚT "GỌI NHÂN VIÊN"
   ============================================================ */
function setupStaffButton() {
  const toast = $("toast");
  let timer = null;

  $("staffBtn").addEventListener("click", () => {
    const ban = getQueryParam("ban");
    toast.textContent = ban ? `🔔 Đã báo nhân viên tới bàn ${ban}!` : "🔔 Đã báo nhân viên, vui lòng chờ!";
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add("toast--show"));
    clearTimeout(timer);
    timer = setTimeout(() => {
      toast.classList.remove("toast--show");
      setTimeout(() => (toast.hidden = true), 250);
    }, 2500);
  });
}

/* ============================================================
   11) XEM ẢNH MENU GỐC (lightbox)
   ============================================================ */
function setupLightbox() {
  const box = $("lightbox");
  if (!box) return;
  const open = () => { box.hidden = false; document.body.style.overflow = "hidden"; };
  const close = () => { box.hidden = true; document.body.style.overflow = ""; };

  const btn = $("viewOriginalBtn");
  if (btn) btn.addEventListener("click", open);
  const closeBtn = $("lightboxClose");
  if (closeBtn) closeBtn.addEventListener("click", close);
  box.addEventListener("click", (e) => { if (e.target === box) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}

/* ============================================================
   12) GẮN SỰ KIỆN GIỎ HÀNG
   ============================================================ */
function setupCart() {
  $("cartBar").addEventListener("click", openCart);
  $("cartClose").addEventListener("click", closeCart);
  $("cartModal").addEventListener("click", (e) => { if (e.target === $("cartModal")) closeCart(); });
  $("cartSubmit").addEventListener("click", submitOrder);
  $("resultClose").addEventListener("click", () => { $("resultModal").hidden = true; });
}

/* ============================================================
   KHỞI ĐỘNG
   ============================================================ */
function init() {
  setupTableNumber();
  setupSearch();
  setupStaffButton();
  setupLightbox();
  setupCart();
  $("retryBtn").addEventListener("click", loadMenu);
  loadMenu();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
