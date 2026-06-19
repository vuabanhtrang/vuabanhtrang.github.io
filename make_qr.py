# -*- coding: utf-8 -*-
"""
Tao the QR de ban cho Vua Banh Trang.
Moi ban 1 anh PNG: header xanh + chip "BAN N" vang + QR (logo giua) + huong dan.
QR tro: https://vuabanhtrang.github.io?ban=N  -> khach quet la ra menu dat mon.

Dung: python make_qr.py 1            # tao ban 1
      python make_qr.py 1 20         # tao ban 1..20
"""
import sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
import segno, hmac, hashlib
from PIL import Image, ImageDraw, ImageFont

BASE_URL = "https://vuabanhtrang.github.io"
OUT_DIR  = os.path.join(os.path.dirname(os.path.abspath(__file__)), "qr-ban")
LOGO     = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vbt-logo-full.png")

# Secret để sinh KEY bí mật của QR (HMAC) — đọc từ biến môi trường, KHÔNG hardcode/commit.
# Phải GIỐNG secret cấu hình ở server (.env: TableToken__Secret). Thiếu -> QR không có key.
TABLE_SECRET = os.environ.get("TABLE_SECRET", "").strip()

def table_key(ban):
    """Key của 1 bàn = HMAC-SHA256(secret, 'ban:N')[:8] hex thường — khớp TableTokenService C#."""
    if not TABLE_SECRET:
        return None
    return hmac.new(TABLE_SECRET.encode(), f"ban:{ban}".encode(), hashlib.sha256).hexdigest()[:8]

# Mau (khop trang khach)
GREEN      = (46, 125, 50)
GREEN_DARK = (27, 94, 32)
YELLOW     = (253, 216, 53)
CREAM      = (255, 253, 245)
TEXT       = (43, 43, 43)
WHITE      = (255, 255, 255)

# Kich thuoc the (px) — ti le ~ the de ban dung, in net o 300dpi
W, H = 760, 1120

def load_font(size, bold=False):
    # Thu cac font Windows pho bien co dau tieng Viet
    candidates = [
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()

def rounded(draw, box, radius, fill):
    draw.rounded_rectangle(box, radius=radius, fill=fill)

def center_text(draw, cx, y, text, font, fill):
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    draw.text((cx - w / 2, y), text, font=font, fill=fill)
    return bbox[3] - bbox[1]

def make_card(ban):
    key = table_key(ban)
    url = f"{BASE_URL}?ban={ban}&k={key}" if key else f"{BASE_URL}?ban={ban}"

    # 1) QR (error correction H de chiu duoc logo giua)
    qr = segno.make(url, error="h")
    qr_png = io.BytesIO()
    qr.save(qr_png, kind="png", scale=20, border=2, dark="#1b5e20", light="#ffffff")
    qr_png.seek(0)
    qr_img = Image.open(qr_png).convert("RGBA")
    QR = 460
    qr_img = qr_img.resize((QR, QR), Image.NEAREST)

    # Logo nho o tam QR (tren nen trang bo tron)
    if os.path.exists(LOGO):
        logo = Image.open(LOGO).convert("RGBA")
        lsize = int(QR * 0.22)
        logo.thumbnail((lsize, lsize), Image.LANCZOS)
        pad = 10
        bg = Image.new("RGBA", (logo.width + pad*2, logo.height + pad*2), WHITE + (255,))
        m = Image.new("L", bg.size, 0)
        ImageDraw.Draw(m).rounded_rectangle([0, 0, bg.width, bg.height], radius=14, fill=255)
        bg.putalpha(m)
        bg.paste(logo, (pad, pad), logo)
        qr_img.paste(bg, ((QR - bg.width)//2, (QR - bg.height)//2), bg)

    # 2) The nen
    card = Image.new("RGB", (W, H), CREAM)
    d = ImageDraw.Draw(card)

    # Header xanh bo goc tren
    rounded(d, [0, 0, W, 230], 0, GREEN)
    d.rectangle([0, 180, W, 230], fill=GREEN)  # vat phang day header
    f_brand = load_font(58, bold=True)
    f_sub   = load_font(28, bold=False)
    center_text(d, W/2, 56, "VUA BÁNH TRÁNG", f_brand, WHITE)
    center_text(d, W/2, 132, "Đặc sản bánh tráng Tây Ninh", f_sub, (220, 240, 220))

    # Chip BAN N (vang) noi giua header & QR
    chip_w, chip_h = 240, 96
    cx0 = (W - chip_w)//2
    cy0 = 230 - chip_h//2
    rounded(d, [cx0, cy0, cx0+chip_w, cy0+chip_h], 24, YELLOW)
    f_banlb = load_font(26, bold=True)
    f_bannum= load_font(54, bold=True)
    center_text(d, W/2, cy0+10, "BÀN", f_banlb, GREEN_DARK)
    center_text(d, W/2, cy0+38, str(ban), f_bannum, GREEN_DARK)

    # Khung trang chua QR
    qx = (W - QR)//2
    qy = 360
    rounded(d, [qx-26, qy-26, qx+QR+26, qy+QR+26], 28, WHITE)
    card.paste(qr_img, (qx, qy), qr_img)

    # Huong dan duoi QR
    f_h1 = load_font(40, bold=True)
    f_h2 = load_font(30, bold=False)
    y = qy + QR + 56
    center_text(d, W/2, y, "Quét mã để xem MENU", f_h1, GREEN_DARK)
    center_text(d, W/2, y+54, "& tự đặt món tại bàn", f_h1, GREEN_DARK)
    center_text(d, W/2, y+122, "Mở camera điện thoại để quét", f_h2, TEXT)
    center_text(d, W/2, y+160, "— Không cần tải app —", f_h2, (110,110,110))

    out = os.path.join(OUT_DIR, f"qr-ban-{ban}.png")
    os.makedirs(OUT_DIR, exist_ok=True)
    card.save(out, "PNG")
    print(f"  ✓ Bàn {ban}: {url}\n     -> {out}")
    return out

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Dung: python make_qr.py <ban_dau> [ban_cuoi]")
        sys.exit(1)
    start = int(sys.argv[1])
    end = int(sys.argv[2]) if len(sys.argv) > 2 else start
    print(f"Tao QR ban {start}..{end}")
    for n in range(start, end+1):
        make_card(n)
    print("XONG.")
