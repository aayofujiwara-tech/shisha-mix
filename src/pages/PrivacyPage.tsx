export default function PrivacyPage() {
  return (
    <div className="page" style={{ paddingBottom: 48 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: 'var(--color-amber)' }}>
        プライバシーポリシー
      </h1>

      <Section title="1. 事業者情報">
        <p>運営者：SheeshaMix</p>
        <p>お問い合わせ：アプリ内のフィードバック機能をご利用ください。</p>
      </Section>

      <Section title="2. 取得する個人情報">
        <p>本サービスでは、以下の情報を取得・保存します。</p>
        <ul>
          <li>Googleアカウントの表示名・メールアドレス（ログイン時）</li>
          <li>投稿したレシピ・コメント</li>
          <li>在庫データ・店舗データ・セッションデータ・日記データ</li>
          <li>いいね情報</li>
        </ul>
      </Section>

      <Section title="3. 利用目的">
        <ul>
          <li>サービスの提供および運営</li>
          <li>ユーザーの識別と認証</li>
          <li>機能の改善・新機能の開発</li>
        </ul>
      </Section>

      <Section title="4. 第三者提供">
        <p>
          取得した個人情報は、法令に基づく場合を除き、原則として第三者に提供しません。
          ただし、本サービスはインフラとして Firebase / Google のサービスを利用しており、
          これらのサービスプロバイダーにデータが処理される場合があります。
        </p>
      </Section>

      <Section title="5. データの保管">
        <p>取得したデータは以下の Firebase サービスに保管されます。</p>
        <ul>
          <li>Firebase Realtime Database（レシピ・コメント・ユーザー情報等）</li>
          <li>Firebase Storage（アップロード画像）</li>
          <li>Firebase Authentication（認証情報）</li>
        </ul>
        <p>
          Firebase のデータ管理については
          Google のプライバシーポリシーおよび Firebase の利用規約に従います。
        </p>
      </Section>

      <Section title="6. ユーザーの権利">
        <p>
          ユーザーはいつでもアカウントを削除できます。
          退会・データ削除はプロフィールページの「退会する」機能から実行可能です。
          退会すると、在庫・日記・店舗・セッションデータが削除されます。
          投稿したレシピは公開コンテンツとして残ります。
        </p>
      </Section>

      <Section title="7. Cookie およびローカルストレージの使用">
        <p>
          本サービスでは、年齢確認の確認済みフラグをブラウザのローカルストレージに保存します。
          これは外部に送信されることなく、ブラウザ上にのみ保持されます。
        </p>
      </Section>

      <Section title="8. 改定について">
        <p>
          本ポリシーは、法令の改正やサービス内容の変更に応じて改定される場合があります。
          重要な変更がある場合はアプリ内でお知らせします。
        </p>
      </Section>

      <Section title="9. 制定日">
        <p>2026年6月5日 制定</p>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: 'var(--color-amber-light)' }}>
        {title}
      </h2>
      <div style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {children}
      </div>
    </div>
  )
}
