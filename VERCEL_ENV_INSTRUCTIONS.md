## Vercel環境変数の追加手順

Vercel Dashboard → プロジェクト → Settings → Environment Variables に以下を追加:

| 変数名 | 値 | 環境 |
|--------|-----|------|
| VITE_ADMIN_UID | IA38vNhPd8eHyWU8qjnleGlhSNC3 | Production, Preview, Development |

追加後に Deployments → 最新のデプロイ → Redeploy を実行すること。

## Firebase Analytics の確認手順

Firebase Console → Analytics → DebugView にアクセスし、
ローカルで操作したときにリアルタイムでイベントが届いているか確認する。
届いていない場合は Firebase Console でAnalyticsが有効になっているか確認する。

## 管理者ダッシュボードへのアクセス
本番URL: https://shisha-mix-eight.vercel.app/admin
ローカル: http://localhost:5173/admin
