import type { KeigoVerb, ProModule } from "@/types";

export const KEIGO_VERBS: KeigoVerb[] = [
  { plain: "いる", meaning: "ở, có mặt", teineigo: "います", sonkeigo: "いらっしゃる / おいでになる", kenjougo: "おる" },
  { plain: "行く", meaning: "đi", teineigo: "行きます", sonkeigo: "いらっしゃる / おいでになる", kenjougo: "参る / 伺う" },
  { plain: "来る", meaning: "đến", teineigo: "来ます", sonkeigo: "いらっしゃる / お越しになる / 見える", kenjougo: "参る" },
  { plain: "言う", meaning: "nói", teineigo: "言います", sonkeigo: "おっしゃる", kenjougo: "申す / 申し上げる" },
  { plain: "見る", meaning: "xem", teineigo: "見ます", sonkeigo: "ご覧になる", kenjougo: "拝見する" },
  { plain: "聞く", meaning: "nghe, hỏi", teineigo: "聞きます", sonkeigo: "お聞きになる", kenjougo: "伺う / 拝聴する" },
  { plain: "食べる / 飲む", meaning: "ăn / uống", teineigo: "食べます / 飲みます", sonkeigo: "召し上がる", kenjougo: "いただく" },
  { plain: "する", meaning: "làm", teineigo: "します", sonkeigo: "なさる", kenjougo: "いたす" },
  { plain: "知っている", meaning: "biết", teineigo: "知っています", sonkeigo: "ご存じだ", kenjougo: "存じている / 存じ上げている" },
  { plain: "思う", meaning: "nghĩ", teineigo: "思います", sonkeigo: "お思いになる", kenjougo: "存じる" },
  { plain: "会う", meaning: "gặp", teineigo: "会います", sonkeigo: "お会いになる", kenjougo: "お目にかかる" },
  { plain: "あげる", meaning: "cho, tặng", teineigo: "あげます", sonkeigo: "—", kenjougo: "差し上げる" },
  { plain: "くれる", meaning: "cho (tôi)", teineigo: "くれます", sonkeigo: "くださる", kenjougo: "—" },
  { plain: "もらう", meaning: "nhận", teineigo: "もらいます", sonkeigo: "お受け取りになる", kenjougo: "いただく / 頂戴する" },
  { plain: "訪ねる", meaning: "thăm", teineigo: "訪ねます", sonkeigo: "お訪ねになる", kenjougo: "伺う / お邪魔する" },
  { plain: "見せる", meaning: "cho xem", teineigo: "見せます", sonkeigo: "お見せになる", kenjougo: "お目にかける / ご覧に入れる" },
  { plain: "わかる", meaning: "hiểu", teineigo: "わかります", sonkeigo: "おわかりになる", kenjougo: "承知する / かしこまる" },
  { plain: "着る", meaning: "mặc", teineigo: "着ます", sonkeigo: "お召しになる", kenjougo: "—" },
  { plain: "寝る", meaning: "ngủ", teineigo: "寝ます", sonkeigo: "お休みになる", kenjougo: "—" },
  { plain: "死ぬ", meaning: "mất (qua đời)", teineigo: "亡くなります", sonkeigo: "お亡くなりになる", kenjougo: "—" },
];

export const KEIGO_INTRO = [
  {
    type: "丁寧語 (Teineigo) — Lịch sự ngữ",
    desc: "Cách nói lịch sự cơ bản bằng です・ます・ございます. Dùng với bất kỳ ai không thân thiết. Không nâng ai, không hạ ai.",
    example: "こちらが資料です → こちらが資料でございます。",
  },
  {
    type: "尊敬語 (Sonkeigo) — Tôn kính ngữ",
    desc: "Nâng cao hành động/trạng thái của người trên, khách hàng, người ngoài công ty. Chủ ngữ là ĐỐI PHƯƠNG.",
    example: "部長が言った → 部長がおっしゃいました。",
  },
  {
    type: "謙譲語 (Kenjougo) — Khiêm nhường ngữ",
    desc: "Hạ thấp hành động của bản thân hoặc người trong công ty mình khi nói với người ngoài. Chủ ngữ là MÌNH (hoặc người phe mình).",
    example: "私が行きます → 私が参ります / 伺います。",
  },
];

export const KEIGO_RULES = [
  "Nói với khách hàng về sếp của mình: dùng khiêm nhường ngữ và bỏ kính xưng — 「部長の田中は外出しております」 (không nói 田中部長はいらっしゃいません).",
  "Không dùng kính ngữ kép: 「おっしゃられる」 là sai (おっしゃる + られる).",
  "「ご苦労様です」 chỉ dùng từ trên xuống; với cấp trên dùng 「お疲れ様です」.",
  "「了解しました」 không đủ trang trọng với khách hàng — dùng 「承知しました」 / 「かしこまりました」.",
  "Tránh lạm dụng 「〜させていただく」: chỉ dùng khi hành động cần sự cho phép của đối phương.",
];

export const BUSINESS_MODULE: ProModule = {
  id: "business",
  title: "Tiếng Nhật thương mại",
  description: "Họp, thuyết trình, điện thoại, sắp xếp lịch, đàm phán, viết email và hệ thống kính ngữ.",
  topics: [
    {
      id: "meetings",
      title: "Cuộc họp",
      titleJp: "会議",
      summary: "Mở đầu, điều phối, phát biểu ý kiến, phản đối khéo léo và chốt cuộc họp.",
      vocabTag: "meetings",
      phrases: [
        { jp: "それでは、定刻になりましたので会議を始めます。", vi: "Đã đến giờ, chúng ta bắt đầu cuộc họp." },
        { jp: "本日の議題は三点です。", vi: "Hôm nay có ba nội dung nghị sự." },
        { jp: "ご意見のある方はいらっしゃいますか。", vi: "Có vị nào có ý kiến không ạ?" },
        { jp: "おっしゃることはごもっともですが…", vi: "Điều anh/chị nói rất có lý, nhưng…", note: "Mở đầu để phản đối nhẹ nhàng." },
        { jp: "一点、確認させていただいてもよろしいでしょうか。", vi: "Cho phép tôi xác nhận một điểm được không ạ?" },
        { jp: "時間が押しておりますので、次の議題に移ります。", vi: "Vì đã trễ giờ, chúng ta chuyển sang nội dung tiếp theo." },
        { jp: "本日の決定事項を確認させていただきます。", vi: "Tôi xin xác nhận lại những điều đã quyết định hôm nay." },
        { jp: "議事録は本日中に共有いたします。", vi: "Biên bản sẽ được chia sẻ trong hôm nay." },
      ],
      conversations: [
        {
          title: "Phản đối khéo léo trong cuộc họp",
          lines: [
            { speaker: "部長", jp: "来月からリリースを毎週に変更したいと考えています。", vi: "Tôi muốn từ tháng sau đổi sang release hàng tuần." },
            { speaker: "グエン", jp: "おっしゃることはごもっともですが、現状のテスト体制では品質の担保が難しいかと存じます。", vi: "Điều anh nói rất có lý, nhưng với hệ thống test hiện tại, e là khó đảm bảo chất lượng." },
            { speaker: "部長", jp: "なるほど。では、どうすればいいと思いますか。", vi: "Ra vậy. Vậy theo bạn nên làm thế nào?" },
            { speaker: "グエン", jp: "まずは自動テストを整備し、二週間ごとのリリースから始めてはいかがでしょうか。", vi: "Trước hết hoàn thiện test tự động, rồi bắt đầu từ release mỗi hai tuần thì sao ạ?" },
          ],
        },
      ],
    },
    {
      id: "presentations",
      title: "Thuyết trình",
      titleJp: "プレゼンテーション",
      summary: "Cấu trúc bài thuyết trình: mở đầu, chuyển ý, trình bày số liệu, hỏi đáp.",
      vocabTag: "presentations",
      phrases: [
        { jp: "本日はお時間をいただき、ありがとうございます。", vi: "Cảm ơn quý vị đã dành thời gian hôm nay." },
        { jp: "本日は〇〇についてご説明いたします。", vi: "Hôm nay tôi xin trình bày về ○○." },
        { jp: "まず結論から申し上げますと…", vi: "Xin nói kết luận trước…" },
        { jp: "こちらのグラフをご覧ください。", vi: "Xin hãy xem biểu đồ này." },
        { jp: "次に、具体的な施策についてご説明します。", vi: "Tiếp theo, tôi xin giải thích các biện pháp cụ thể." },
        { jp: "以上で発表を終わります。ご清聴ありがとうございました。", vi: "Bài trình bày đến đây là hết. Cảm ơn quý vị đã lắng nghe." },
        { jp: "貴重なご質問ありがとうございます。", vi: "Cảm ơn câu hỏi quý giá." },
        { jp: "その点については、確認のうえ改めてご回答いたします。", vi: "Về điểm đó, tôi xin kiểm tra và trả lời lại sau." },
      ],
      conversations: [
        {
          title: "Hỏi đáp sau thuyết trình",
          lines: [
            { speaker: "顧客", jp: "導入にかかる期間はどのくらいですか。", vi: "Thời gian triển khai mất bao lâu?" },
            { speaker: "発表者", jp: "貴重なご質問ありがとうございます。標準的な構成ですと、約三か月を想定しております。", vi: "Cảm ơn câu hỏi. Với cấu hình tiêu chuẩn, chúng tôi dự tính khoảng 3 tháng." },
            { speaker: "顧客", jp: "既存システムとの連携も含めてですか。", vi: "Bao gồm cả tích hợp với hệ thống hiện có chứ?" },
            { speaker: "発表者", jp: "連携の範囲によって変わりますので、確認のうえ改めてご回答いたします。", vi: "Tùy phạm vi tích hợp nên tôi xin kiểm tra và trả lời lại." },
          ],
        },
      ],
    },
    {
      id: "calls",
      title: "Điện thoại công việc",
      titleJp: "ビジネス電話",
      summary: "Nhận và gọi điện, chuyển máy, nhận lời nhắn, xử lý khi người phụ trách vắng.",
      vocabTag: "calls",
      phrases: [
        { jp: "お電話ありがとうございます。〇〇株式会社でございます。", vi: "Cảm ơn quý khách đã gọi. Đây là công ty ○○." },
        { jp: "恐れ入りますが、お名前をお伺いしてもよろしいでしょうか。", vi: "Xin lỗi, cho tôi hỏi quý danh được không ạ?" },
        { jp: "担当者におつなぎしますので、少々お待ちください。", vi: "Tôi xin nối máy đến người phụ trách, xin vui lòng đợi." },
        { jp: "あいにく〇〇は席を外しております。", vi: "Rất tiếc ○○ hiện không có ở chỗ." },
        { jp: "よろしければ、ご伝言を承りましょうか。", vi: "Nếu được, tôi xin nhận lời nhắn ạ." },
        { jp: "戻り次第、折り返しお電話するよう申し伝えます。", vi: "Ngay khi anh ấy quay lại, tôi sẽ nhắn gọi lại cho quý khách." },
        { jp: "お電話が少々遠いようなのですが…", vi: "Hình như tôi nghe không rõ lắm…" },
        { jp: "失礼いたします。", vi: "Tôi xin phép cúp máy." },
      ],
      conversations: [
        {
          title: "Gọi điện đến khách hàng",
          lines: [
            { speaker: "グエン", jp: "お世話になっております。ベトテックのグエンと申します。営業部の鈴木様はいらっしゃいますか。", vi: "Cảm ơn quý công ty đã luôn giúp đỡ. Tôi là Nguyễn của VietTech. Anh Suzuki phòng kinh doanh có ở đó không ạ?" },
            { speaker: "受付", jp: "申し訳ございません。鈴木はただいま外出しております。", vi: "Xin lỗi, anh Suzuki hiện đang ra ngoài." },
            { speaker: "グエン", jp: "さようでございますか。何時ごろお戻りになりますか。", vi: "Vậy ạ. Khoảng mấy giờ anh ấy quay lại ạ?" },
            { speaker: "受付", jp: "四時ごろの予定です。", vi: "Dự kiến khoảng 4 giờ." },
            { speaker: "グエン", jp: "では、その頃に改めてお電話いたします。失礼いたします。", vi: "Vậy tôi sẽ gọi lại vào khoảng thời gian đó. Xin phép cúp máy." },
          ],
        },
      ],
    },
    {
      id: "scheduling",
      title: "Sắp xếp lịch",
      titleJp: "日程調整",
      summary: "Đề xuất lịch, hỏi lịch trống, đổi lịch, xác nhận cuộc hẹn.",
      vocabTag: "scheduling",
      phrases: [
        { jp: "打ち合わせの日程を調整させていただきたく、ご連絡いたしました。", vi: "Tôi liên lạc để sắp xếp lịch buổi trao đổi." },
        { jp: "下記の日程でご都合はいかがでしょうか。", vi: "Lịch dưới đây có thuận tiện cho quý vị không ạ?" },
        { jp: "ご都合のよい日時をお知らせいただけますでしょうか。", vi: "Quý vị có thể cho biết thời gian thuận tiện được không ạ?" },
        { jp: "大変恐縮ですが、日程を変更していただくことは可能でしょうか。", vi: "Thật ngại quá, có thể đổi lịch được không ạ?" },
        { jp: "では、〇日〇時でお願いいたします。", vi: "Vậy xin chốt vào ○ giờ ngày ○." },
      ],
      conversations: [],
      templates: [
        {
          title: "Email đề xuất lịch họp",
          body: "件名：打ち合わせ日程のご相談\n\n株式会社〇〇\n営業部 鈴木様\n\nいつもお世話になっております。\nベトテックのグエンでございます。\n\n新システムの件につきまして、一度お打ち合わせの機会をいただきたく、ご連絡いたしました。\n下記の候補日の中で、ご都合のよい日時はございますでしょうか。\n\n・10月20日（月）14:00〜15:00\n・10月21日（火）10:00〜11:00\n・10月23日（木）16:00〜17:00\n\n上記以外でも調整いたしますので、お気軽にお申し付けください。\nお忙しいところ恐縮ですが、ご検討のほどよろしくお願いいたします。\n\n――――――――\nベトテック株式会社 グエン・ヴァン・A",
          vi: "Email đề xuất 3 khung giờ, ngỏ ý có thể điều chỉnh theo lịch khách.",
        },
      ],
    },
    {
      id: "negotiation",
      title: "Đàm phán",
      titleJp: "交渉",
      summary: "Trình bày điều kiện, nhượng bộ, từ chối khéo, đề xuất phương án thay thế.",
      vocabTag: "negotiation",
      phrases: [
        { jp: "ご予算感をお伺いしてもよろしいでしょうか。", vi: "Cho phép tôi hỏi mức ngân sách dự kiến của quý vị được không ạ?" },
        { jp: "その条件ですと、少々厳しいかと存じます。", vi: "Với điều kiện đó, e là hơi khó cho chúng tôi." },
        { jp: "代替案として、〇〇はいかがでしょうか。", vi: "Như một phương án thay thế, ○○ thì sao ạ?" },
        { jp: "長期契約をいただけるのであれば、検討の余地がございます。", vi: "Nếu ký hợp đồng dài hạn thì chúng tôi có thể cân nhắc." },
        { jp: "大変申し訳ございませんが、これ以上のお値引きはいたしかねます。", vi: "Thành thật xin lỗi, chúng tôi khó có thể giảm thêm." },
        { jp: "一度社内で検討させてください。", vi: "Cho phép chúng tôi thảo luận nội bộ trước." },
      ],
      conversations: [],
      roleplays: [
        {
          title: "Khách hàng yêu cầu giảm giá 20%",
          situation: "Khách hàng nói báo giá vượt ngân sách 20% và muốn giảm giá.",
          yourRole: "Bạn là đại diện công ty phát triển phần mềm.",
          goal: "Giữ lợi nhuận, đưa ra phương án thay thế (giảm phạm vi / chia giai đoạn) thay vì giảm giá trực tiếp.",
          hints: ["Cảm ơn và thể hiện sự thấu hiểu", "Giải thích lý do giá", "Đề xuất 代替案", "Hẹn thời gian trả lời"],
          modelAnswer: "ご事情は承知いたしました。ただ、品質を維持するためには全体のお値引きは難しいかと存じます。代替案として、優先度の低い機能を第二フェーズに回すことで、初期費用を二割ほど抑えることが可能です。詳細なお見積もりを明日中にお送りいたしますので、ご検討いただけますでしょうか。",
        },
      ],
    },
    {
      id: "email",
      title: "Viết email",
      titleJp: "ビジネスメール",
      summary: "Cấu trúc email: tiêu đề, người nhận, chào hỏi, nội dung, kết thư, chữ ký.",
      vocabTag: "email",
      phrases: [
        { jp: "いつもお世話になっております。", vi: "Cảm ơn quý vị đã luôn giúp đỡ. (mở đầu chuẩn)" },
        { jp: "突然のご連絡失礼いたします。", vi: "Xin lỗi vì liên lạc đột ngột. (lần đầu liên lạc)" },
        { jp: "〇〇の件でご連絡いたしました。", vi: "Tôi liên lạc về việc ○○." },
        { jp: "資料を添付いたしましたので、ご査収ください。", vi: "Tài liệu đã được đính kèm, xin vui lòng kiểm tra." },
        { jp: "ご不明な点がございましたら、お気軽にお問い合わせください。", vi: "Nếu có điểm nào chưa rõ, xin đừng ngần ngại liên hệ." },
        { jp: "お忙しいところ恐縮ですが、よろしくお願いいたします。", vi: "Biết quý vị bận rộn nhưng rất mong được giúp đỡ." },
        { jp: "取り急ぎ、ご連絡まで。", vi: "Trước mắt xin liên lạc như vậy." },
      ],
      conversations: [],
      templates: [
        {
          title: "Email xin lỗi vì chậm trễ",
          body: "件名：【お詫び】納品遅延について\n\n株式会社〇〇\n開発部 山本様\n\nいつもお世話になっております。\nベトテックのグエンでございます。\n\n本日納品予定でした〇〇機能につきまして、テスト工程で不具合が見つかったため、納品が遅れる見込みとなりました。\nご迷惑をおかけし、大変申し訳ございません。\n\n現在、修正対応を進めており、10月25日（金）中に納品いたします。\n今後はテスト計画を見直し、再発防止に努めてまいります。\n\n何卒よろしくお願い申し上げます。",
          vi: "Cấu trúc: thông báo sự việc → xin lỗi → phương án & thời hạn mới → biện pháp phòng tái phát.",
        },
      ],
    },
  ],
};
