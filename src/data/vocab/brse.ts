import type { VocabGroup } from "./types";

/** Tags match ModuleTopic.vocabTag in data/modules/brse.ts */
export const BRSE: VocabGroup[] = [
  {
    tag: "requirements",
    items: [
      ["ヒアリング", "ヒアリング", "buổi lấy yêu cầu (hearing)", "kata", "来週お客様へのヒアリングを行います。", "Tuần sau sẽ tiến hành lấy yêu cầu từ khách hàng."],
      ["要望", "ようぼう", "mong muốn, yêu cầu", "n", "お客様の要望を整理しました。", "Đã sắp xếp các yêu cầu của khách hàng."],
      ["業務フロー", "ぎょうむフロー", "luồng nghiệp vụ", "n", "現行の業務フローを教えていただけますか。", "Quý vị có thể cho biết luồng nghiệp vụ hiện tại không?"],
      ["現行システム", "げんこうシステム", "hệ thống hiện tại", "n", "現行システムの課題は何でしょうか。", "Vấn đề của hệ thống hiện tại là gì ạ?"],
      ["課題", "かだい", "vấn đề cần giải quyết", "n", "課題を一覧にまとめました。", "Đã tổng hợp danh sách các vấn đề."],
      ["前提条件", "ぜんていじょうけん", "điều kiện tiên quyết", "n", "前提条件を明確にしておきましょう。", "Hãy làm rõ điều kiện tiên quyết."],
      ["対象外", "たいしょうがい", "ngoài phạm vi", "n", "この機能は今回の対象外です。", "Chức năng này nằm ngoài phạm vi lần này."],
      ["認識合わせ", "にんしきあわせ", "thống nhất cách hiểu", "n", "仕様について認識合わせをさせてください。", "Cho phép tôi thống nhất cách hiểu về đặc tả."],
    ],
  },
  {
    tag: "client",
    items: [
      ["お客様", "おきゃくさま", "khách hàng", "n", "お客様からご質問をいただきました。", "Đã nhận được câu hỏi từ khách hàng."],
      ["窓口", "まどぐち", "đầu mối liên lạc", "n", "私が窓口を担当いたします。", "Tôi sẽ làm đầu mối liên lạc."],
      ["回答", "かいとう", "trả lời, giải đáp", "vs", "明日までに回答いたします。", "Tôi sẽ trả lời trước ngày mai."],
      ["問い合わせ", "といあわせ", "câu hỏi, liên hệ", "n", "お問い合わせありがとうございます。", "Cảm ơn quý vị đã liên hệ."],
      ["Q&A表", "キューアンドエーひょう", "bảng Q&A", "n", "質問はQ&A表に記載しました。", "Đã ghi câu hỏi vào bảng Q&A."],
      ["ご認識", "ごにんしき", "cách hiểu (của quý vị)", "n", "このご認識で相違ないでしょうか。", "Cách hiểu này không có gì khác biệt chứ ạ?"],
    ],
  },
  {
    tag: "defects",
    items: [
      ["障害票", "しょうがいひょう", "phiếu báo lỗi", "n", "障害票を起票しました。", "Đã tạo phiếu báo lỗi."],
      ["起票", "きひょう", "lập phiếu", "vs", "不具合を見つけたら起票してください。", "Nếu phát hiện lỗi hãy lập phiếu."],
      ["再現手順", "さいげんてじゅん", "các bước tái hiện", "n", "再現手順を記載してください。", "Hãy ghi rõ các bước tái hiện."],
      ["原因調査", "げんいんちょうさ", "điều tra nguyên nhân", "n", "現在、原因調査中です。", "Hiện đang điều tra nguyên nhân."],
      ["暫定対応", "ざんていたいおう", "xử lý tạm thời", "n", "暫定対応として設定を戻しました。", "Đã khôi phục cấu hình như xử lý tạm thời."],
      ["恒久対応", "こうきゅうたいおう", "xử lý triệt để", "n", "恒久対応は来週リリース予定です。", "Xử lý triệt để dự kiến phát hành tuần sau."],
      ["再発防止策", "さいはつぼうしさく", "biện pháp phòng tái phát", "n", "再発防止策をご報告いたします。", "Xin báo cáo biện pháp phòng tái phát."],
      ["重要度", "じゅうようど", "mức độ nghiêm trọng", "n", "重要度は「高」です。", "Mức độ nghiêm trọng là \"Cao\"."],
    ],
  },
  {
    tag: "reports",
    items: [
      ["日報", "にっぽう", "báo cáo ngày", "n", "毎日日報を提出してください。", "Hãy nộp báo cáo ngày mỗi ngày."],
      ["週報", "しゅうほう", "báo cáo tuần", "n", "週報は金曜日に送ります。", "Báo cáo tuần gửi vào thứ Sáu."],
      ["進捗率", "しんちょくりつ", "tỉ lệ tiến độ", "n", "現在の進捗率は八十パーセントです。", "Tỉ lệ tiến độ hiện tại là 80%."],
      ["遅延", "ちえん", "chậm trễ", "vs", "二日の遅延が発生しています。", "Đang chậm trễ 2 ngày."],
      ["挽回", "ばんかい", "lấy lại (tiến độ)", "vs", "休日出勤で遅れを挽回します。", "Sẽ lấy lại tiến độ bằng cách làm ngày nghỉ."],
      ["リスク", "リスク", "rủi ro", "kata", "リスクを早めに共有してください。", "Hãy chia sẻ rủi ro sớm."],
      ["懸念点", "けねんてん", "điểm đáng lo ngại", "n", "懸念点が二つあります。", "Có hai điểm đáng lo ngại."],
      ["対策", "たいさく", "biện pháp đối phó", "n", "対策を検討中です。", "Đang xem xét biện pháp đối phó."],
      ["予定通り", "よていどおり", "đúng kế hoạch", "exp", "作業は予定通り進んでいます。", "Công việc đang tiến triển đúng kế hoạch."],
    ],
  },
  {
    tag: "facilitation",
    items: [
      ["進行", "しんこう", "điều phối, tiến hành", "vs", "本日の会議は私が進行いたします。", "Hôm nay tôi sẽ điều phối cuộc họp."],
      ["宿題事項", "しゅくだいじこう", "việc cần làm sau họp (action items)", "n", "宿題事項を確認させてください。", "Cho phép tôi xác nhận các việc cần làm."],
      ["期限", "きげん", "thời hạn", "n", "期限は今週金曜日です。", "Thời hạn là thứ Sáu tuần này."],
      ["通訳", "つうやく", "phiên dịch", "vs", "私が通訳いたします。", "Tôi sẽ phiên dịch."],
      ["論点整理", "ろんてんせいり", "sắp xếp luận điểm", "n", "一度論点整理をさせてください。", "Cho phép tôi sắp xếp lại các luận điểm."],
    ],
  },
  {
    tag: "spec",
    items: [
      ["補足説明", "ほそくせつめい", "giải thích bổ sung", "n", "仕様について補足説明いたします。", "Tôi xin giải thích bổ sung về đặc tả."],
      ["条件分岐", "じょうけんぶんき", "rẽ nhánh điều kiện", "n", "ここで条件分岐が発生します。", "Tại đây phát sinh rẽ nhánh điều kiện."],
      ["例外処理", "れいがいしょり", "xử lý ngoại lệ", "n", "例外処理の仕様を確認したいです。", "Tôi muốn xác nhận đặc tả xử lý ngoại lệ."],
      ["入力チェック", "にゅうりょくチェック", "kiểm tra dữ liệu nhập", "n", "入力チェックのルールを教えてください。", "Xin cho biết quy tắc kiểm tra dữ liệu nhập."],
      ["仕様変更", "しようへんこう", "thay đổi đặc tả", "n", "仕様変更の影響を見積もります。", "Ước lượng ảnh hưởng của thay đổi đặc tả."],
      ["認識齟齬", "にんしきそご", "khác biệt trong cách hiểu", "n", "認識齟齬が発生しないように確認します。", "Xác nhận để không phát sinh hiểu sai."],
    ],
  },
];
