import type { ListeningExercise } from "@/types";

/**
 * Listening exercises. Each has an `audio` path under /public/audio/listening/.
 * Drop a recorded MP3 with that file name into the folder to use real audio;
 * otherwise the player falls back to the browser's offline Japanese
 * speech-synthesis voice, reading the dialog line by line.
 */
export const LISTENING: ListeningExercise[] = [
  {
    id: "l-n5-shop",
    level: "N5",
    category: "daily",
    title: "コンビニで",
    titleVi: "Ở cửa hàng tiện lợi",
    situation: "Một khách hàng mua đồ ở cửa hàng tiện lợi.",
    audio: "/audio/listening/l-n5-shop.mp3",
    lines: [
      { speaker: "店員", jp: "いらっしゃいませ。", vi: "Xin chào quý khách." },
      { speaker: "客", jp: "すみません、お{水|みず}はどこですか。", vi: "Xin lỗi, nước ở đâu ạ?" },
      { speaker: "店員", jp: "あちらの{冷蔵庫|れいぞうこ}にあります。", vi: "Ở tủ lạnh đằng kia ạ." },
      { speaker: "客", jp: "じゃあ、これとおにぎりを{二|ふた}つください。", vi: "Vậy cho tôi cái này và hai nắm cơm." },
      { speaker: "店員", jp: "{全部|ぜんぶ}で{四百五十円|よんひゃくごじゅうえん}です。{袋|ふくろ}はご{利用|りよう}ですか。", vi: "Tổng cộng 450 yên. Quý khách có dùng túi không?" },
      { speaker: "客", jp: "いいえ、{大丈夫|だいじょうぶ}です。", vi: "Không, không cần đâu ạ." },
    ],
    questions: [
      { id: "q1", prompt: "お客さんは全部でいくら払いますか。", options: ["350円", "400円", "450円", "540円"], answer: 2 },
      { id: "q2", prompt: "お客さんは袋をもらいますか。", options: ["はい、もらいます", "いいえ、もらいません", "二つもらいます", "わかりません"], answer: 1 },
    ],
  },
  {
    id: "l-n5-weekend",
    level: "N5",
    category: "dialog",
    title: "{週末|しゅうまつ}の{予定|よてい}",
    titleVi: "Kế hoạch cuối tuần",
    situation: "Hai người bạn nói chuyện về cuối tuần.",
    audio: "/audio/listening/l-n5-weekend.mp3",
    lines: [
      { speaker: "A", jp: "{週末|しゅうまつ}、{何|なに}をしますか。", vi: "Cuối tuần bạn làm gì?" },
      { speaker: "B", jp: "{土曜日|どようび}はアルバイトです。{日曜日|にちようび}は{暇|ひま}です。", vi: "Thứ Bảy tôi đi làm thêm. Chủ nhật thì rảnh." },
      { speaker: "A", jp: "じゃあ、{日曜日|にちようび}に{一緒|いっしょ}に{映画|えいが}を{見|み}ませんか。", vi: "Vậy Chủ nhật cùng đi xem phim không?" },
      { speaker: "B", jp: "いいですね。{何時|なんじ}に{会|あ}いましょうか。", vi: "Hay đấy. Mấy giờ gặp nhau?" },
      { speaker: "A", jp: "{二時|にじ}に{駅|えき}の{前|まえ}はどうですか。", vi: "2 giờ trước ga thì sao?" },
      { speaker: "B", jp: "わかりました。", vi: "Được rồi." },
    ],
    questions: [
      { id: "q1", prompt: "二人はいつ映画を見ますか。", options: ["土曜日", "日曜日", "金曜日", "月曜日"], answer: 1 },
      { id: "q2", prompt: "どこで会いますか。", options: ["映画館", "駅の前", "学校", "Bさんの家"], answer: 1 },
    ],
  },
  {
    id: "l-n4-doctor",
    level: "N4",
    category: "daily",
    title: "{病院|びょういん}で",
    titleVi: "Ở bệnh viện",
    situation: "Bệnh nhân khám bệnh.",
    audio: "/audio/listening/l-n4-doctor.mp3",
    lines: [
      { speaker: "医者", jp: "どうしましたか。", vi: "Bạn bị sao vậy?" },
      { speaker: "患者", jp: "{昨日|きのう}の{夜|よる}から{頭|あたま}が{痛|いた}くて、{熱|ねつ}もあるんです。", vi: "Từ tối qua tôi bị đau đầu, còn bị sốt nữa." },
      { speaker: "医者", jp: "そうですか。{風邪|かぜ}ですね。{薬|くすり}を{出|だ}しますから、{食後|しょくご}に{飲|の}んでください。", vi: "Vậy à. Cảm rồi. Tôi kê thuốc, hãy uống sau bữa ăn." },
      { speaker: "患者", jp: "{仕事|しごと}に{行|い}ってもいいですか。", vi: "Tôi đi làm được không ạ?" },
      { speaker: "医者", jp: "{二日|ふつか}ぐらいは{休|やす}んだほうがいいですよ。", vi: "Nên nghỉ khoảng hai ngày." },
    ],
    questions: [
      { id: "q1", prompt: "患者はいつから具合が悪いですか。", options: ["今朝から", "昨日の夜から", "二日前から", "先週から"], answer: 1 },
      { id: "q2", prompt: "医者は何と言いましたか。", options: ["すぐ仕事に行ってもいい", "二日ぐらい休んだほうがいい", "入院しなければならない", "薬は飲まなくてもいい"], answer: 1 },
    ],
  },
  {
    id: "l-n4-office-request",
    level: "N4",
    category: "office",
    title: "{先輩|せんぱい}へのお{願|ねが}い",
    titleVi: "Nhờ đàn anh giúp đỡ",
    situation: "Nhân viên mới nhờ đàn anh kiểm tra tài liệu.",
    audio: "/audio/listening/l-n4-office-request.mp3",
    lines: [
      { speaker: "新人", jp: "{山田|やまだ}さん、ちょっとよろしいですか。", vi: "Anh Yamada, em làm phiền một chút được không ạ?" },
      { speaker: "山田", jp: "うん、どうしたの？", vi: "Ừ, sao thế?" },
      { speaker: "新人", jp: "{明日|あした}の{会議|かいぎ}の{資料|しりょう}を{作|つく}ったんですが、{見|み}ていただけませんか。", vi: "Em đã làm tài liệu cho cuộc họp ngày mai, anh xem giúp em được không ạ?" },
      { speaker: "山田", jp: "いいよ。でも{今|いま}ちょっと{忙|いそが}しいから、{三時|さんじ}ごろでもいい？", vi: "Được. Nhưng giờ anh hơi bận, khoảng 3 giờ được không?" },
      { speaker: "新人", jp: "はい、{大丈夫|だいじょうぶ}です。よろしくお{願|ねが}いします。", vi: "Vâng, được ạ. Nhờ anh nhé." },
    ],
    questions: [
      { id: "q1", prompt: "山田さんはいつ資料を見ますか。", options: ["今すぐ", "三時ごろ", "明日の朝", "会議のあと"], answer: 1 },
    ],
  },
  {
    id: "l-n3-meeting-schedule",
    level: "N3",
    category: "meeting",
    title: "{会議|かいぎ}の{日程変更|にっていへんこう}",
    titleVi: "Thay đổi lịch họp",
    situation: "Trưởng nhóm thông báo thay đổi lịch họp.",
    audio: "/audio/listening/l-n3-meeting-schedule.mp3",
    lines: [
      { speaker: "リーダー", jp: "{皆|みな}さん、{来週|らいしゅう}の{定例会議|ていれいかいぎ}ですが、{部長|ぶちょう}の{出張|しゅっちょう}が{入|はい}ったため、{水曜日|すいようび}から{木曜日|もくようび}に{変更|へんこう}になりました。", vi: "Mọi người, cuộc họp định kỳ tuần sau, do trưởng phòng có lịch công tác nên đổi từ thứ Tư sang thứ Năm." },
      { speaker: "社員", jp: "{時間|じかん}は{同|おな}じですか。", vi: "Giờ có giữ nguyên không ạ?" },
      { speaker: "リーダー", jp: "いえ、{午前|ごぜん}は{会議室|かいぎしつ}が{空|あ}いていないので、{午後|ごご}{二時|にじ}からです。", vi: "Không, buổi sáng phòng họp không trống nên sẽ từ 2 giờ chiều." },
      { speaker: "社員", jp: "{分|わ}かりました。{資料|しりょう}はいつまでに{準備|じゅんび}すればいいですか。", vi: "Tôi hiểu rồi. Tài liệu cần chuẩn bị trước khi nào ạ?" },
      { speaker: "リーダー", jp: "{前日|ぜんじつ}の{夕方|ゆうがた}までに{共有|きょうゆう}フォルダに{入|い}れておいてください。", vi: "Hãy để sẵn vào thư mục chung trước chiều tối hôm trước." },
    ],
    questions: [
      { id: "q1", prompt: "会議はいつになりましたか。", options: ["水曜日の午前", "水曜日の午後", "木曜日の午前", "木曜日の午後二時"], answer: 3 },
      { id: "q2", prompt: "資料の締め切りはいつですか。", options: ["水曜日の夕方", "木曜日の朝", "会議の直前", "金曜日"], answer: 0 },
      { id: "q3", prompt: "会議の日が変わった理由は何ですか。", options: ["会議室が空いていない", "部長の出張", "祝日", "資料が間に合わない"], answer: 1 },
    ],
  },
  {
    id: "l-n2-complaint-call",
    level: "N2",
    category: "business-call",
    title: "お{客様|きゃくさま}からのクレーム{電話|でんわ}",
    titleVi: "Cuộc gọi khiếu nại từ khách hàng",
    situation: "Khách hàng gọi điện phàn nàn về việc giao hàng chậm.",
    audio: "/audio/listening/l-n2-complaint-call.mp3",
    lines: [
      { speaker: "社員", jp: "お{電話|でんわ}ありがとうございます。ABC{商事|しょうじ}でございます。", vi: "Cảm ơn quý khách đã gọi. Đây là công ty thương mại ABC." },
      { speaker: "客", jp: "{先週|せんしゅう}{注文|ちゅうもん}した{商品|しょうひん}がまだ{届|とど}いていないんですが。", vi: "Hàng tôi đặt tuần trước vẫn chưa đến." },
      { speaker: "社員", jp: "{大変|たいへん}{申|もう}し{訳|わけ}ございません。お{手数|てすう}ですが、{注文番号|ちゅうもんばんごう}をお{伺|うかが}いできますでしょうか。", vi: "Thành thật xin lỗi quý khách. Xin phiền quý khách cho biết mã đơn hàng ạ." },
      { speaker: "客", jp: "{A|エー}の{一二三四|いちにさんよん}です。", vi: "A-1234." },
      { speaker: "社員", jp: "{確認|かくにん}いたしました。{倉庫|そうこ}の{手違|てちが}いで{発送|はっそう}が{遅|おく}れておりました。{本日中|ほんじつちゅう}に{発送|はっそう}し、{明日|あす}の{午前中|ごぜんちゅう}にお{届|とど}けいたします。", vi: "Tôi đã kiểm tra. Do sơ suất ở kho nên việc gửi hàng bị chậm. Chúng tôi sẽ gửi trong hôm nay và giao trong buổi sáng ngày mai." },
      { speaker: "客", jp: "{分|わ}かりました。{今度|こんど}は{気|き}をつけてくださいね。", vi: "Được rồi. Lần sau hãy cẩn thận nhé." },
    ],
    questions: [
      { id: "q1", prompt: "商品が遅れた原因は何ですか。", options: ["客の住所の間違い", "倉庫の手違い", "天候", "在庫切れ"], answer: 1 },
      { id: "q2", prompt: "商品はいつ届きますか。", options: ["今日の午後", "明日の午前中", "明後日", "来週"], answer: 1 },
    ],
  },
  {
    id: "l-n1-negotiation",
    level: "N1",
    category: "meeting",
    title: "{価格交渉|かかくこうしょう}",
    titleVi: "Đàm phán giá",
    situation: "Đại diện hai công ty đàm phán về giá dự án phát triển.",
    audio: "/audio/listening/l-n1-negotiation.mp3",
    lines: [
      { speaker: "顧客", jp: "{率直|そっちょく}に{申|もう}し{上|あ}げますと、{今回|こんかい}のお{見積|みつ}もりは{予算|よさん}を{二割|にわり}ほど{上回|うわまわ}っておりまして。", vi: "Nói thẳng thì báo giá lần này vượt ngân sách của chúng tôi khoảng 20%." },
      { speaker: "ベンダー", jp: "さようでございますか。{品質|ひんしつ}を{落|お}とさずにとなりますと、{全体|ぜんたい}の{値引|ねび}きはいささか{難|むずか}しいかと{存|ぞん}じます。", vi: "Vậy ạ. Nếu không giảm chất lượng thì giảm giá toàn bộ e là hơi khó." },
      { speaker: "ベンダー", jp: "ただ、{管理画面|かんりがめん}の{一部機能|いちぶきのう}を{第二|だいに}フェーズに{回|まわ}していただければ、{初期費用|しょきひよう}を{抑|おさ}えることは{可能|かのう}です。", vi: "Tuy nhiên, nếu quý công ty chuyển một số chức năng màn hình quản trị sang giai đoạn 2, chúng tôi có thể giảm chi phí ban đầu." },
      { speaker: "顧客", jp: "なるほど。{運用開始|うんようかいし}に{支障|ししょう}がない{範囲|はんい}であれば、{前向|まえむ}きに{検討|けんとう}いたします。{社内|しゃない}で{持|も}ち{帰|かえ}らせてください。", vi: "Ra vậy. Nếu trong phạm vi không ảnh hưởng đến việc vận hành thì chúng tôi sẽ xem xét tích cực. Cho phép chúng tôi mang về bàn nội bộ." },
    ],
    questions: [
      { id: "q1", prompt: "ベンダーが提案したのはどれですか。", options: ["全体を二割値引きする", "品質を下げる", "一部機能を第二フェーズに回す", "契約を取りやめる"], answer: 2 },
      { id: "q2", prompt: "顧客の最終的な反応はどれですか。", options: ["その場で承諾した", "断った", "社内で検討する", "怒った"], answer: 2 },
    ],
  },
  {
    id: "l-biz-phone-absent",
    level: "business",
    category: "business-call",
    title: "{担当者不在|たんとうしゃふざい}の{電話対応|でんわたいおう}",
    titleVi: "Nghe điện thoại khi người phụ trách vắng mặt",
    situation: "Khách hàng gọi tìm anh Tanaka nhưng anh ấy đang họp.",
    audio: "/audio/listening/l-biz-phone-absent.mp3",
    lines: [
      { speaker: "受付", jp: "お{電話|でんわ}ありがとうございます。{株式会社|かぶしきがいしゃ}サクラでございます。", vi: "Cảm ơn quý khách đã gọi. Đây là công ty cổ phần Sakura." },
      { speaker: "客", jp: "いつもお{世話|せわ}になっております。{富士|ふじ}システムの{佐藤|さとう}と{申|もう}します。{田中様|たなかさま}はいらっしゃいますか。", vi: "Cảm ơn quý công ty đã luôn giúp đỡ. Tôi là Sato của Fuji System. Anh Tanaka có ở đó không ạ?" },
      { speaker: "受付", jp: "{申|もう}し{訳|わけ}ございません。あいにく{田中|たなか}はただいま{会議中|かいぎちゅう}でございます。{十一時|じゅういちじ}には{終|お}わる{予定|よてい}ですが、{終|お}わり{次第|しだい}、{折|お}り{返|かえ}しお{電話|でんわ}いたしましょうか。", vi: "Thành thật xin lỗi. Rất tiếc anh Tanaka hiện đang họp. Dự kiến 11 giờ xong, ngay khi xong tôi sẽ bảo anh ấy gọi lại cho quý khách được không ạ?" },
      { speaker: "客", jp: "はい、お{願|ねが}いします。{番号|ばんごう}は{〇三|ゼロさん}の{一二三四|いちにさんよん}の{五六七八|ごろくななはち}です。", vi: "Vâng, nhờ chị. Số điện thoại là 03-1234-5678." },
      { speaker: "受付", jp: "{復唱|ふくしょう}いたします。{〇三|ゼロさん}の{一二三四|いちにさんよん}の{五六七八|ごろくななはち}、{富士|ふじ}システムの{佐藤様|さとうさま}ですね。{確|たし}かに{申|もう}し{伝|つた}えます。", vi: "Tôi xin nhắc lại: 03-1234-5678, anh Sato của Fuji System. Tôi chắc chắn sẽ chuyển lời." },
    ],
    questions: [
      { id: "q1", prompt: "田中さんは今何をしていますか。", options: ["外出中", "会議中", "休暇中", "電話中"], answer: 1 },
      { id: "q2", prompt: "受付の人は田中さんについて話すとき、なぜ「田中様」ではなく「田中」と言ったのですか。", options: ["間違えたから", "社外の人に自社の人を話すときは敬称をつけないから", "田中さんが部下だから", "親しいから"], answer: 1 },
    ],
  },
  {
    id: "l-brse-daily-standup",
    level: "brse",
    category: "meeting",
    title: "{朝会|あさかい}での{進捗報告|しんちょくほうこく}",
    titleVi: "Báo cáo tiến độ trong họp sáng",
    situation: "BrSE báo cáo tiến độ của team offshore cho khách hàng Nhật.",
    audio: "/audio/listening/l-brse-daily-standup.mp3",
    lines: [
      { speaker: "BrSE", jp: "おはようございます。オフショアチームの{進捗|しんちょく}をご{報告|ほうこく}いたします。", vi: "Chào buổi sáng. Tôi xin báo cáo tiến độ của team offshore." },
      { speaker: "BrSE", jp: "{昨日|さくじつ}は{会員登録画面|かいいんとうろくがめん}の{実装|じっそう}が{完了|かんりょう}し、{現在|げんざい}{単体|たんたい}テストを{実施|じっし}しております。", vi: "Hôm qua đã hoàn thành triển khai màn hình đăng ký thành viên, hiện đang chạy unit test." },
      { speaker: "BrSE", jp: "{一点|いってん}{懸念|けねん}がございまして、{決済|けっさい}APIの{仕様書|しようしょ}がまだ{届|とど}いていないため、{決済機能|けっさいきのう}の{着手|ちゃくしゅ}が{遅|おく}れる{見込|みこ}みです。", vi: "Có một điểm đáng lo: vì chưa nhận được tài liệu đặc tả API thanh toán nên dự kiến việc bắt đầu chức năng thanh toán sẽ bị chậm." },
      { speaker: "顧客", jp: "{分|わ}かりました。{仕様書|しようしょ}は{本日中|ほんじつちゅう}に{送|おく}るよう、{担当|たんとう}に{確認|かくにん}します。", vi: "Tôi hiểu rồi. Tôi sẽ xác nhận với người phụ trách để gửi tài liệu trong hôm nay." },
      { speaker: "BrSE", jp: "ありがとうございます。{受領|じゅりょう}{次第|しだい}、{影響|えいきょう}を{確認|かくにん}してご{報告|ほうこく}いたします。", vi: "Cảm ơn anh. Ngay khi nhận được, tôi sẽ kiểm tra ảnh hưởng và báo cáo." },
    ],
    questions: [
      { id: "q1", prompt: "現在の作業は何ですか。", options: ["決済機能の実装", "会員登録画面の単体テスト", "仕様書の作成", "結合テスト"], answer: 1 },
      { id: "q2", prompt: "懸念点の原因は何ですか。", options: ["メンバー不足", "決済APIの仕様書が届いていない", "サーバー障害", "テストの不具合"], answer: 1 },
    ],
  },
  {
    id: "l-it-incident",
    level: "it",
    category: "office",
    title: "{障害対応|しょうがいたいおう}の{打|う}ち{合|あ}わせ",
    titleVi: "Họp xử lý sự cố",
    situation: "Kỹ sư hạ tầng và trưởng nhóm phát triển trao đổi về sự cố máy chủ.",
    audio: "/audio/listening/l-it-incident.mp3",
    lines: [
      { speaker: "リーダー", jp: "{監視|かんし}アラートが{出|で}ていますが、{状況|じょうきょう}はどうですか。", vi: "Cảnh báo giám sát đang bật, tình hình thế nào?" },
      { speaker: "インフラ", jp: "APIサーバーのCPU{使用率|しようりつ}が{九十|きゅうじゅう}%を{超|こ}えています。{十時|じゅうじ}のリリース{以降|いこう}です。", vi: "CPU của API server vượt 90%. Từ sau đợt release lúc 10 giờ." },
      { speaker: "リーダー", jp: "{今回|こんかい}のリリースで{検索処理|けんさくしょり}を{変更|へんこう}しましたね。{切|き}り{戻|もど}しは{可能|かのう}ですか。", vi: "Release lần này có thay đổi xử lý tìm kiếm nhỉ. Có rollback được không?" },
      { speaker: "インフラ", jp: "はい、{手順書|てじゅんしょ}があるので{十五分|じゅうごふん}ほどで{戻|もど}せます。", vi: "Được, có tài liệu quy trình nên khoảng 15 phút là rollback xong." },
      { speaker: "リーダー", jp: "では{先|さき}に{切|き}り{戻|もど}して、{原因調査|げんいんちょうさ}はその{後|あと}にしましょう。お{客様|きゃくさま}への{第一報|だいいっぽう}は{私|わたし}が{送|おく}ります。", vi: "Vậy rollback trước, điều tra nguyên nhân sau. Tôi sẽ gửi báo cáo đầu tiên cho khách hàng." },
    ],
    questions: [
      { id: "q1", prompt: "問題はいつから発生していますか。", options: ["昨夜から", "十時のリリース以降", "今朝の八時から", "先週から"], answer: 1 },
      { id: "q2", prompt: "最初に何をすることになりましたか。", options: ["原因を調査する", "サーバーを増やす", "切り戻す", "お客様に電話する"], answer: 2 },
    ],
  },
  {
    id: "l-native-news",
    level: "native",
    category: "news",
    title: "ニュース：{働|はたら}き{方改革|かたかいかく}",
    titleVi: "Bản tin: Cải cách cách làm việc",
    situation: "Bản tin thời sự với tốc độ tự nhiên.",
    audio: "/audio/listening/l-native-news.mp3",
    lines: [
      { speaker: "アナウンサー", jp: "{政府|せいふ}は{本日|ほんじつ}、{長時間労働|ちょうじかんろうどう}の{是正|ぜせい}に{向|む}けた{新|あら}たな{指針|ししん}を{取|と}りまとめました。", vi: "Hôm nay chính phủ đã tổng hợp chỉ thị mới hướng tới khắc phục tình trạng làm việc quá giờ." },
      { speaker: "アナウンサー", jp: "{指針|ししん}では、{勤務間|きんむかん}インターバル{制度|せいど}の{導入|どうにゅう}を{企業|きぎょう}に{促|うなが}すほか、{副業|ふくぎょう}の{容認|ようにん}についても{言及|げんきゅう}しています。", vi: "Chỉ thị khuyến khích doanh nghiệp áp dụng chế độ khoảng nghỉ giữa các ca làm việc, ngoài ra còn đề cập đến việc chấp nhận nghề phụ." },
      { speaker: "アナウンサー", jp: "{一方|いっぽう}、{中小企業|ちゅうしょうきぎょう}からは「{人手不足|ひとでぶそく}の{中|なか}で{対応|たいおう}は{困難|こんなん}だ」との{声|こえ}も{上|あ}がっており、{実効性|じっこうせい}が{問|と}われそうです。", vi: "Mặt khác, các doanh nghiệp vừa và nhỏ lên tiếng “khó đáp ứng trong bối cảnh thiếu nhân lực”, tính hiệu quả thực tế có lẽ sẽ bị chất vấn." },
    ],
    questions: [
      { id: "q1", prompt: "指針で企業に促しているのは何ですか。", options: ["残業の増加", "勤務間インターバル制度の導入", "副業の禁止", "賃金の引き下げ"], answer: 1 },
      { id: "q2", prompt: "中小企業の反応はどうですか。", options: ["全面的に賛成している", "人手不足で対応が難しいと言っている", "すでに導入済みだ", "関心がない"], answer: 1 },
    ],
  },
];

export const LISTENING_BY_ID = new Map(LISTENING.map((l) => [l.id, l]));

export const LISTENING_CATEGORY_LABEL: Record<string, string> = {
  daily: "Hội thoại hằng ngày",
  dialog: "Đối thoại",
  office: "Văn phòng",
  meeting: "Cuộc họp",
  "business-call": "Điện thoại công việc",
  news: "Bản tin",
};
