import type { Kana, KanaGroup } from "@/types";
import { toKatakana } from "@/lib/romaji";

/**
 * Kana table. Each row: [romaji, hiragana, row label]. Katakana is derived
 * automatically. Stroke counts and Vietnamese memory hints are given for the
 * 46 basic characters of each script.
 */
const BASIC: [string, string, string][] = [
  ["a", "あ", "a"], ["i", "い", "a"], ["u", "う", "a"], ["e", "え", "a"], ["o", "お", "a"],
  ["ka", "か", "k"], ["ki", "き", "k"], ["ku", "く", "k"], ["ke", "け", "k"], ["ko", "こ", "k"],
  ["sa", "さ", "s"], ["shi", "し", "s"], ["su", "す", "s"], ["se", "せ", "s"], ["so", "そ", "s"],
  ["ta", "た", "t"], ["chi", "ち", "t"], ["tsu", "つ", "t"], ["te", "て", "t"], ["to", "と", "t"],
  ["na", "な", "n"], ["ni", "に", "n"], ["nu", "ぬ", "n"], ["ne", "ね", "n"], ["no", "の", "n"],
  ["ha", "は", "h"], ["hi", "ひ", "h"], ["fu", "ふ", "h"], ["he", "へ", "h"], ["ho", "ほ", "h"],
  ["ma", "ま", "m"], ["mi", "み", "m"], ["mu", "む", "m"], ["me", "め", "m"], ["mo", "も", "m"],
  ["ya", "や", "y"], ["yu", "ゆ", "y"], ["yo", "よ", "y"],
  ["ra", "ら", "r"], ["ri", "り", "r"], ["ru", "る", "r"], ["re", "れ", "r"], ["ro", "ろ", "r"],
  ["wa", "わ", "w"], ["wo", "を", "w"], ["n", "ん", "n̄"],
];

const DAKUTEN: [string, string, string][] = [
  ["ga", "が", "g"], ["gi", "ぎ", "g"], ["gu", "ぐ", "g"], ["ge", "げ", "g"], ["go", "ご", "g"],
  ["za", "ざ", "z"], ["ji", "じ", "z"], ["zu", "ず", "z"], ["ze", "ぜ", "z"], ["zo", "ぞ", "z"],
  ["da", "だ", "d"], ["ji", "ぢ", "d"], ["zu", "づ", "d"], ["de", "で", "d"], ["do", "ど", "d"],
  ["ba", "ば", "b"], ["bi", "び", "b"], ["bu", "ぶ", "b"], ["be", "べ", "b"], ["bo", "ぼ", "b"],
  ["pa", "ぱ", "p"], ["pi", "ぴ", "p"], ["pu", "ぷ", "p"], ["pe", "ぺ", "p"], ["po", "ぽ", "p"],
];

const YOON: [string, string, string][] = [
  ["kya", "きゃ", "ky"], ["kyu", "きゅ", "ky"], ["kyo", "きょ", "ky"],
  ["sha", "しゃ", "sh"], ["shu", "しゅ", "sh"], ["sho", "しょ", "sh"],
  ["cha", "ちゃ", "ch"], ["chu", "ちゅ", "ch"], ["cho", "ちょ", "ch"],
  ["nya", "にゃ", "ny"], ["nyu", "にゅ", "ny"], ["nyo", "にょ", "ny"],
  ["hya", "ひゃ", "hy"], ["hyu", "ひゅ", "hy"], ["hyo", "ひょ", "hy"],
  ["mya", "みゃ", "my"], ["myu", "みゅ", "my"], ["myo", "みょ", "my"],
  ["rya", "りゃ", "ry"], ["ryu", "りゅ", "ry"], ["ryo", "りょ", "ry"],
  ["gya", "ぎゃ", "gy"], ["gyu", "ぎゅ", "gy"], ["gyo", "ぎょ", "gy"],
  ["ja", "じゃ", "j"], ["ju", "じゅ", "j"], ["jo", "じょ", "j"],
  ["bya", "びゃ", "by"], ["byu", "びゅ", "by"], ["byo", "びょ", "by"],
  ["pya", "ぴゃ", "py"], ["pyu", "ぴゅ", "py"], ["pyo", "ぴょ", "py"],
];

/** Extended katakana for loanwords (katakana only). */
const EXTENDED: [string, string, string][] = [
  ["fa", "ファ", "f"], ["fi", "フィ", "f"], ["fe", "フェ", "f"], ["fo", "フォ", "f"],
  ["ti", "ティ", "t"], ["di", "ディ", "d"], ["tu", "トゥ", "t"], ["du", "ドゥ", "d"],
  ["wi", "ウィ", "w"], ["we", "ウェ", "w"], ["wo", "ウォ", "w"],
  ["she", "シェ", "sh"], ["je", "ジェ", "j"], ["che", "チェ", "ch"],
  ["va", "ヴァ", "v"], ["vi", "ヴィ", "v"], ["vu", "ヴ", "v"], ["ve", "ヴェ", "v"], ["vo", "ヴォ", "v"],
  ["tsa", "ツァ", "ts"], ["dyu", "デュ", "d"], ["ye", "イェ", "y"],
];

const H_STROKES: Record<string, number> = {
  あ: 3, い: 2, う: 2, え: 2, お: 3, か: 3, き: 4, く: 1, け: 3, こ: 2,
  さ: 3, し: 1, す: 2, せ: 3, そ: 1, た: 4, ち: 2, つ: 1, て: 1, と: 2,
  な: 4, に: 3, ぬ: 2, ね: 2, の: 1, は: 3, ひ: 1, ふ: 4, へ: 1, ほ: 4,
  ま: 3, み: 2, む: 3, め: 2, も: 3, や: 3, ゆ: 2, よ: 2,
  ら: 2, り: 2, る: 1, れ: 2, ろ: 1, わ: 2, を: 3, ん: 1,
};

const K_STROKES: Record<string, number> = {
  ア: 2, イ: 2, ウ: 3, エ: 3, オ: 3, カ: 2, キ: 3, ク: 2, ケ: 3, コ: 2,
  サ: 3, シ: 3, ス: 2, セ: 2, ソ: 2, タ: 3, チ: 3, ツ: 3, テ: 3, ト: 2,
  ナ: 2, ニ: 2, ヌ: 2, ネ: 4, ノ: 1, ハ: 2, ヒ: 2, フ: 1, ヘ: 1, ホ: 4,
  マ: 2, ミ: 3, ム: 2, メ: 2, モ: 3, ヤ: 2, ユ: 2, ヨ: 3,
  ラ: 2, リ: 2, ル: 2, レ: 1, ロ: 3, ワ: 2, ヲ: 3, ン: 2,
};

const H_HINTS: Record<string, string> = {
  あ: "Hình người đang há miệng kêu “Aaa!” khi thấy con cá.",
  い: "Hai cây gậy đứng cạnh nhau như hai con cá chình (eel) — “i”.",
  う: "Người bị đau bụng nằm cong, kêu “U…”.",
  え: "Con chim đang bay theo hình chữ “e” uốn lượn.",
  お: "Chữ あ có thêm dấu phẩy: một người kêu “Ồ!” khi thấy UFO.",
  か: "Con dao cắt (cut) — “ka” — có thêm một nét như giọt máu.",
  き: "Chiếc chìa khóa (key) có hai răng — “ki”.",
  く: "Mỏ chim cúc cu mở ra — “ku”.",
  け: "Cái thùng (keg) bên cạnh một cây gậy — “ke”.",
  こ: "Hai con sâu nằm song song như hai đồng xu (coin) — “ko”.",
  さ: "Giống chữ ち ngược lại; tưởng tượng mặt người đang cười “sa”.",
  し: "Cái lưỡi câu — “shi” — câu cá (she fishes).",
  す: "Sợi mì xoắn vòng — tiếng húp mì “sư-sư”.",
  せ: "Miệng mở rộng nói “say!” — “se”.",
  そ: "Đường zigzag như sợi chỉ khâu (sew) — “so”.",
  た: "Chữ “t” và chữ “a” ghép lại — “ta”.",
  ち: "Số 5 viết ngược, như người cổ vũ “cheer” — “chi”.",
  つ: "Con sóng thần (tsunami) cuộn lại — “tsu”.",
  て: "Bàn tay (te) đang vẫy — “te”.",
  と: "Ngón chân (toe) có cái gai đâm vào — “to”.",
  な: "Người quỳ gối cầu nguyện bên cây thánh giá — “na”.",
  に: "Đầu gối (knee) bên cạnh hai đường kẻ — “ni”.",
  ぬ: "Đũa gắp mì noodle — “nu”.",
  ね: "Con mèo (neko) cuộn đuôi lại — “ne”.",
  の: "Biển báo cấm “No!” hình tròn — “no”.",
  は: "Cười “ha ha” với chữ け có thêm vòng.",
  ひ: "Cái miệng cười “hi hi”.",
  ふ: "Núi Phú Sĩ (Fuji) với mây xung quanh — “fu”.",
  へ: "Ngọn đồi nhỏ như dấu mũ — “he”.",
  ほ: "Chữ は có thêm một gạch — ngôi nhà (home) có ống khói — “ho”.",
  ま: "Mẹ (mama) đang cầm cái nồi — “ma”.",
  み: "Số 21 viết nghiêng — “mi” (me = tôi 21 tuổi).",
  む: "Con bò kêu “moo” — “mu”.",
  め: "Con mắt (me) với tròng mắt — “me”.",
  も: "Lưỡi câu với hai con mồi nữa (more) — “mo”.",
  や: "Con bò Tây Tạng (yak) có sừng — “ya”.",
  ゆ: "Con cá có cái đuôi — “yu” như unicorn (yu-nicorn).",
  よ: "Một yo-yo trên sợi dây — “yo”.",
  ら: "Con thỏ (rabbit) với hai tai — “ra”.",
  り: "Hai cành sậy (reed) bên bờ sông — “ri”.",
  る: "Con đường vòng (route) kết thúc bằng vòng tròn — “ru”.",
  れ: "Người quỳ gối (れ có đuôi cong) — “re”.",
  ろ: "Chữ る không có vòng — con đường (road) — “ro”.",
  わ: "Giống ね nhưng không vòng đuôi — “wa” (wasp).",
  を: "Người chơi lướt sóng “whoa!” — “wo”, thường dùng làm trợ từ “o”.",
  ん: "Giống chữ “n” viết tay — “n”.",
};

const K_HINTS: Record<string, string> = {
  ア: "Cái rìu (axe) — “a”.",
  イ: "Một người (人) đứng nghiêng — “i”.",
  ウ: "Chữ う của hiragana với mái nhà — “u”.",
  エ: "Cái dầm thép chữ I nằm ngang (elevator) — “e”.",
  オ: "Một người đang chơi gôn (golf) vung gậy — “o”.",
  カ: "Giống か nhưng không có dấu phẩy — “ka”.",
  キ: "Giống き nhưng không có vòng dưới — chìa khóa “ki”.",
  ク: "Cái miệng cúc cu (cuckoo) đang mở — “ku”.",
  ケ: "Chữ K nghiêng — “ke”.",
  コ: "Góc vuông như góc tường (corner) — “ko”.",
  サ: "Tấm biển ghi “Sale” trên cột — “sa”.",
  シ: "Khuôn mặt cười với các nét hất lên (she) — “shi”. Các nét chấm nằm ngang.",
  ス: "Người đang trượt tuyết (ski) — “su”.",
  セ: "Giống せ của hiragana — “se”.",
  ソ: "Kim khâu (sew) — “so”. Hai nét gần đứng, khác シ.",
  タ: "Chữ ク có thêm vạch — “ta”.",
  チ: "Bộ râu của người cổ vũ (cheer) — “chi”.",
  ツ: "Sóng thần (tsunami) với các nét đổ xuống — “tsu”. Chấm hướng xuống, khác シ.",
  テ: "Cột ăng-ten tivi (television) — “te”.",
  ト: "Chữ T bị bẻ nghiêng — totem — “to”.",
  ナ: "Cây thánh giá nghiêng — “na”.",
  ニ: "Hai gạch giống ni của hiragana — “ni”.",
  ヌ: "Đôi đũa với sợi mì (noodle) — “nu”.",
  ネ: "Một người đeo cà vạt (necktie) — “ne”.",
  ノ: "Một nét chéo nói “No!” — “no”.",
  ハ: "Hai nét như mái nhà mở “ha” — bản chất là số tám 八.",
  ヒ: "Người ngồi cười “hee” — “hi”.",
  フ: "Giống nửa trên của ふ — “fu”.",
  ヘ: "Giống hệt へ của hiragana — “he”.",
  ホ: "Cây thánh giá có hai nét phụ — hồi giáo (holy) — “ho”.",
  マ: "Cái mũi của mẹ (mama) — “ma”.",
  ミ: "Ba nét như ba ngón tay (mi = 3 trong mitsu) — “mi”.",
  ム: "Con bò (moo) với cái sừng — “mu”.",
  メ: "Dấu X đánh dấu mắt (me) — “me”.",
  モ: "Giống も nhưng không có móc — “mo”.",
  ヤ: "Giống や của hiragana — “ya”.",
  ユ: "Cái chữ U lật (U-turn) — “yu”.",
  ヨ: "Chữ E ngược — “yo”.",
  ラ: "Phần trên của ら — “ra”.",
  リ: "Giống り của hiragana — “ri”.",
  ル: "Hai chân của roo (kangaroo) — “ru”.",
  レ: "Chữ L nghiêng — “re”.",
  ロ: "Hình vuông như miệng (口) — robot — “ro”.",
  ワ: "Ly rượu vang (wine) — “wa”.",
  ヲ: "Chữ ヨ nghiêng với móc — “wo”, hiếm dùng.",
  ン: "Giống ソ nhưng nét dưới nằm ngang hơn — “n”.",
};

function build(rows: [string, string, string][], group: KanaGroup, script: "hiragana" | "katakana"): Kana[] {
  return rows.map(([romaji, hira, row]) => {
    const char = script === "hiragana" ? hira : group === "extended" ? hira : toKatakana(hira);
    const strokes = script === "hiragana" ? H_STROKES[char] : K_STROKES[char];
    const hint = script === "hiragana" ? H_HINTS[char] : K_HINTS[char];
    return {
      id: `${script === "hiragana" ? "h" : "k"}:${char}`,
      script,
      char,
      romaji,
      group,
      row,
      ...(strokes ? { strokes } : {}),
      ...(hint ? { hint } : {}),
    };
  });
}

export const HIRAGANA: Kana[] = [
  ...build(BASIC, "basic", "hiragana"),
  ...build(DAKUTEN, "dakuten", "hiragana"),
  ...build(YOON, "yoon", "hiragana"),
];

export const KATAKANA: Kana[] = [
  ...build(BASIC, "basic", "katakana"),
  ...build(DAKUTEN, "dakuten", "katakana"),
  ...build(YOON, "yoon", "katakana"),
  ...build(EXTENDED, "extended", "katakana"),
];

export const KANA_GROUP_LABEL: Record<KanaGroup, string> = {
  basic: "Âm cơ bản (Gojūon)",
  dakuten: "Âm đục (Dakuten / Handakuten)",
  yoon: "Âm ghép (Yōon)",
  extended: "Âm mở rộng cho từ ngoại lai",
};

/** Lessons: groups of rows taught together. */
export function kanaLessons(script: "hiragana" | "katakana") {
  const list = script === "hiragana" ? HIRAGANA : KATAKANA;
  const lessons: { id: string; title: string; chars: Kana[] }[] = [];
  const basic = list.filter((k) => k.group === "basic");
  const pairs: string[][] = [["a"], ["k"], ["s"], ["t"], ["n"], ["h"], ["m"], ["y", "r"], ["w", "n̄"]];
  pairs.forEach((rows, i) => {
    lessons.push({
      id: `${script}-basic-${i + 1}`,
      title: `Bài ${i + 1}: hàng ${rows.map((r) => (r === "n̄" ? "ん" : r.toUpperCase())).join(" + ")}`,
      chars: basic.filter((k) => rows.includes(k.row)),
    });
  });
  lessons.push({ id: `${script}-dakuten`, title: `Bài ${lessons.length + 1}: âm đục (゛゜)`, chars: list.filter((k) => k.group === "dakuten") });
  lessons.push({ id: `${script}-yoon`, title: `Bài ${lessons.length + 1}: âm ghép (ゃゅょ)`, chars: list.filter((k) => k.group === "yoon") });
  if (script === "katakana")
    lessons.push({ id: `${script}-extended`, title: `Bài ${lessons.length + 1}: âm mở rộng (ファ, ティ…)`, chars: list.filter((k) => k.group === "extended") });
  return lessons;
}

/** Practice words for reading drills, typing practice and the kana stages. */
export const HIRAGANA_WORDS: [string, string][] = [
  ["いぬ", "con chó"], ["ねこ", "con mèo"], ["さかな", "con cá"], ["とり", "con chim"], ["うみ", "biển"],
  ["やま", "núi"], ["かわ", "sông"], ["はな", "hoa / mũi"], ["そら", "bầu trời"], ["あめ", "mưa / kẹo"],
  ["ゆき", "tuyết"], ["くるま", "xe ô tô"], ["つくえ", "cái bàn"], ["いす", "cái ghế"], ["ほん", "sách"],
  ["みず", "nước"], ["おちゃ", "trà"], ["ごはん", "cơm"], ["たまご", "trứng"], ["りんご", "táo"],
  ["きって", "tem thư"], ["がっこう", "trường học"], ["せんせい", "giáo viên"], ["ともだち", "bạn bè"], ["でんしゃ", "tàu điện"],
  ["しゃしん", "ảnh"], ["びょういん", "bệnh viện"], ["きょう", "hôm nay"], ["あした", "ngày mai"], ["ひこうき", "máy bay"],
  ["おかあさん", "mẹ"], ["おとうさん", "bố"], ["ありがとう", "cảm ơn"], ["こんにちは", "xin chào"], ["さようなら", "tạm biệt"],
];

export const KATAKANA_WORDS: [string, string][] = [
  ["コーヒー", "cà phê"], ["テレビ", "tivi"], ["パン", "bánh mì"], ["カメラ", "máy ảnh"], ["ホテル", "khách sạn"],
  ["タクシー", "taxi"], ["バス", "xe buýt"], ["レストラン", "nhà hàng"], ["コンビニ", "cửa hàng tiện lợi"], ["スマホ", "điện thoại thông minh"],
  ["パソコン", "máy tính cá nhân"], ["メール", "email"], ["アイスクリーム", "kem"], ["ジュース", "nước ép"], ["ケーキ", "bánh ngọt"],
  ["ベトナム", "Việt Nam"], ["アメリカ", "Mỹ"], ["フランス", "Pháp"], ["ハノイ", "Hà Nội"], ["ホーチミン", "TP. Hồ Chí Minh"],
  ["シャツ", "áo sơ mi"], ["スカート", "váy"], ["ネクタイ", "cà vạt"], ["エレベーター", "thang máy"], ["エアコン", "máy điều hòa"],
  ["サッカー", "bóng đá"], ["ギター", "đàn ghi-ta"], ["ピアノ", "đàn piano"], ["チョコレート", "sô-cô-la"], ["ミルク", "sữa"],
  ["パーティー", "bữa tiệc"], ["ファイル", "tệp tin"], ["ソフトウェア", "phần mềm"], ["データ", "dữ liệu"], ["サーバー", "máy chủ"],
  ["プログラム", "chương trình"], ["テスト", "kiểm thử"], ["デザイン", "thiết kế"], ["ミーティング", "cuộc họp"], ["プロジェクト", "dự án"],
  ["フォーク", "cái nĩa"], ["ウェブサイト", "trang web"], ["ディズニー", "Disney"], ["ヴァイオリン", "đàn vi-ô-lông"], ["チェック", "kiểm tra"],
];
