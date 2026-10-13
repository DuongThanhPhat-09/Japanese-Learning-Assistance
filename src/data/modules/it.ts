import type { ProModule } from "@/types";

export const IT_MODULE: ProModule = {
  id: "it",
  title: "Tiếng Nhật IT",
  description: "Từ vựng và hội thoại thực tế cho kỹ sư phần mềm làm việc với khách hàng/đồng nghiệp Nhật.",
  topics: [
    {
      id: "software-dev",
      title: "Phát triển phần mềm",
      titleJp: "ソフトウェア開発",
      summary: "Triển khai, sửa lỗi, review code, ước lượng công số.",
      vocabTag: "software-dev",
      phrases: [
        { jp: "この機能の実装は明日完了する予定です。", vi: "Chức năng này dự kiến hoàn thành triển khai vào ngày mai." },
        { jp: "レビューをお願いできますか。", vi: "Anh/chị review giúp tôi được không?" },
        { jp: "ご指摘の点を修正しました。", vi: "Tôi đã sửa các điểm được góp ý." },
        { jp: "影響範囲を調査してから対応します。", vi: "Tôi sẽ điều tra phạm vi ảnh hưởng rồi mới xử lý." },
        { jp: "工数は三人日と見積もっています。", vi: "Tôi ước tính công số là 3 người-ngày." },
      ],
      conversations: [
        {
          title: "Review code",
          lines: [
            { speaker: "リーダー", jp: "このループ、毎回DBにアクセスしていますね。", vi: "Vòng lặp này mỗi lần đều truy cập DB nhỉ." },
            { speaker: "開発者", jp: "はい。件数が多いと遅くなりますか。", vi: "Vâng. Nếu số lượng nhiều thì sẽ chậm ạ?" },
            { speaker: "リーダー", jp: "そうですね。まとめて取得するように修正してください。", vi: "Đúng vậy. Hãy sửa để lấy dữ liệu một lần." },
            { speaker: "開発者", jp: "承知しました。修正後、再度レビューをお願いします。", vi: "Tôi hiểu rồi. Sau khi sửa xin nhờ anh review lại." },
          ],
        },
      ],
    },
    {
      id: "agile",
      title: "Agile",
      titleJp: "アジャイル開発",
      summary: "Tư duy Agile, user story, ưu tiên, retrospective.",
      vocabTag: "agile",
      phrases: [
        { jp: "優先順位の高いストーリーから着手しましょう。", vi: "Hãy bắt đầu từ story có độ ưu tiên cao." },
        { jp: "このストーリーは大きすぎるので分割しましょう。", vi: "Story này quá lớn, hãy chia nhỏ." },
        { jp: "振り返りで改善点を話し合いましょう。", vi: "Hãy thảo luận điểm cải thiện trong buổi retrospective." },
      ],
      conversations: [
        {
          title: "Retrospective",
          lines: [
            { speaker: "SM", jp: "今回のスプリントで良かった点は何ですか。", vi: "Điểm tốt của sprint lần này là gì?" },
            { speaker: "メンバー", jp: "テストの自動化が進んで、リリースが早くなりました。", vi: "Test tự động hóa tiến triển nên release nhanh hơn." },
            { speaker: "SM", jp: "改善すべき点はありますか。", vi: "Có điểm nào cần cải thiện không?" },
            { speaker: "メンバー", jp: "仕様の確認が遅れて、手戻りが発生しました。", vi: "Việc xác nhận đặc tả bị chậm nên phát sinh làm lại." },
          ],
        },
      ],
    },
    {
      id: "scrum",
      title: "Scrum",
      titleJp: "スクラム",
      summary: "Daily scrum, sprint planning, backlog, DoD.",
      vocabTag: "scrum",
      phrases: [
        { jp: "昨日やったこと、今日やること、困っていることを共有してください。", vi: "Hãy chia sẻ việc đã làm hôm qua, việc hôm nay và khó khăn." },
        { jp: "このタスクは完了条件を満たしていますか。", vi: "Task này đã thỏa mãn DoD chưa?" },
        { jp: "スプリントゴールに影響がありそうです。", vi: "Có vẻ sẽ ảnh hưởng tới sprint goal." },
      ],
      conversations: [
        {
          title: "Daily scrum",
          lines: [
            { speaker: "メンバー", jp: "昨日はログインAPIを実装しました。今日は単体テストを書きます。", vi: "Hôm qua tôi đã triển khai API đăng nhập. Hôm nay tôi viết unit test." },
            { speaker: "メンバー", jp: "困っていることは、テスト環境のDBにアクセスできないことです。", vi: "Khó khăn là không truy cập được DB môi trường test." },
            { speaker: "SM", jp: "わかりました。朝会のあとでインフラチームに確認します。", vi: "Được. Sau họp sáng tôi sẽ xác nhận với team hạ tầng." },
          ],
        },
      ],
    },
    {
      id: "testing",
      title: "Kiểm thử",
      titleJp: "テスト",
      summary: "Các mức kiểm thử, test case, tái hiện lỗi, giá trị mong đợi.",
      vocabTag: "testing",
      phrases: [
        { jp: "テストケースを作成しましたので、ご確認ください。", vi: "Tôi đã tạo test case, xin hãy kiểm tra." },
        { jp: "実行結果が期待値と異なります。", vi: "Kết quả thực thi khác với giá trị mong đợi." },
        { jp: "再現手順を教えていただけますか。", vi: "Anh/chị cho tôi biết các bước tái hiện được không?" },
        { jp: "回帰テストで問題がないことを確認しました。", vi: "Đã xác nhận không có vấn đề trong kiểm thử hồi quy." },
      ],
      conversations: [
        {
          title: "Báo lỗi trong kiểm thử",
          lines: [
            { speaker: "テスター", jp: "検索画面で、全角スペースを入力するとエラーになります。", vi: "Ở màn hình tìm kiếm, nhập khoảng trắng full-width thì bị lỗi." },
            { speaker: "開発者", jp: "どのブラウザで発生しましたか。", vi: "Phát sinh trên trình duyệt nào?" },
            { speaker: "テスター", jp: "Chromeの最新版です。スクリーンショットを障害票に添付しました。", vi: "Chrome bản mới nhất. Tôi đã đính kèm ảnh chụp màn hình vào phiếu lỗi." },
            { speaker: "開発者", jp: "ありがとうございます。再現できました。本日中に修正します。", vi: "Cảm ơn. Tôi đã tái hiện được. Sẽ sửa trong hôm nay." },
          ],
        },
      ],
    },
    {
      id: "design-docs",
      title: "Tài liệu thiết kế",
      titleJp: "設計書",
      summary: "要件定義 → 基本設計 → 詳細設計; cách đọc và viết tài liệu.",
      vocabTag: "design-docs",
      phrases: [
        { jp: "基本設計書の第三章をご確認ください。", vi: "Xin hãy kiểm tra chương 3 của tài liệu thiết kế cơ bản." },
        { jp: "この項目は必須ですか、任意ですか。", vi: "Trường này bắt buộc hay tùy chọn?" },
        { jp: "改訂履歴に変更内容を記載しました。", vi: "Đã ghi nội dung thay đổi vào lịch sử sửa đổi." },
        { jp: "設計書と実装に差異があります。", vi: "Có sự khác biệt giữa tài liệu thiết kế và code." },
      ],
      conversations: [],
      templates: [
        {
          title: "Mẫu mô tả màn hình (画面仕様)",
          body: "■ 画面名：会員登録画面\n■ 概要：新規会員の情報を入力し、登録する。\n■ 入力項目\n  1. メールアドレス（必須・最大256文字・形式チェックあり）\n  2. パスワード（必須・8〜32文字・英数字混在）\n  3. 氏名（必須・最大50文字）\n■ 処理\n  ・「登録」ボタン押下時、入力チェックを行う。\n  ・エラーがある場合、該当項目の下にエラーメッセージを表示する。\n  ・正常の場合、確認メールを送信し、完了画面へ遷移する。",
          vi: "Mẫu đặc tả màn hình đăng ký thành viên: trường nhập, ràng buộc, xử lý khi bấm nút.",
        },
      ],
    },
    {
      id: "architecture",
      title: "Kiến trúc",
      titleJp: "アーキテクチャ",
      summary: "Cấu trúc hệ thống, khả năng mở rộng, tính sẵn sàng, hiệu năng.",
      vocabTag: "architecture",
      phrases: [
        { jp: "将来の拡張性を考慮して、サービスを分割しました。", vi: "Xét đến khả năng mở rộng sau này, chúng tôi đã tách service." },
        { jp: "単一障害点をなくすために冗長化します。", vi: "Thiết lập dự phòng để loại bỏ điểm lỗi đơn." },
        { jp: "ピーク時の負荷を見積もる必要があります。", vi: "Cần ước lượng tải lúc cao điểm." },
      ],
      conversations: [
        {
          title: "Thảo luận kiến trúc",
          lines: [
            { speaker: "顧客", jp: "アクセスが急増した場合、どう対応しますか。", vi: "Nếu truy cập tăng đột biến thì xử lý thế nào?" },
            { speaker: "アーキテクト", jp: "自動スケーリングを設定し、キャッシュで負荷を分散します。", vi: "Thiết lập auto scaling và phân tán tải bằng cache." },
            { speaker: "顧客", jp: "データベースがボトルネックになりませんか。", vi: "Database có thành nút thắt cổ chai không?" },
            { speaker: "アーキテクト", jp: "読み取り専用のレプリカを追加することで対応可能です。", vi: "Có thể xử lý bằng cách thêm replica chỉ đọc." },
          ],
        },
      ],
    },
    {
      id: "infrastructure",
      title: "Hạ tầng",
      titleJp: "インフラ",
      summary: "Môi trường, release, giám sát, xử lý sự cố, khôi phục.",
      vocabTag: "infrastructure",
      phrases: [
        { jp: "本番環境へのリリースは今夜22時に実施します。", vi: "Release lên production sẽ thực hiện lúc 22 giờ tối nay." },
        { jp: "監視アラートが発報しました。", vi: "Cảnh báo giám sát đã phát ra." },
        { jp: "切り戻し手順を準備しておいてください。", vi: "Hãy chuẩn bị sẵn quy trình rollback." },
        { jp: "サービスは正常に復旧しました。", vi: "Dịch vụ đã khôi phục bình thường." },
      ],
      conversations: [],
    },
    {
      id: "cloud",
      title: "Cloud",
      titleJp: "クラウド",
      summary: "Migration, container, chi phí theo lượng dùng, vận hành.",
      vocabTag: "cloud",
      phrases: [
        { jp: "オンプレミスからクラウドへの移行を検討しています。", vi: "Đang xem xét chuyển từ on-premise lên cloud." },
        { jp: "従量課金なので、使わないリソースは停止しましょう。", vi: "Tính phí theo lượng dùng nên hãy tắt tài nguyên không dùng." },
        { jp: "コンテナ化することでデプロイが簡単になります。", vi: "Container hóa giúp deploy dễ dàng hơn." },
      ],
      conversations: [],
    },
    {
      id: "api",
      title: "API",
      titleJp: "API",
      summary: "Tích hợp hệ thống, tham số, giá trị trả về, xác thực, timeout.",
      vocabTag: "api",
      phrases: [
        { jp: "このAPIのリクエストパラメータを教えてください。", vi: "Cho tôi biết tham số request của API này." },
        { jp: "レスポンスはJSON形式で返却されます。", vi: "Response được trả về dạng JSON." },
        { jp: "認証トークンの有効期限は一時間です。", vi: "Token xác thực có hiệu lực một giờ." },
        { jp: "外部APIがタイムアウトした場合、リトライします。", vi: "Nếu API bên ngoài bị timeout thì sẽ retry." },
      ],
      conversations: [
        {
          title: "Hỏi về đặc tả API",
          lines: [
            { speaker: "開発者", jp: "ユーザー検索APIで、該当データがない場合は何を返しますか。", vi: "API tìm kiếm user, khi không có dữ liệu tương ứng thì trả về gì?" },
            { speaker: "顧客", jp: "ステータス200で、空の配列を返してください。", vi: "Trả về status 200 với mảng rỗng." },
            { speaker: "開発者", jp: "承知しました。仕様書にも追記しておきます。", vi: "Tôi hiểu rồi. Tôi sẽ bổ sung vào tài liệu đặc tả." },
          ],
        },
      ],
    },
    {
      id: "security",
      title: "Bảo mật",
      titleJp: "セキュリティ",
      summary: "Lỗ hổng, mã hóa, phân quyền, rò rỉ thông tin, xác thực đa yếu tố.",
      vocabTag: "security",
      phrases: [
        { jp: "脆弱性診断の結果、重大な問題は見つかりませんでした。", vi: "Kết quả kiểm tra lỗ hổng không phát hiện vấn đề nghiêm trọng." },
        { jp: "個人情報は暗号化して保存してください。", vi: "Hãy mã hóa thông tin cá nhân khi lưu." },
        { jp: "最小権限の原則に従って権限を設定します。", vi: "Thiết lập quyền theo nguyên tắc đặc quyền tối thiểu." },
        { jp: "パスワードをソースコードに直接書かないでください。", vi: "Đừng viết mật khẩu trực tiếp vào mã nguồn." },
      ],
      conversations: [],
    },
  ],
};
