/* ============================================================
   ⭐ DỮ LIỆU MÓN ĂN — VUA BÁNH TRÁNG ⭐
   (Nhập từ menu PDF của quán: 224 Phan Đăng Lưu - Kiến An)
   --------------------------------------------------------
   QUY TẮC SỬA:
   - Giữ nguyên dòng "window.MENU_DATA =" ở trên cùng và dấu ";" ở cuối file.
   - Mọi chữ để trong dấu nháy kép "  ".
   - Giá chỉ ghi số, KHÔNG dấu chấm:  35000  (web tự hiện 35.000đ).
   - Món có giá khoảng (vd 50K–70K): ghi "gia": 50000, "giaMax": 70000.
   - "biet" = biệt danh hoàng gia (Hoàng Cung, Nhà Vua...). Bỏ trống nếu không có.
   - Giữa các món có dấu phẩy ","; món CUỐI CÙNG không cần phẩy.
   ============================================================ */
window.MENU_DATA = {
  "quan": {
    "ten": "Vua Bánh Tráng",
    "moTa": "",
    "soDienThoai": "0978035530",
    "zalo": "0978035530",
    "diaChi": "224 Phan Đăng Lưu, Kiến An"
  },
  "danhMuc": [
    { "id": "tron",        "ten": "Bánh tráng trộn" },
    { "id": "cuon",        "ten": "Bánh tráng cuốn" },
    { "id": "phoi-suong",  "ten": "Phơi sương trộn" },
    { "id": "tre-chan-ga", "ten": "Tré · Chân gà · Gỏi xoài" },
    { "id": "cham",        "ten": "Bánh tráng chấm" },
    { "id": "nuong",       "ten": "Bánh tráng nướng" }
  ],
  "monAn": [

    /* ---------- BÁNH TRÁNG TRỘN ---------- */
    { "id": 1, "ten": "Trộn truyền thống", "biet": "Hoàng Cung",
      "moTa": "Bánh tráng trộn truyền thống đậm đà, đầy đủ topping.",
      "gia": 22000, "danhMuc": "tron", "anh": "images/tron-truyen-thong.jpg", "noiBat": true },
    { "id": 2, "ten": "Trộn bò đen", "biet": "Hoàng Tử",
      "moTa": "Bánh tráng trộn bò đen thơm cay, lạ miệng.",
      "gia": 29000, "danhMuc": "tron", "anh": "images/tron-bo-den.jpg", "noiBat": false },
    { "id": 3, "ten": "Trộn tóp mỡ lòng đào", "biet": "Thái Tử",
      "moTa": "Bánh tráng trộn tóp mỡ giòn, trứng lòng đào béo ngậy.",
      "gia": 35000, "danhMuc": "tron", "anh": "images/tron-top-mo-long-dao.jpg", "noiBat": false },
    { "id": 4, "ten": "Trộn khô đặc biệt", "biet": "Nhà Vua",
      "moTa": "Phiên bản đặc biệt của quán, topping thượng hạng.",
      "gia": 35000, "danhMuc": "tron", "anh": "images/tron-kho-dac-biet.jpg", "noiBat": true },

    /* ---------- BÁNH TRÁNG CUỐN ---------- */
    { "id": 5, "ten": "Cuốn thập cẩm", "biet": "Hoàng Cung",
      "moTa": "Bánh tráng cuốn thập cẩm đầy đủ nhân, chấm sốt đặc trưng.",
      "gia": 25000, "danhMuc": "cuon", "anh": "images/cuon-thap-cam.jpg", "noiBat": true },
    { "id": 6, "ten": "Cuốn bò đen", "biet": "Phò Mã",
      "moTa": "Bánh tráng cuốn bò đen đậm vị, cuốn dẻo.",
      "gia": 29000, "danhMuc": "cuon", "anh": "images/cuon-bo-den.jpg", "noiBat": false },
    { "id": 7, "ten": "Cuốn trứng lòng đào", "biet": "Ái Phi",
      "moTa": "Bánh tráng cuốn trứng lòng đào béo, ăn là mê.",
      "gia": 30000, "danhMuc": "cuon", "anh": "images/cuon-trung-long-dao.jpg", "noiBat": false },
    { "id": 8, "ten": "Cuốn me bơ", "biet": "Lệnh Phi",
      "moTa": "Bánh tráng cuốn sốt me bơ chua ngọt hấp dẫn.",
      "gia": 32000, "danhMuc": "cuon", "anh": "images/cuon-me-bo.jpg", "noiBat": false },

    /* ---------- BÁNH TRÁNG PHƠI SƯƠNG TRỘN ---------- */
    { "id": 9, "ten": "Dẻo vò tóp mỡ", "biet": "Hoàng Hậu",
      "moTa": "Bánh tráng phơi sương dẻo, vò tóp mỡ giòn rụm.",
      "gia": 35000, "danhMuc": "phoi-suong", "anh": "images/deo-vo-top-mo.jpg", "noiBat": true },
    { "id": 10, "ten": "Dẻo muối tỏi", "biet": "Quận Chúa",
      "moTa": "Bánh tráng dẻo trộn muối tỏi thơm nồng.",
      "gia": 29000, "danhMuc": "phoi-suong", "anh": "images/deo-muoi-toi.jpg", "noiBat": false },
    { "id": 11, "ten": "Dẻo bò đen", "biet": "Thái Phi",
      "moTa": "Bánh tráng dẻo bò đen đậm đà, cay nhẹ.",
      "gia": 30000, "danhMuc": "phoi-suong", "anh": "images/deo-bo-den.jpg", "noiBat": false },
    { "id": 12, "ten": "Dẻo thập cẩm", "biet": "Quý Phi",
      "moTa": "Bánh tráng dẻo thập cẩm đầy đủ, hài hòa vị.",
      "gia": 35000, "danhMuc": "phoi-suong", "anh": "images/deo-thap-cam.jpg", "noiBat": false },

    /* ---------- TRÉ TRỘN · CHÂN GÀ · CƠM CHÁY · GỎI XOÀI ---------- */
    { "id": 13, "ten": "Tré trộn Bình Định", "biet": "",
      "moTa": "Tré trộn Bình Định chua giòn, ăn cực bắt mồi.",
      "gia": 75000, "danhMuc": "tre-chan-ga", "anh": "images/tre-tron-binh-dinh.jpg", "noiBat": true },
    { "id": 14, "ten": "Chân gà sốt thái", "biet": "",
      "moTa": "Chân gà rút xương sốt thái chua cay (size tuỳ chọn).",
      "gia": 50000, "giaMax": 70000, "danhMuc": "tre-chan-ga", "anh": "images/chan-ga-sot-thai.jpg", "noiBat": false },
    { "id": 15, "ten": "Chân gà sốt mắm", "biet": "",
      "moTa": "Chân gà sốt mắm đậm đà, thấm vị (size tuỳ chọn).",
      "gia": 50000, "giaMax": 70000, "danhMuc": "tre-chan-ga", "anh": "images/chan-ga-sot-mam.jpg", "noiBat": false },
    { "id": 16, "ten": "Cơm cháy chà bông", "biet": "",
      "moTa": "Cơm cháy giòn rụm phủ chà bông, sốt cay.",
      "gia": 30000, "danhMuc": "tre-chan-ga", "anh": "images/com-chay-cha-bong.jpg", "noiBat": false },
    { "id": 17, "ten": "Gỏi xoài khô ngũ sắc", "biet": "",
      "moTa": "Gỏi xoài xanh trộn khô ngũ sắc, chua cay giòn.",
      "gia": 35000, "danhMuc": "tre-chan-ga", "anh": "images/goi-xoai-ngu-sac.jpg", "noiBat": false },
    { "id": 18, "ten": "Gỏi xoài khô bò đen", "biet": "",
      "moTa": "Gỏi xoài xanh trộn khô bò đen, đậm đà.",
      "gia": 30000, "danhMuc": "tre-chan-ga", "anh": "images/goi-xoai-bo-den.jpg", "noiBat": false },

    /* ---------- BÁNH TRÁNG CHẤM ---------- */
    { "id": 19, "ten": "Chấm me trứng", "biet": "Thái Giám",
      "moTa": "Bánh tráng chấm sốt me trứng chua ngọt.",
      "gia": 25000, "danhMuc": "cham", "anh": "images/cham-me-trung.jpg", "noiBat": false },
    { "id": 20, "ten": "Chấm muối gánh", "biet": "Dung Mama",
      "moTa": "Bánh tráng chấm muối gánh đậm đà, cay nồng.",
      "gia": 25000, "danhMuc": "cham", "anh": "images/cham-muoi-ganh.jpg", "noiBat": false },
    { "id": 21, "ten": "Chấm lòng đào tóp mỡ", "biet": "Hoàng Tỷ",
      "moTa": "Bánh tráng chấm trứng lòng đào, tóp mỡ giòn.",
      "gia": 35000, "danhMuc": "cham", "anh": "images/cham-long-dao-top-mo.jpg", "noiBat": false },

    /* ---------- BÁNH TRÁNG NƯỚNG ---------- */
    { "id": 22, "ten": "Nướng trứng lòng đào", "biet": "",
      "moTa": "Bánh tráng nướng giòn, trứng lòng đào béo.",
      "gia": 30000, "danhMuc": "nuong", "anh": "images/nuong-trung-long-dao.jpg", "noiBat": false },
    { "id": 23, "ten": "Nướng trứng phô mai", "biet": "",
      "moTa": "Bánh tráng nướng trứng phô mai kéo sợi thơm béo.",
      "gia": 30000, "danhMuc": "nuong", "anh": "images/nuong-trung-pho-mai.jpg", "noiBat": false },
    { "id": 24, "ten": "Nướng thập cẩm", "biet": "",
      "moTa": "Bánh tráng nướng thập cẩm đầy đủ topping.",
      "gia": 25000, "danhMuc": "nuong", "anh": "images/nuong-thap-cam.jpg", "noiBat": false }

  ]
};
