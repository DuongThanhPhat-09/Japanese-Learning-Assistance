import type { Article } from "@/types";

/**
 * Reading articles. Paragraphs use `{漢字|かんじ}` ruby markup; the reader can
 * toggle furigana, tap a word for a vocabulary popup, and toggle translations.
 * All texts are original content written for this app.
 */
export const ARTICLES: Article[] = [
  // ------------------------------------------------------------------ N5
  {
    id: "n5-my-day",
    level: "N5",
    category: "daily",
    title: "{私|わたし}の{一日|いちにち}",
    titleVi: "Một ngày của tôi",
    paragraphs: [
      "{私|わたし}はグエンです。ハノイから{来|き}ました。{今|いま}、{東京|とうきょう}に{住|す}んでいます。",
      "{毎朝|まいあさ}{六時|ろくじ}に{起|お}きます。{朝|あさ}ご{飯|はん}はパンとコーヒーです。{八時|はちじ}に{家|いえ}を{出|で}ます。{電車|でんしゃ}で{会社|かいしゃ}へ{行|い}きます。",
      "{会社|かいしゃ}は{九時|くじ}から{六時|ろくじ}までです。{昼|ひる}ご{飯|はん}は{同僚|どうりょう}と{食|た}べます。",
      "{夜|よる}は{日本語|にほんご}を{勉強|べんきょう}します。{十一時|じゅういちじ}に{寝|ね}ます。{毎日|まいにち}{忙|いそが}しいですが、{楽|たの}しいです。",
    ],
    translation: [
      "Tôi là Nguyễn. Tôi đến từ Hà Nội. Hiện tôi đang sống ở Tokyo.",
      "Mỗi sáng tôi dậy lúc 6 giờ. Bữa sáng là bánh mì và cà phê. Tôi ra khỏi nhà lúc 8 giờ. Tôi đi tàu điện đến công ty.",
      "Công ty làm từ 9 giờ đến 6 giờ. Tôi ăn trưa cùng đồng nghiệp.",
      "Buổi tối tôi học tiếng Nhật. Tôi ngủ lúc 11 giờ. Ngày nào cũng bận nhưng vui.",
    ],
    glossary: [
      { word: "住んでいます", reading: "すんでいます", meaning: "đang sống" },
      { word: "同僚", reading: "どうりょう", meaning: "đồng nghiệp" },
      { word: "忙しい", reading: "いそがしい", meaning: "bận rộn" },
    ],
    questions: [
      { id: "q1", prompt: "グエンさんは何時に起きますか。", options: ["五時", "六時", "八時", "九時"], answer: 1 },
      { id: "q2", prompt: "グエンさんは何で会社へ行きますか。", options: ["バス", "車", "電車", "自転車"], answer: 2 },
      { id: "q3", prompt: "夜、何をしますか。", options: ["日本語を勉強します", "テレビを見ます", "料理をします", "運動します"], answer: 0 },
    ],
  },
  {
    id: "n5-weekend",
    level: "N5",
    category: "story",
    title: "{週末|しゅうまつ}の{買|か}い{物|もの}",
    titleVi: "Đi mua sắm cuối tuần",
    paragraphs: [
      "{土曜日|どようび}に{友達|ともだち}と{新宿|しんじゅく}へ{行|い}きました。{天気|てんき}がとてもよかったです。",
      "デパートで{新|あたら}しい{服|ふく}を{買|か}いました。{少|すこ}し{高|たか}かったですが、きれいです。",
      "それから、{駅|えき}の{近|ちか}くのレストランでラーメンを{食|た}べました。とてもおいしかったです。",
      "{日曜日|にちようび}は{家|いえ}でゆっくり{休|やす}みました。",
    ],
    translation: [
      "Thứ Bảy tôi đã đi Shinjuku cùng bạn. Thời tiết rất đẹp.",
      "Tôi đã mua quần áo mới ở trung tâm thương mại. Hơi đắt một chút nhưng đẹp.",
      "Sau đó, chúng tôi ăn ramen ở nhà hàng gần ga. Rất ngon.",
      "Chủ nhật tôi nghỉ ngơi thong thả ở nhà.",
    ],
    glossary: [
      { word: "デパート", reading: "デパート", meaning: "trung tâm thương mại" },
      { word: "それから", reading: "それから", meaning: "sau đó" },
      { word: "ゆっくり", reading: "ゆっくり", meaning: "thong thả" },
    ],
    questions: [
      { id: "q1", prompt: "土曜日に何を買いましたか。", options: ["本", "服", "靴", "かばん"], answer: 1 },
      { id: "q2", prompt: "ラーメンはどうでしたか。", options: ["高かった", "まずかった", "おいしかった", "辛かった"], answer: 2 },
    ],
  },
  // ------------------------------------------------------------------ N4
  {
    id: "n4-moving",
    level: "N4",
    category: "story",
    title: "{引|ひ}っ{越|こ}しの{日|ひ}",
    titleVi: "Ngày chuyển nhà",
    paragraphs: [
      "{先月|せんげつ}、{会社|かいしゃ}の{近|ちか}くのアパートに{引|ひ}っ{越|こ}しました。{前|まえ}のアパートは{駅|えき}から{遠|とお}くて、{毎朝|まいあさ}{大変|たいへん}だったからです。",
      "{引|ひ}っ{越|こ}しの{日|ひ}は{雨|あめ}が{降|ふ}っていました。{友達|ともだち}が{三人|さんにん}{手伝|てつだ}いに{来|き}てくれたので、{思|おも}ったより{早|はや}く{終|お}わりました。",
      "{新|あたら}しい{部屋|へや}は{狭|せま}いですが、{窓|まど}から{公園|こうえん}が{見|み}えます。{近所|きんじょ}にスーパーもあるので、とても{便利|べんり}です。",
      "{手伝|てつだ}ってくれたお{礼|れい}に、{今度|こんど}{友達|ともだち}に{晩|ばん}ご{飯|はん}をごちそうしようと{思|おも}っています。",
    ],
    translation: [
      "Tháng trước tôi đã chuyển đến căn hộ gần công ty. Vì căn hộ trước xa ga nên mỗi sáng đều rất vất vả.",
      "Ngày chuyển nhà trời mưa. Ba người bạn đã đến giúp nên xong sớm hơn tôi nghĩ.",
      "Căn phòng mới chật nhưng từ cửa sổ có thể nhìn thấy công viên. Gần nhà cũng có siêu thị nên rất tiện.",
      "Để cảm ơn vì đã giúp, lần tới tôi định mời các bạn ăn tối.",
    ],
    glossary: [
      { word: "引っ越し", reading: "ひっこし", meaning: "chuyển nhà" },
      { word: "狭い", reading: "せまい", meaning: "chật hẹp" },
      { word: "お礼", reading: "おれい", meaning: "lời/quà cảm ơn" },
      { word: "ごちそうする", reading: "ごちそうする", meaning: "mời (ăn uống)" },
    ],
    questions: [
      { id: "q1", prompt: "どうして引っ越しましたか。", options: ["家賃が高かったから", "駅から遠かったから", "部屋が狭かったから", "うるさかったから"], answer: 1 },
      { id: "q2", prompt: "引っ越しはどうして早く終わりましたか。", options: ["荷物が少なかったから", "天気がよかったから", "友達が手伝ってくれたから", "業者に頼んだから"], answer: 2 },
      { id: "q3", prompt: "新しい部屋について、正しいものはどれですか。", options: ["広くて静か", "窓から公園が見える", "駅から遠い", "近くに店がない"], answer: 1 },
    ],
  },
  {
    id: "n4-japanese-trains",
    level: "N4",
    category: "essay",
    title: "{日本|にほん}の{電車|でんしゃ}",
    titleVi: "Tàu điện Nhật Bản",
    paragraphs: [
      "{日本|にほん}の{電車|でんしゃ}はとても{正確|せいかく}です。{一分|いっぷん}{遅|おく}れただけで、{駅員|えきいん}が「{申|もう}し{訳|わけ}ございません」とアナウンスします。",
      "{電車|でんしゃ}の{中|なか}では、{電話|でんわ}で{話|はな}してはいけません。また、{大|おお}きい{声|こえ}で{話|はな}さないようにするのがマナーです。",
      "{朝|あさ}のラッシュアワーはとても{混|こ}んでいます。{初|はじ}めて{乗|の}ったとき、{私|わたし}は{本当|ほんとう}に{驚|おどろ}きました。",
    ],
    translation: [
      "Tàu điện Nhật Bản rất đúng giờ. Chỉ cần trễ 1 phút, nhân viên nhà ga sẽ thông báo “Chúng tôi thành thật xin lỗi”.",
      "Trong tàu không được nói chuyện điện thoại. Ngoài ra, việc cố gắng không nói to cũng là phép lịch sự.",
      "Giờ cao điểm buổi sáng rất đông. Lần đầu tiên đi, tôi đã thực sự ngạc nhiên.",
    ],
    glossary: [
      { word: "正確", reading: "せいかく", meaning: "chính xác" },
      { word: "駅員", reading: "えきいん", meaning: "nhân viên nhà ga" },
      { word: "混んでいます", reading: "こんでいます", meaning: "đông đúc" },
    ],
    questions: [
      { id: "q1", prompt: "電車の中でしてはいけないことは何ですか。", options: ["本を読む", "電話で話す", "寝る", "音楽を聞く"], answer: 1 },
      { id: "q2", prompt: "筆者は初めてラッシュアワーの電車に乗ってどう思いましたか。", options: ["楽しかった", "驚いた", "怒った", "眠かった"], answer: 1 },
    ],
  },
  // ------------------------------------------------------------------ N3
  {
    id: "n3-remote-work",
    level: "N3",
    category: "essay",
    title: "{在宅勤務|ざいたくきんむ}のメリットとデメリット",
    titleVi: "Ưu và nhược điểm của làm việc tại nhà",
    paragraphs: [
      "{最近|さいきん}、{在宅勤務|ざいたくきんむ}を{導入|どうにゅう}する{会社|かいしゃ}が{増|ふ}えている。{通勤|つうきん}{時間|じかん}がなくなるため、{自由|じゆう}な{時間|じかん}が{増|ふ}えたと{喜|よろこ}ぶ{人|ひと}は{多|おお}い。",
      "しかし、{問題|もんだい}がないわけではない。{同僚|どうりょう}と{直接|ちょくせつ}{話|はな}す{機会|きかい}が{減|へ}ったせいで、{孤独|こどく}を{感|かん}じる{人|ひと}もいる。また、{仕事|しごと}と{生活|せいかつ}の{区別|くべつ}がつきにくいという{声|こえ}もある。",
      "{大切|たいせつ}なのは、{自分|じぶん}に{合|あ}った{働|はたら}き{方|かた}を{見|み}つけることだろう。{週|しゅう}に{何日|なんにち}か{出社|しゅっしゃ}するなど、{工夫|くふう}している{会社|かいしゃ}も{少|すく}なくない。",
    ],
    translation: [
      "Gần đây, số công ty áp dụng làm việc tại nhà đang tăng lên. Vì không còn thời gian đi lại, nhiều người vui mừng vì có thêm thời gian tự do.",
      "Tuy nhiên, không phải là không có vấn đề. Do cơ hội nói chuyện trực tiếp với đồng nghiệp giảm đi, có người cảm thấy cô đơn. Ngoài ra cũng có ý kiến cho rằng khó phân biệt giữa công việc và cuộc sống.",
      "Điều quan trọng có lẽ là tìm ra cách làm việc phù hợp với bản thân. Không ít công ty đang tìm cách cải tiến, chẳng hạn cho nhân viên đến văn phòng vài ngày một tuần.",
    ],
    glossary: [
      { word: "在宅勤務", reading: "ざいたくきんむ", meaning: "làm việc tại nhà" },
      { word: "通勤", reading: "つうきん", meaning: "đi làm (di chuyển)" },
      { word: "孤独", reading: "こどく", meaning: "cô độc" },
      { word: "区別", reading: "くべつ", meaning: "phân biệt" },
      { word: "工夫", reading: "くふう", meaning: "cải tiến, tìm cách" },
    ],
    questions: [
      { id: "q1", prompt: "在宅勤務のメリットとして挙げられているのはどれか。", options: ["給料が上がる", "通勤時間がなくなる", "同僚と話す機会が増える", "仕事が減る"], answer: 1 },
      { id: "q2", prompt: "「区別がつきにくい」とはどういう意味か。", options: ["分けるのが難しい", "すぐに決められる", "全く同じだ", "選べない"], answer: 0 },
      { id: "q3", prompt: "筆者の考えに最も近いものはどれか。", options: ["在宅勤務はやめるべきだ", "全員が在宅勤務をするべきだ", "自分に合った働き方を見つけることが大切だ", "出社は必要ない"], answer: 2 },
    ],
  },
  {
    id: "n3-convenience-store",
    level: "N3",
    category: "news",
    title: "コンビニの{役割|やくわり}",
    titleVi: "Vai trò của cửa hàng tiện lợi",
    paragraphs: [
      "{日本|にほん}のコンビニは{二十四時間|にじゅうよじかん}{営業|えいぎょう}しており、{食品|しょくひん}だけでなく、{公共料金|こうきょうりょうきん}の{支払|しはら}いや{荷物|にもつ}の{受|う}け{取|と}りもできる。",
      "{災害|さいがい}のときには、{水|みず}や{食料|しょくりょう}を{届|とど}ける{拠点|きょてん}としての{役割|やくわり}も{期待|きたい}されている。",
      "{一方|いっぽう}で、{人手不足|ひとでぶそく}のため、{深夜|しんや}{営業|えいぎょう}をやめる{店|みせ}も{出|で}てきた。",
    ],
    translation: [
      "Cửa hàng tiện lợi ở Nhật mở cửa 24 giờ, không chỉ bán thực phẩm mà còn có thể thanh toán hóa đơn tiện ích và nhận hàng.",
      "Khi có thiên tai, chúng còn được kỳ vọng đóng vai trò điểm cung cấp nước và lương thực.",
      "Mặt khác, do thiếu nhân lực, đã có những cửa hàng ngừng mở cửa ban đêm.",
    ],
    glossary: [
      { word: "営業", reading: "えいぎょう", meaning: "kinh doanh, mở cửa" },
      { word: "公共料金", reading: "こうきょうりょうきん", meaning: "phí dịch vụ công (điện, nước…)" },
      { word: "拠点", reading: "きょてん", meaning: "cứ điểm" },
      { word: "人手不足", reading: "ひとでぶそく", meaning: "thiếu nhân lực" },
    ],
    questions: [
      { id: "q1", prompt: "本文で、コンビニでできると書かれていないことはどれか。", options: ["荷物の受け取り", "公共料金の支払い", "食品の購入", "銀行口座の開設"], answer: 3 },
      { id: "q2", prompt: "深夜営業をやめる店が出てきた理由は何か。", options: ["客が少ないから", "人手が足りないから", "法律が変わったから", "災害が多いから"], answer: 1 },
    ],
  },
  // ------------------------------------------------------------------ N2
  {
    id: "n2-ai-jobs",
    level: "N2",
    category: "essay",
    title: "AIと{仕事|しごと}の{未来|みらい}",
    titleVi: "AI và tương lai của công việc",
    paragraphs: [
      "AIの{急速|きゅうそく}な{発展|はってん}に{伴|ともな}い、「{人間|にんげん}の{仕事|しごと}が{奪|うば}われるのではないか」という{懸念|けねん}が{広|ひろ}がっている。{実際|じっさい}、{単純|たんじゅん}な{事務作業|じむさぎょう}の{多|おお}くはすでに{自動化|じどうか}されつつある。",
      "しかし、{歴史|れきし}を{振|ふ}り{返|かえ}れば、{新|あたら}しい{技術|ぎじゅつ}は{仕事|しごと}を{奪|うば}うだけでなく、{新|あら}たな{仕事|しごと}を{生|う}み{出|だ}してきた。{重要|じゅうよう}なのは、{技術|ぎじゅつ}を{恐|おそ}れることではなく、それをどう{活用|かつよう}するかを{考|かんが}えることである。",
      "これからの{時代|じだい}には、AIにはできない{創造性|そうぞうせい}や{対人|たいじん}コミュニケーション{能力|のうりょく}がますます{求|もと}められるに{違|ちが}いない。",
    ],
    translation: [
      "Cùng với sự phát triển nhanh chóng của AI, nỗi lo ngại “liệu công việc của con người có bị cướp mất” đang lan rộng. Thực tế, nhiều công việc văn phòng đơn giản đang dần được tự động hóa.",
      "Tuy nhiên, nhìn lại lịch sử, công nghệ mới không chỉ lấy đi công việc mà còn tạo ra công việc mới. Điều quan trọng không phải là sợ hãi công nghệ mà là suy nghĩ cách tận dụng nó.",
      "Trong thời đại sắp tới, chắc chắn tính sáng tạo và năng lực giao tiếp giữa người với người — những điều AI không làm được — sẽ ngày càng được đòi hỏi.",
    ],
    glossary: [
      { word: "伴い", reading: "ともない", meaning: "cùng với" },
      { word: "奪われる", reading: "うばわれる", meaning: "bị cướp mất" },
      { word: "懸念", reading: "けねん", meaning: "lo ngại" },
      { word: "活用", reading: "かつよう", meaning: "tận dụng" },
      { word: "創造性", reading: "そうぞうせい", meaning: "tính sáng tạo" },
    ],
    questions: [
      { id: "q1", prompt: "筆者によると、歴史上、新しい技術は何をしてきたか。", options: ["仕事を奪うだけだった", "新たな仕事も生み出してきた", "人間を不要にした", "何も変えなかった"], answer: 1 },
      { id: "q2", prompt: "筆者が重要だと考えていることは何か。", options: ["AIを禁止すること", "技術を恐れること", "技術をどう活用するか考えること", "事務作業を増やすこと"], answer: 2 },
    ],
  },
  {
    id: "n2-food-loss",
    level: "N2",
    category: "news",
    title: "{食品|しょくひん}ロス{削減|さくげん}への{取|と}り{組|く}み",
    titleVi: "Nỗ lực giảm lãng phí thực phẩm",
    paragraphs: [
      "まだ{食|た}べられるにもかかわらず{捨|す}てられる「{食品|しょくひん}ロス」は、{日本|にほん}で{年間|ねんかん}{約|やく}{五百万|ごひゃくまん}トンに{上|のぼ}るとされる。",
      "これを{受|う}け、{賞味期限|しょうみきげん}が{近|ちか}い{商品|しょうひん}を{値引|ねび}きして{販売|はんばい}するアプリや、{余|あま}った{食品|しょくひん}を{福祉施設|ふくししせつ}に{寄付|きふ}する{取|と}り{組|く}みが{広|ひろ}がりつつある。",
      "{消費者|しょうひしゃ}{一人|ひとり}ひとりが{必要|ひつよう}な{分|ぶん}だけ{買|か}う{意識|いしき}を{持|も}つことも{欠|か}かせない。",
    ],
    translation: [
      "“Lãng phí thực phẩm” — thức ăn bị vứt bỏ mặc dù vẫn còn ăn được — được cho là lên tới khoảng 5 triệu tấn mỗi năm ở Nhật.",
      "Trước tình hình này, các ứng dụng bán giảm giá sản phẩm sắp hết hạn sử dụng ngon nhất và hoạt động quyên góp thực phẩm dư thừa cho các cơ sở phúc lợi đang dần lan rộng.",
      "Việc mỗi người tiêu dùng có ý thức chỉ mua lượng cần thiết cũng là điều không thể thiếu.",
    ],
    glossary: [
      { word: "賞味期限", reading: "しょうみきげん", meaning: "hạn sử dụng (ngon nhất)" },
      { word: "福祉施設", reading: "ふくししせつ", meaning: "cơ sở phúc lợi" },
      { word: "寄付", reading: "きふ", meaning: "quyên góp" },
      { word: "欠かせない", reading: "かかせない", meaning: "không thể thiếu" },
    ],
    questions: [
      { id: "q1", prompt: "「食品ロス」とは何か。", options: ["食べられなくなった食品", "まだ食べられるのに捨てられる食品", "輸入された食品", "値引きされた食品"], answer: 1 },
      { id: "q2", prompt: "本文で紹介されていない取り組みはどれか。", options: ["値引き販売のアプリ", "福祉施設への寄付", "必要な分だけ買う意識", "食品の輸出"], answer: 3 },
    ],
  },
  // ------------------------------------------------------------------ N1
  {
    id: "n1-language-thought",
    level: "N1",
    category: "academic",
    title: "{言語|げんご}は{思考|しこう}を{規定|きてい}するか",
    titleVi: "Ngôn ngữ có quy định tư duy không?",
    paragraphs: [
      "{言語|げんご}が{思考|しこう}の{枠組|わくぐ}みを{規定|きてい}するという{仮説|かせつ}は、{古|ふる}くから{議論|ぎろん}の{的|まと}となってきた。{極端|きょくたん}な{立場|たちば}をとれば、{母語|ぼご}に{存在|そんざい}しない{概念|がいねん}は{理解|りかい}し{得|え}ないことになるが、これは{翻訳|ほんやく}という{営|いとな}みが{現|げん}に{成立|せいりつ}している{事実|じじつ}と{矛盾|むじゅん}する。",
      "{近年|きんねん}の{研究|けんきゅう}では、{言語|げんご}が{思考|しこう}を{決定|けってい}するのではなく、{注意|ちゅうい}の{向|む}け{方|かた}や{記憶|きおく}のしやすさに{一定|いってい}の{影響|えいきょう}を{及|およ}ぼすという、より{穏健|おんけん}な{見解|けんかい}が{有力|ゆうりょく}である。",
      "{外国語|がいこくご}を{学|まな}ぶことは、{単|たん}に{伝達|でんたつ}の{手段|しゅだん}を{増|ふ}やすにとどまらず、{世界|せかい}を{切|き}り{取|と}る{新|あら}たな{視点|してん}を{獲得|かくとく}することにほかならない。",
    ],
    translation: [
      "Giả thuyết cho rằng ngôn ngữ quy định khuôn khổ tư duy từ lâu đã là tâm điểm tranh luận. Nếu theo lập trường cực đoan, những khái niệm không tồn tại trong tiếng mẹ đẻ sẽ không thể hiểu được, nhưng điều này mâu thuẫn với thực tế rằng hoạt động dịch thuật vẫn đang tồn tại.",
      "Trong các nghiên cứu gần đây, quan điểm ôn hòa hơn đang chiếm ưu thế: ngôn ngữ không quyết định tư duy mà có ảnh hưởng nhất định đến cách hướng sự chú ý và mức độ dễ ghi nhớ.",
      "Học ngoại ngữ không chỉ dừng lại ở việc tăng thêm phương tiện truyền đạt, mà chính là có được một góc nhìn mới để cắt nghĩa thế giới.",
    ],
    glossary: [
      { word: "規定", reading: "きてい", meaning: "quy định" },
      { word: "仮説", reading: "かせつ", meaning: "giả thuyết" },
      { word: "穏健", reading: "おんけん", meaning: "ôn hòa" },
      { word: "にほかならない", reading: "にほかならない", meaning: "chính là, không gì khác ngoài" },
      { word: "獲得", reading: "かくとく", meaning: "giành được" },
    ],
    questions: [
      { id: "q1", prompt: "極端な立場が矛盾するとされている事実は何か。", options: ["言語が多様であること", "翻訳が成立していること", "母語が一つであること", "研究が進んでいること"], answer: 1 },
      { id: "q2", prompt: "近年有力な見解はどれか。", options: ["言語が思考を完全に決定する", "言語と思考は無関係だ", "言語は注意や記憶に一定の影響を与える", "母語以外は理解できない"], answer: 2 },
      { id: "q3", prompt: "筆者にとって外国語学習とは何か。", options: ["伝達手段を増やすことだけ", "新たな視点を獲得すること", "母語を忘れること", "翻訳者になること"], answer: 1 },
    ],
  },
  {
    id: "n1-aging-society",
    level: "N1",
    category: "news",
    title: "{地方|ちほう}{都市|とし}の{持続可能性|じぞくかのうせい}",
    titleVi: "Tính bền vững của các đô thị địa phương",
    paragraphs: [
      "{少子高齢化|しょうしこうれいか}と{都市部|としぶ}への{人口流出|じんこうりゅうしゅつ}を{背景|はいけい}に、{地方|ちほう}{都市|とし}は{存続|そんぞく}の{危機|きき}に{直面|ちょくめん}している。{公共交通|こうきょうこうつう}の{廃止|はいし}が{相次|あいつ}ぎ、{高齢者|こうれいしゃ}の{移動手段|いどうしゅだん}の{確保|かくほ}が{喫緊|きっきん}の{課題|かだい}となっている。",
      "こうした{状況|じょうきょう}を{打開|だかい}すべく、{自動運転|じどううんてん}バスの{実証実験|じっしょうじっけん}や、{空|あ}き{家|や}を{活用|かつよう}した{移住者|いじゅうしゃ}の{誘致|ゆうち}など、{各地|かくち}で{試行錯誤|しこうさくご}が{続|つづ}いている。",
      "もっとも、{成功事例|せいこうじれい}をそのまま{他地域|たちいき}に{当|あ}てはめても{効果|こうか}が{上|あ}がるとは{限|かぎ}らない。{地域|ちいき}の{実情|じつじょう}に{即|そく}した{施策|しさく}こそが{求|もと}められている。",
    ],
    translation: [
      "Trong bối cảnh già hóa dân số và dòng người đổ về đô thị lớn, các thành phố địa phương đang đối mặt với nguy cơ tồn vong. Giao thông công cộng liên tiếp bị bãi bỏ, việc đảm bảo phương tiện đi lại cho người cao tuổi trở thành vấn đề cấp bách.",
      "Nhằm phá vỡ tình trạng này, nhiều nơi đang thử nghiệm: chạy thử xe buýt tự lái, thu hút người di cư đến bằng cách tận dụng nhà bỏ trống…",
      "Tuy nhiên, áp dụng nguyên xi mô hình thành công sang vùng khác chưa chắc đã hiệu quả. Điều cần thiết chính là những chính sách bám sát thực tế của từng địa phương.",
    ],
    glossary: [
      { word: "喫緊", reading: "きっきん", meaning: "cấp bách" },
      { word: "打開すべく", reading: "だかいすべく", meaning: "nhằm phá vỡ (bế tắc)" },
      { word: "誘致", reading: "ゆうち", meaning: "thu hút, mời gọi" },
      { word: "試行錯誤", reading: "しこうさくご", meaning: "thử và sai" },
      { word: "に即した", reading: "にそくした", meaning: "bám sát theo" },
    ],
    questions: [
      { id: "q1", prompt: "地方都市で喫緊の課題とされているのは何か。", options: ["観光客の増加", "高齢者の移動手段の確保", "大学の新設", "税金の引き下げ"], answer: 1 },
      { id: "q2", prompt: "筆者の主張に最も合うものはどれか。", options: ["成功事例をそのまま導入すべきだ", "自動運転がすべてを解決する", "地域の実情に即した施策が必要だ", "移住者の誘致はやめるべきだ"], answer: 2 },
    ],
  },
  // ------------------------------------------------------------------ Native-level
  {
    id: "native-news-yen",
    level: "native",
    category: "news",
    title: "{円安|えんやす}{進行|しんこう}、{家計|かけい}への{影響|えいきょう}{広|ひろ}がる",
    titleVi: "Đồng yên tiếp tục giảm giá, ảnh hưởng lan rộng tới ngân sách hộ gia đình",
    paragraphs: [
      "{外国為替市場|がいこくかわせしじょう}で{円安|えんやす}・ドル{高|だか}が{進|すす}み、{輸入品|ゆにゅうひん}を{中心|ちゅうしん}に{値上|ねあ}げの{動|うご}きが{相次|あいつ}いでいる。{食料品|しょくりょうひん}やエネルギー{価格|かかく}の{上昇|じょうしょう}は、{家計|かけい}を{直撃|ちょくげき}している。",
      "{一方|いっぽう}、{輸出企業|ゆしゅつきぎょう}にとっては{追|お}い{風|かぜ}となり、{過去最高益|かこさいこうえき}を{更新|こうしん}する{企業|きぎょう}も{少|すく}なくない。{恩恵|おんけい}と{負担|ふたん}が{偏在|へんざい}する{構図|こうず}が{浮|う}き{彫|ぼ}りになっている。",
      "{専門家|せんもんか}の{間|あいだ}では、{金融政策|きんゆうせいさく}の{転換|てんかん}が{為替|かわせ}の{流|なが}れを{左右|さゆう}するとの{見方|みかた}が{大勢|たいせい}を{占|し}めている。",
    ],
    translation: [
      "Trên thị trường ngoại hối, đồng yên yếu đi trong khi đô la mạnh lên, khiến việc tăng giá liên tiếp diễn ra, chủ yếu với hàng nhập khẩu. Giá thực phẩm và năng lượng tăng đang giáng trực tiếp vào ngân sách gia đình.",
      "Mặt khác, đây là cơn gió thuận cho các doanh nghiệp xuất khẩu, không ít công ty đạt lợi nhuận cao kỷ lục. Bức tranh lợi ích và gánh nặng phân bổ không đồng đều đang hiện rõ.",
      "Giới chuyên gia phần lớn cho rằng sự chuyển hướng chính sách tiền tệ sẽ quyết định xu hướng tỷ giá.",
    ],
    glossary: [
      { word: "直撃", reading: "ちょくげき", meaning: "đánh trực diện" },
      { word: "追い風", reading: "おいかぜ", meaning: "gió thuận, lợi thế" },
      { word: "偏在", reading: "へんざい", meaning: "phân bố không đều" },
      { word: "浮き彫り", reading: "うきぼり", meaning: "nổi bật, hiện rõ" },
      { word: "大勢を占める", reading: "たいせいをしめる", meaning: "chiếm đa số" },
    ],
    questions: [
      { id: "q1", prompt: "「恩恵と負担が偏在する構図」とは何を指すか。", options: ["全員が得をしている", "得をする企業と負担を受ける家計がある", "誰も影響を受けていない", "輸出企業が損をしている"], answer: 1 },
      { id: "q2", prompt: "専門家の多くは何が為替を左右すると見ているか。", options: ["観光客の数", "金融政策の転換", "食料品の価格", "企業の利益"], answer: 1 },
    ],
    discussion: ["円安はベトナム人の技能実習生や留学生にどのような影響を与えるか。", "為替変動に対して個人ができる対策は何か。"],
  },
  {
    id: "native-tech-microservices",
    level: "native",
    category: "technical",
    title: "マイクロサービス{化|か}の{落|お}とし{穴|あな}",
    titleVi: "Những cạm bẫy khi chuyển sang microservices",
    paragraphs: [
      "モノリシックなシステムをマイクロサービスへ{分割|ぶんかつ}すれば、{開発|かいはつ}の{俊敏性|しゅんびんせい}が{高|たか}まると{期待|きたい}されがちだ。しかし、{分割|ぶんかつ}の{境界|きょうかい}を{誤|あやま}ると、サービス{間|かん}の{通信|つうしん}が{増大|ぞうだい}し、かえって{変更|へんこう}が{困難|こんなん}になる「{分散|ぶんさん}モノリス」に{陥|おちい}りかねない。",
      "{境界|きょうかい}の{設計|せっけい}にあたっては、{技術的|ぎじゅつてき}なレイヤーではなく、{業務|ぎょうむ}の{関心事|かんしんじ}に{基|もと}づいて{分割|ぶんかつ}することが{肝要|かんよう}である。また、{分散|ぶんさん}トランザクションや{監視|かんし}の{複雑化|ふくざつか}といった{運用|うんよう}コストも{見落|みお}としてはならない。",
      "{組織|そしき}の{規模|きぼ}や{成熟度|せいじゅくど}によっては、モジュール{化|か}されたモノリスのほうが{合理的|ごうりてき}な{選択|せんたく}となる{場合|ばあい}も{少|すく}なくない。",
    ],
    translation: [
      "Người ta thường kỳ vọng rằng tách hệ thống monolithic thành microservices sẽ tăng tính linh hoạt khi phát triển. Tuy nhiên, nếu xác định sai ranh giới tách, giao tiếp giữa các service tăng lên và có nguy cơ rơi vào “monolith phân tán” — nơi thay đổi lại càng khó khăn.",
      "Khi thiết kế ranh giới, điều cốt yếu là tách dựa trên mối quan tâm nghiệp vụ chứ không phải theo tầng kỹ thuật. Ngoài ra, không được bỏ qua chi phí vận hành như giao dịch phân tán hay việc giám sát trở nên phức tạp.",
      "Tùy theo quy mô và độ trưởng thành của tổ chức, không ít trường hợp một monolith được module hóa lại là lựa chọn hợp lý hơn.",
    ],
    glossary: [
      { word: "俊敏性", reading: "しゅんびんせい", meaning: "tính linh hoạt, nhanh nhạy" },
      { word: "陥りかねない", reading: "おちいりかねない", meaning: "có nguy cơ rơi vào" },
      { word: "肝要", reading: "かんよう", meaning: "cốt yếu" },
      { word: "関心事", reading: "かんしんじ", meaning: "mối quan tâm (concern)" },
      { word: "見落とす", reading: "みおとす", meaning: "bỏ sót" },
    ],
    questions: [
      { id: "q1", prompt: "「分散モノリス」に陥る原因として挙げられているのは何か。", options: ["サービスが少なすぎること", "分割の境界を誤ること", "監視をしないこと", "クラウドを使うこと"], answer: 1 },
      { id: "q2", prompt: "境界設計で肝要とされているのは何か。", options: ["技術レイヤーで分ける", "業務の関心事に基づいて分ける", "チーム人数で分ける", "ランダムに分ける"], answer: 1 },
    ],
    discussion: ["あなたのプロジェクトでマイクロサービス化は妥当か、日本語で300字程度で論じなさい。"],
  },
  {
    id: "native-novel-rain",
    level: "native",
    category: "novel",
    title: "{雨宿|あまやど}り（{短編|たんぺん}）",
    titleVi: "Trú mưa (truyện ngắn)",
    paragraphs: [
      "{夕立|ゆうだち}は{唐突|とうとつ}に{訪|おとず}れた。{駅前|えきまえ}の{古|ふる}い{本屋|ほんや}の{軒先|のきさき}に{駆|か}け{込|こ}むと、{先客|せんきゃく}が{一人|ひとり}、{濡|ぬ}れた{肩|かた}を{所在|しょざい}なげにすくめていた。",
      "「よく{降|ふ}りますね」と{声|こえ}をかけると、{彼女|かのじょ}は{少|すこ}し{驚|おどろ}いたように{顔|かお}を{上|あ}げ、それから{遠|とお}い{国|くに}の{言葉|ことば}で{何|なに}か{呟|つぶや}いた。{聞|き}き{覚|おぼ}えのある{響|ひび}きだった。{故郷|こきょう}の{言葉|ことば}だ。",
      "{雨音|あまおと}が{二人|ふたり}の{沈黙|ちんもく}を{埋|う}めていく。やがて{雲|くも}の{切|き}れ{間|ま}から{西日|にしび}が{差|さ}し{込|こ}んだとき、どちらからともなく{笑|わら}みがこぼれた。",
    ],
    translation: [
      "Cơn mưa rào chiều ập đến bất ngờ. Khi tôi chạy vào dưới mái hiên hiệu sách cũ trước ga, đã có một người đứng đó từ trước, so đôi vai ướt một cách bối rối.",
      "Tôi bắt chuyện: “Mưa to nhỉ”, cô ấy hơi giật mình ngẩng lên, rồi lẩm bẩm điều gì đó bằng thứ tiếng của một đất nước xa xôi. Đó là âm thanh tôi từng nghe. Là tiếng quê hương.",
      "Tiếng mưa lấp đầy sự im lặng giữa hai người. Rồi khi nắng chiều xuyên qua kẽ mây, chẳng biết ai trước, cả hai cùng bật cười.",
    ],
    glossary: [
      { word: "夕立", reading: "ゆうだち", meaning: "mưa rào chiều hè" },
      { word: "軒先", reading: "のきさき", meaning: "mái hiên" },
      { word: "所在なげ", reading: "しょざいなげ", meaning: "bối rối, không biết làm gì" },
      { word: "呟いた", reading: "つぶやいた", meaning: "lẩm bẩm" },
      { word: "どちらからともなく", reading: "どちらからともなく", meaning: "chẳng biết ai trước" },
    ],
    questions: [
      { id: "q1", prompt: "「聞き覚えのある響き」だったのはなぜか。", options: ["日本語だったから", "主人公の故郷の言葉だったから", "歌だったから", "雨の音だったから"], answer: 1 },
      { id: "q2", prompt: "最後の場面の雰囲気として最も適切なものはどれか。", options: ["緊張", "怒り", "温かい共感", "悲しみ"], answer: 2 },
    ],
  },
  {
    id: "native-business-report",
    level: "native",
    category: "business-report",
    title: "{第|だい}3{四半期|しはんき}{業績|ぎょうせき}{報告|ほうこく}（{要旨|ようし}）",
    titleVi: "Báo cáo kết quả kinh doanh quý 3 (tóm tắt)",
    paragraphs: [
      "{当四半期|とうしはんき}の{売上高|うりあげだか}は{前年同期比|ぜんねんどうきひ}{十二|じゅうに}%{増|ぞう}となり、{主力|しゅりょく}のクラウド{事業|じぎょう}が{牽引|けんいん}した。{一方|いっぽう}、{人件費|じんけんひ}の{増加|ぞうか}により{営業利益率|えいぎょうりえきりつ}は{前期|ぜんき}を{下回|したまわ}った。",
      "{今後|こんご}はオフショア{開発|かいはつ}{拠点|きょてん}の{拡充|かくじゅう}により{開発|かいはつ}コストの{最適化|さいてきか}を{図|はか}るとともに、{高付加価値|こうふかかち}なコンサルティング{案件|あんけん}の{比率|ひりつ}を{高|たか}める{方針|ほうしん}である。",
      "{為替変動|かわせへんどう}リスクについては{引|ひ}き{続|つづ}き{注視|ちゅうし}し、{必要|ひつよう}に{応|おう}じて{通期|つうき}{見通|みとお}しを{修正|しゅうせい}する。",
    ],
    translation: [
      "Doanh thu quý này tăng 12% so với cùng kỳ năm trước, được dẫn dắt bởi mảng cloud chủ lực. Mặt khác, do chi phí nhân sự tăng, tỷ suất lợi nhuận hoạt động thấp hơn kỳ trước.",
      "Thời gian tới, chúng tôi sẽ tối ưu chi phí phát triển bằng việc mở rộng các trung tâm phát triển offshore, đồng thời nâng tỷ trọng các dự án tư vấn có giá trị gia tăng cao.",
      "Về rủi ro biến động tỷ giá, chúng tôi sẽ tiếp tục theo dõi sát và điều chỉnh dự báo cả năm khi cần thiết.",
    ],
    glossary: [
      { word: "前年同期比", reading: "ぜんねんどうきひ", meaning: "so với cùng kỳ năm trước" },
      { word: "牽引", reading: "けんいん", meaning: "dẫn dắt, kéo" },
      { word: "下回った", reading: "したまわった", meaning: "thấp hơn" },
      { word: "拡充", reading: "かくじゅう", meaning: "mở rộng, tăng cường" },
      { word: "注視", reading: "ちゅうし", meaning: "theo dõi sát" },
    ],
    questions: [
      { id: "q1", prompt: "営業利益率が下がった理由は何か。", options: ["売上の減少", "人件費の増加", "為替の影響", "クラウド事業の不振"], answer: 1 },
      { id: "q2", prompt: "今後の方針として述べられていないものはどれか。", options: ["オフショア拠点の拡充", "コンサルティング案件の比率向上", "クラウド事業からの撤退", "通期見通しの必要に応じた修正"], answer: 2 },
    ],
  },
  {
    id: "native-debate-ai-education",
    level: "native",
    category: "debate",
    title: "ディベート：{学校教育|がっこうきょういく}で{生成|せいせい}AIを{全面的|ぜんめんてき}に{活用|かつよう}すべきか",
    titleVi: "Tranh biện: Có nên tận dụng toàn diện AI tạo sinh trong giáo dục phổ thông?",
    paragraphs: [
      "{肯定側|こうていがわ}は、{生成|せいせい}AIが{個々|ここ}の{学習者|がくしゅうしゃ}に{合|あ}わせた{指導|しどう}を{可能|かのう}にし、{教員|きょういん}の{負担|ふたん}{軽減|けいげん}にもつながると{主張|しゅちょう}する。",
      "{否定側|ひていがわ}は、{安易|あんい}な{依存|いぞん}が{思考力|しこうりょく}や{文章力|ぶんしょうりょく}の{低下|ていか}を{招|まね}きかねないうえ、{誤情報|ごじょうほう}を{見抜|みぬ}く{力|ちから}が{育|そだ}たないと{反論|はんろん}する。",
      "{論点|ろんてん}は「{使|つか}うか{否|いな}か」ではなく、「どのような{条件|じょうけん}の{下|もと}で{使|つか}うか」へと{移|うつ}りつつある。",
    ],
    translation: [
      "Phe ủng hộ khẳng định AI tạo sinh giúp hướng dẫn phù hợp với từng người học và còn góp phần giảm gánh nặng cho giáo viên.",
      "Phe phản đối phản bác rằng sự lệ thuộc dễ dãi có thể dẫn đến suy giảm năng lực tư duy và viết, hơn nữa không phát triển được khả năng nhận ra thông tin sai lệch.",
      "Luận điểm đang dần chuyển từ “có dùng hay không” sang “dùng trong điều kiện như thế nào”.",
    ],
    glossary: [
      { word: "肯定側", reading: "こうていがわ", meaning: "phe ủng hộ" },
      { word: "否定側", reading: "ひていがわ", meaning: "phe phản đối" },
      { word: "安易", reading: "あんい", meaning: "dễ dãi" },
      { word: "招きかねない", reading: "まねきかねない", meaning: "có thể dẫn đến (điều xấu)" },
      { word: "見抜く", reading: "みぬく", meaning: "nhìn thấu" },
    ],
    questions: [
      { id: "q1", prompt: "否定側の主張に含まれないものはどれか。", options: ["思考力の低下", "文章力の低下", "誤情報を見抜く力が育たない", "教員の負担軽減"], answer: 3 },
    ],
    discussion: [
      "あなたは肯定側・否定側のどちらを支持するか。根拠を三つ挙げて述べなさい。",
      "反対の立場からの反論を想定し、それに再反論しなさい。",
      "「どのような条件の下で使うか」について、具体的なルール案を提示しなさい。",
    ],
  },
  {
    id: "native-academic-sleep",
    level: "native",
    category: "academic",
    title: "{睡眠|すいみん}と{記憶|きおく}の{固定化|こていか}",
    titleVi: "Giấc ngủ và sự củng cố trí nhớ",
    paragraphs: [
      "{学習|がくしゅう}した{内容|ないよう}が{長期記憶|ちょうききおく}として{定着|ていちゃく}する{過程|かてい}には、{睡眠|すいみん}が{重要|じゅうよう}な{役割|やくわり}を{果|は}たすことが{知|し}られている。",
      "とりわけ{深|ふか}いノンレム{睡眠|すいみん}の{間|あいだ}に、{海馬|かいば}に{一時的|いちじてき}に{保存|ほぞん}された{情報|じょうほう}が{大脳皮質|だいのうひしつ}へと{転送|てんそう}され、{整理|せいり}されると{考|かんが}えられている。",
      "{試験前|しけんまえ}の{徹夜|てつや}が{効率的|こうりつてき}でないとされるのは、まさにこの{固定化|こていか}の{機会|きかい}を{自|みずか}ら{手放|てばな}すことになるからである。{間隔|かんかく}を{空|あ}けた{反復学習|はんぷくがくしゅう}と{十分|じゅうぶん}な{睡眠|すいみん}の{組|く}み{合|あ}わせが、{最|もっと}も{合理的|ごうりてき}な{学習戦略|がくしゅうせんりゃく}と{言|い}えよう。",
    ],
    translation: [
      "Người ta biết rằng giấc ngủ đóng vai trò quan trọng trong quá trình nội dung đã học được định hình thành trí nhớ dài hạn.",
      "Đặc biệt, trong giấc ngủ non-REM sâu, thông tin được lưu tạm thời ở hồi hải mã được cho là sẽ chuyển sang vỏ đại não và được sắp xếp.",
      "Thức trắng trước kỳ thi được cho là không hiệu quả chính vì nó khiến ta tự đánh mất cơ hội củng cố này. Có thể nói sự kết hợp giữa học lặp lại cách quãng và ngủ đủ giấc là chiến lược học tập hợp lý nhất.",
    ],
    glossary: [
      { word: "定着", reading: "ていちゃく", meaning: "định hình, bám rễ" },
      { word: "海馬", reading: "かいば", meaning: "hồi hải mã" },
      { word: "大脳皮質", reading: "だいのうひしつ", meaning: "vỏ đại não" },
      { word: "徹夜", reading: "てつや", meaning: "thức trắng đêm" },
      { word: "手放す", reading: "てばなす", meaning: "buông bỏ" },
    ],
    questions: [
      { id: "q1", prompt: "徹夜が効率的でないとされる理由は何か。", options: ["体に悪いから", "記憶の固定化の機会を失うから", "試験に遅れるから", "集中力が上がるから"], answer: 1 },
      { id: "q2", prompt: "筆者が勧める学習戦略はどれか。", options: ["一夜漬け", "間隔を空けた反復学習と十分な睡眠", "睡眠時間を減らすこと", "一度だけ深く学ぶこと"], answer: 1 },
    ],
  },
];

export const ARTICLE_BY_ID = new Map(ARTICLES.map((a) => [a.id, a]));

export const CATEGORY_LABEL: Record<string, string> = {
  daily: "Đời sống",
  story: "Câu chuyện",
  news: "Tin tức",
  essay: "Tiểu luận",
  technical: "Bài viết kỹ thuật",
  novel: "Văn học",
  "business-report": "Báo cáo kinh doanh",
  debate: "Tranh biện",
  academic: "Học thuật",
};
