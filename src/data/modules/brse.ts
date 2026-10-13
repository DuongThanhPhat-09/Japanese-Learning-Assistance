import type { ProModule } from "@/types";

export const BRSE_MODULE: ProModule = {
  id: "brse",
  title: "Tiếng Nhật BrSE",
  description: "Chương trình dành cho Bridge System Engineer: lấy yêu cầu, giao tiếp khách hàng, báo cáo lỗi/tiến độ/rủi ro, điều phối họp, giải thích đặc tả.",
  topics: [
    {
      id: "requirements",
      title: "Lấy yêu cầu",
      titleJp: "要件ヒアリング",
      summary: "Hỏi đúng câu hỏi, làm rõ phạm vi, xác nhận cách hiểu.",
      vocabTag: "requirements",
      phrases: [
        { jp: "現行の業務フローについて教えていただけますか。", vi: "Quý vị có thể cho biết luồng nghiệp vụ hiện tại không ạ?" },
        { jp: "現在、どのような課題をお持ちでしょうか。", vi: "Hiện tại quý vị đang gặp những vấn đề gì ạ?" },
        { jp: "この機能は誰が、どのタイミングで使いますか。", vi: "Chức năng này ai sử dụng, vào lúc nào ạ?" },
        { jp: "今回のスコープに含まれるという認識でよろしいでしょうか。", vi: "Hiểu là nằm trong phạm vi lần này có đúng không ạ?" },
        { jp: "優先度をつけていただけますと助かります。", vi: "Nếu quý vị đánh độ ưu tiên giúp thì chúng tôi rất cảm kích." },
      ],
      conversations: [
        {
          title: "Buổi hearing yêu cầu",
          lines: [
            { speaker: "BrSE", jp: "本日はお時間をいただきありがとうございます。在庫管理システムの要件についてお伺いします。", vi: "Cảm ơn quý vị đã dành thời gian. Tôi xin hỏi về yêu cầu hệ thống quản lý kho." },
            { speaker: "顧客", jp: "今はExcelで管理していて、入力ミスが多いんです。", vi: "Hiện đang quản lý bằng Excel, nhập sai rất nhiều." },
            { speaker: "BrSE", jp: "入力ミスは主にどの項目で発生していますか。", vi: "Lỗi nhập chủ yếu xảy ra ở mục nào ạ?" },
            { speaker: "顧客", jp: "商品コードと数量ですね。", vi: "Mã sản phẩm và số lượng." },
            { speaker: "BrSE", jp: "承知しました。では、バーコード読み取りによる入力を想定してもよろしいでしょうか。", vi: "Tôi hiểu. Vậy chúng tôi có thể giả định nhập bằng quét mã vạch được không ạ?" },
            { speaker: "顧客", jp: "はい、それができると助かります。", vi: "Vâng, làm được vậy thì tốt quá." },
          ],
        },
      ],
      roleplays: [
        {
          title: "Làm rõ yêu cầu mơ hồ",
          situation: "Khách hàng nói: 「検索をもっと便利にしてほしい」 (muốn tìm kiếm tiện hơn).",
          yourRole: "BrSE phụ trách dự án.",
          goal: "Biến yêu cầu mơ hồ thành yêu cầu cụ thể có thể ước lượng.",
          hints: ["Hỏi hiện tại bất tiện ở điểm nào", "Hỏi điều kiện tìm kiếm mong muốn", "Hỏi số lượng dữ liệu / tốc độ mong đợi", "Tóm tắt lại để xác nhận"],
          modelAnswer: "承知しました。より具体的に把握したいので、いくつか質問させてください。現在の検索で、特にご不便を感じている点はどこでしょうか。また、追加したい検索条件（例えば日付範囲や担当者など）はございますか。検索対象の件数や、期待される表示速度も教えていただけますと助かります。いただいた内容をまとめて、明日までに要件案をお送りいたします。",
        },
      ],
    },
    {
      id: "client",
      title: "Giao tiếp khách hàng",
      titleJp: "顧客コミュニケーション",
      summary: "Trả lời câu hỏi, xác nhận cách hiểu, đàm phán thời hạn, xin lỗi.",
      vocabTag: "client",
      phrases: [
        { jp: "ご質問の件、開発チームに確認のうえ、本日中にご回答いたします。", vi: "Về câu hỏi của quý vị, tôi sẽ xác nhận với team phát triển và trả lời trong hôm nay." },
        { jp: "念のため、私の理解をお伝えしてもよろしいでしょうか。", vi: "Để chắc chắn, cho phép tôi trình bày cách hiểu của mình được không ạ?" },
        { jp: "Q&A表に記載しましたので、ご回答いただけますと幸いです。", vi: "Tôi đã ghi vào bảng Q&A, rất mong quý vị trả lời." },
        { jp: "スケジュールに影響が出る可能性がございます。", vi: "Có khả năng ảnh hưởng đến lịch trình." },
        { jp: "ご迷惑をおかけして申し訳ございません。", vi: "Thành thật xin lỗi vì đã gây phiền hà." },
      ],
      conversations: [
        {
          title: "Khách hàng yêu cầu thay đổi đặc tả gấp",
          lines: [
            { speaker: "顧客", jp: "急ですが、出力するCSVに項目を二つ追加してもらえますか。リリースは予定通りで。", vi: "Gấp quá, nhưng có thể thêm hai cột vào CSV xuất ra không? Release vẫn đúng kế hoạch." },
            { speaker: "BrSE", jp: "承知しました。影響範囲を確認したいので、追加項目の詳細を教えていただけますか。", vi: "Tôi hiểu rồi. Để kiểm tra phạm vi ảnh hưởng, quý vị cho biết chi tiết các cột thêm được không?" },
            { speaker: "顧客", jp: "注文日と担当者名です。", vi: "Ngày đặt hàng và tên người phụ trách." },
            { speaker: "BrSE", jp: "ありがとうございます。チームと工数を確認し、本日17時までにリリースへの影響をご報告いたします。", vi: "Cảm ơn. Tôi sẽ xác nhận công số với team và báo cáo ảnh hưởng tới release trước 17 giờ hôm nay." },
          ],
        },
      ],
    },
    {
      id: "defects",
      title: "Báo cáo lỗi",
      titleJp: "障害報告",
      summary: "Báo cáo sự cố: hiện tượng, ảnh hưởng, nguyên nhân, xử lý tạm thời, xử lý triệt để, phòng tái phát.",
      vocabTag: "defects",
      phrases: [
        { jp: "本番環境で障害が発生しましたので、第一報をお送りします。", vi: "Đã phát sinh sự cố trên production, xin gửi báo cáo đầu tiên." },
        { jp: "現在、原因を調査しております。", vi: "Hiện đang điều tra nguyên nhân." },
        { jp: "暫定対応として、該当機能を一時停止しました。", vi: "Như xử lý tạm thời, đã tạm dừng chức năng liên quan." },
        { jp: "恒久対応は来週のリリースで実施予定です。", vi: "Xử lý triệt để dự kiến thực hiện trong bản release tuần sau." },
        { jp: "再発防止策として、レビュー観点を追加いたします。", vi: "Biện pháp phòng tái phát: bổ sung tiêu chí review." },
      ],
      conversations: [],
      templates: [
        {
          title: "Báo cáo sự cố (障害報告書)",
          body: "件名：【障害報告】注文確定時のエラーについて（第二報）\n\n〇〇株式会社\n山田様\n\nいつもお世話になっております。ベトテックのグエンです。\n標記の件につきまして、下記の通りご報告いたします。\n\n1. 発生日時：2026年10月12日 14:05〜14:40\n2. 現象：注文確定ボタン押下時に500エラーが発生\n3. 影響範囲：該当時間帯の注文 37件が未確定\n4. 原因：在庫数更新処理において、同時更新時の排他制御が不足していたため\n5. 暫定対応：14:40に該当処理をロールバックし、復旧済み\n6. 恒久対応：排他制御を追加した修正版を10月15日にリリース予定\n7. 再発防止策：同時実行を想定したテストケースを追加し、レビュー観点に排他制御を追加\n\nこの度はご迷惑をおかけし、誠に申し訳ございませんでした。\n引き続きよろしくお願いいたします。",
          vi: "Cấu trúc 7 mục chuẩn của báo cáo sự cố: thời gian, hiện tượng, phạm vi ảnh hưởng, nguyên nhân, xử lý tạm thời, xử lý triệt để, phòng tái phát.",
        },
      ],
      roleplays: [
        {
          title: "Báo cáo sự cố qua điện thoại",
          situation: "Lỗi đăng nhập trên production, khoảng 30% người dùng bị ảnh hưởng. Nguyên nhân chưa rõ.",
          yourRole: "BrSE gọi điện báo cáo đầu tiên (第一報) cho khách hàng.",
          goal: "Báo nhanh, chính xác: hiện tượng, phạm vi, tình hình hiện tại, thời điểm báo cáo tiếp theo.",
          hints: ["Xin lỗi ngắn gọn", "Nói sự thật đã biết, không suy đoán", "Hẹn giờ báo cáo tiếp theo"],
          modelAnswer: "お忙しいところ失礼いたします。ベトテックのグエンです。本番環境でログイン障害が発生しておりますので、第一報としてご連絡いたしました。10時15分頃から、全体の約3割のユーザーがログインできない状態です。現在、原因を調査しております。11時までに状況を改めてご報告いたします。ご迷惑をおかけして申し訳ございません。",
        },
      ],
    },
    {
      id: "daily-report",
      title: "Báo cáo ngày",
      titleJp: "日報",
      summary: "Việc đã làm, việc ngày mai, vấn đề, câu hỏi.",
      vocabTag: "reports",
      phrases: [
        { jp: "本日の作業内容をご報告いたします。", vi: "Xin báo cáo nội dung công việc hôm nay." },
        { jp: "明日は結合テストに着手する予定です。", vi: "Ngày mai dự kiến bắt đầu kiểm thử tích hợp." },
        { jp: "特に問題はございません。", vi: "Không có vấn đề gì đặc biệt." },
      ],
      conversations: [],
      templates: [
        {
          title: "Mẫu báo cáo ngày (日報)",
          body: "件名：【日報】10月13日 グエン\n\nお疲れ様です。グエンです。\n本日の日報をお送りします。\n\n■ 本日の作業\n・会員登録APIの実装（完了）\n・単体テスト作成（進捗70%）\n\n■ 明日の予定\n・単体テスト完了、コードレビュー対応\n\n■ 課題・懸念点\n・メール送信サービスの検証環境が未準備のため、送信テストができていません。\n\n■ 質問事項\n・パスワード再設定メールの文面について、ご指示いただけますでしょうか。\n\n以上、よろしくお願いいたします。",
          vi: "4 phần: việc hôm nay / kế hoạch ngày mai / vấn đề / câu hỏi.",
        },
      ],
    },
    {
      id: "progress-report",
      title: "Báo cáo tiến độ",
      titleJp: "進捗報告",
      summary: "Tỉ lệ tiến độ, chậm trễ, nguyên nhân, biện pháp lấy lại tiến độ.",
      vocabTag: "reports",
      phrases: [
        { jp: "全体の進捗率は75%で、予定通り進んでおります。", vi: "Tiến độ tổng thể 75%, đúng kế hoạch." },
        { jp: "結合テストに2日の遅延が発生しております。", vi: "Kiểm thử tích hợp đang chậm 2 ngày." },
        { jp: "要員を1名追加し、来週中に挽回する見込みです。", vi: "Dự kiến bổ sung 1 người và lấy lại tiến độ trong tuần sau." },
        { jp: "マイルストーンへの影響はございません。", vi: "Không ảnh hưởng tới milestone." },
      ],
      conversations: [
        {
          title: "Báo cáo chậm tiến độ",
          lines: [
            { speaker: "BrSE", jp: "今週の進捗をご報告します。開発は完了しましたが、結合テストに2日の遅延が発生しています。", vi: "Xin báo cáo tiến độ tuần này. Phát triển đã xong nhưng kiểm thử tích hợp chậm 2 ngày." },
            { speaker: "顧客", jp: "原因は何ですか。", vi: "Nguyên nhân là gì?" },
            { speaker: "BrSE", jp: "外部APIのテスト環境が利用できなかったためです。現在は解消しております。", vi: "Do không dùng được môi trường test của API bên ngoài. Hiện đã giải quyết." },
            { speaker: "顧客", jp: "リリース日は守れますか。", vi: "Có giữ được ngày release không?" },
            { speaker: "BrSE", jp: "はい。テスト要員を1名追加し、来週水曜日までに挽回する見込みです。リリース日への影響はございません。", vi: "Vâng. Chúng tôi thêm 1 tester và dự kiến lấy lại tiến độ trước thứ Tư tuần sau. Không ảnh hưởng tới ngày release." },
          ],
        },
      ],
    },
    {
      id: "risk-report",
      title: "Báo cáo rủi ro",
      titleJp: "リスク報告",
      summary: "Nhận diện rủi ro, mức độ, xác suất, đối sách và người cần quyết định.",
      vocabTag: "reports",
      phrases: [
        { jp: "現時点で顕在化はしておりませんが、リスクとして共有いたします。", vi: "Hiện chưa xảy ra nhưng xin chia sẻ như một rủi ro." },
        { jp: "発生した場合、リリースが1週間遅れる可能性がございます。", vi: "Nếu xảy ra, release có thể chậm 1 tuần." },
        { jp: "対策として、〇〇を事前に実施することを提案いたします。", vi: "Như biện pháp, chúng tôi đề xuất thực hiện ○○ trước." },
        { jp: "〇日までにご判断いただけますでしょうか。", vi: "Quý vị có thể quyết định trước ngày ○ được không ạ?" },
      ],
      conversations: [],
      templates: [
        {
          title: "Mẫu báo cáo rủi ro",
          body: "■ リスク内容：決済代行会社のAPI仕様変更（11月予定）\n■ 影響：決済機能の改修が必要。最大5人日の追加工数\n■ 発生可能性：中\n■ 対策案：\n  案1）仕様変更前にリリースし、変更後に改修する\n  案2）リリースを2週間延期し、新仕様で実装する\n■ ご判断いただきたい事項：対策案の選択（10月20日まで）",
          vi: "Nội dung rủi ro / ảnh hưởng / khả năng xảy ra / phương án / việc cần khách quyết định và hạn chót.",
        },
      ],
    },
    {
      id: "facilitation",
      title: "Điều phối cuộc họp",
      titleJp: "会議ファシリテーション",
      summary: "Mở đầu, giữ thời gian, tóm tắt luận điểm, phiên dịch, chốt action items.",
      vocabTag: "facilitation",
      phrases: [
        { jp: "本日のゴールは、仕様を確定することです。", vi: "Mục tiêu hôm nay là chốt đặc tả." },
        { jp: "一度、論点を整理させてください。", vi: "Cho phép tôi sắp xếp lại các luận điểm." },
        { jp: "今のご発言を、ベトナムチームに通訳します。", vi: "Tôi xin phiên dịch phát biểu vừa rồi cho team Việt Nam." },
        { jp: "時間の都合上、この件は別途打ち合わせを設定します。", vi: "Vì thời gian có hạn, việc này sẽ được sắp xếp một buổi họp riêng." },
        { jp: "最後に、宿題事項と担当者、期限を確認させてください。", vi: "Cuối cùng, cho phép tôi xác nhận action items, người phụ trách và thời hạn." },
      ],
      conversations: [
        {
          title: "Chốt cuộc họp",
          lines: [
            { speaker: "BrSE", jp: "では最後に、宿題事項を確認させてください。", vi: "Cuối cùng, cho phép tôi xác nhận các action items." },
            { speaker: "BrSE", jp: "一点目、権限一覧の確定は山田様に、10月18日までにお願いいたします。", vi: "Thứ nhất, chốt danh sách phân quyền nhờ anh Yamada trước 18/10." },
            { speaker: "BrSE", jp: "二点目、画面イメージの修正は弊社にて、10月20日までに対応いたします。", vi: "Thứ hai, chỉnh sửa hình ảnh màn hình do công ty chúng tôi xử lý trước 20/10." },
            { speaker: "顧客", jp: "はい、それで問題ありません。", vi: "Vâng, như vậy không có vấn đề." },
            { speaker: "BrSE", jp: "ありがとうございます。議事録は本日中にお送りいたします。", vi: "Cảm ơn. Biên bản sẽ được gửi trong hôm nay." },
          ],
        },
      ],
      roleplays: [
        {
          title: "Cuộc họp bị lạc đề",
          situation: "Cuộc họp chốt đặc tả màn hình nhưng khách hàng bắt đầu bàn về chức năng của giai đoạn 2. Chỉ còn 10 phút.",
          yourRole: "BrSE điều phối cuộc họp.",
          goal: "Kéo cuộc họp về mục tiêu một cách lịch sự, ghi nhận chủ đề mới.",
          hints: ["Ghi nhận ý kiến", "Nhắc lại mục tiêu", "Đề xuất họp riêng", "Quay lại chủ đề"],
          modelAnswer: "貴重なご意見ありがとうございます。第二フェーズの件は大変重要ですので、別途お打ち合わせの場を設けさせていただけますでしょうか。残り時間が10分となりましたので、本日のゴールである画面仕様の確定に戻らせていただきます。",
        },
      ],
    },
    {
      id: "spec",
      title: "Giải thích đặc tả",
      titleJp: "仕様説明",
      summary: "Truyền đạt đặc tả từ khách hàng sang team offshore và ngược lại, tránh hiểu sai.",
      vocabTag: "spec",
      phrases: [
        { jp: "この画面の仕様について補足説明いたします。", vi: "Tôi xin giải thích bổ sung về đặc tả màn hình này." },
        { jp: "条件によって処理が分岐します。", vi: "Xử lý rẽ nhánh tùy theo điều kiện." },
        { jp: "例外ケースについて確認させてください。", vi: "Cho phép tôi xác nhận các trường hợp ngoại lệ." },
        { jp: "認識齟齬を防ぐため、図にまとめました。", vi: "Để tránh hiểu sai, tôi đã tóm tắt bằng sơ đồ." },
        { jp: "具体例を挙げますと…", vi: "Lấy ví dụ cụ thể thì…" },
      ],
      conversations: [
        {
          title: "Xác nhận đặc tả với khách hàng",
          lines: [
            { speaker: "BrSE", jp: "割引の計算について確認させてください。会員ランクの割引とクーポンは併用可能でしょうか。", vi: "Cho phép tôi xác nhận cách tính giảm giá. Giảm giá theo hạng thành viên và coupon có dùng đồng thời được không ạ?" },
            { speaker: "顧客", jp: "併用できます。ただし、割引後の金額が0円未満にならないようにしてください。", vi: "Dùng đồng thời được. Nhưng hãy đảm bảo số tiền sau giảm không nhỏ hơn 0 yên." },
            { speaker: "BrSE", jp: "承知しました。計算の順番は、会員割引の後にクーポンを適用するという認識でよろしいでしょうか。", vi: "Tôi hiểu rồi. Thứ tự tính là áp dụng giảm giá thành viên rồi mới đến coupon, hiểu như vậy có đúng không ạ?" },
            { speaker: "顧客", jp: "はい、その通りです。", vi: "Vâng, đúng vậy." },
            { speaker: "BrSE", jp: "ありがとうございます。Q&A表に記載し、チームに共有いたします。", vi: "Cảm ơn. Tôi sẽ ghi vào bảng Q&A và chia sẻ với team." },
          ],
        },
      ],
    },
  ],
};
