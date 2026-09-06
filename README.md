# カタチらぼ / もふらぼ

React + Vite の公開サイト・管理画面と、Supabase の認証・DB・Storage・Edge Functionsで構成します。決済はStripe Checkout、AI相談はサーバー経由のOpenRouterを使用します。

## ローカル開発

Node.js 24、Deno 2.9.6、Dockerを使用します。`.env.example`を参考に`.env.local`へ検証用Supabaseの公開設定を用意してください。サーバー秘密鍵は`VITE_`変数に置きません。

```sh
npm ci
npm run dev
```

## 検証

```sh
npm run check             # Lint、サーバーハンドラーの単体検証、本番ビルド
npm audit --audit-level=high
npm run check:functions   # Denoで全Edge Functionsの型確認
npm run test:stripe       # 実Stripe SDKと合成署名を使った検証

docker pull postgres:16
npm run test:db           # 一時DBでRLS・列権限・画像権限・決済・並列処理を検証

npx playwright install chromium
npm run test:e2e          # 合成バックエンドで公開画面・管理画面・注文・AIを操作
```

ブラウザーテストは4175番ポートでViteを起動し、外部サービスへの通信を遮断します。顧客への通知、AI課金、実決済は発生しません。既存Chromeを使う場合は`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`で実行ファイルを指定できます。

DB検証はホストポート・永続ボリュームのない専用コンテナだけを作成し、終了時に削除します。既存DBへmigrationや合成データを流すテストではありません。`scripts/_archived`の旧ブラウザースクリプトは現行テストから外しています。

## 本番への適用

**フロントエンドのマージだけでは修復は完了しません。** DBの追加migration、Edge Functionsと秘密情報を先に整合させ、Stripeテストモードで保存・Webhook・画面を通して確認してください。旧版の未完了Checkoutは新しいWebhookで自動復元されません。

- [全体の適用手順と実環境で残る確認](docs/security-release.md)
- [決済の設定・移行・再試行・クーポン予約](docs/commerce-deployment.md)

`main`へのpushはXserver配信を開始し、検証workflowが成功した場合にフロントエンドを転送します。VercelのGit連携が有効な場合は別の配信経路です。今回の更新はバックエンド適用と確認が終わるまで`main`へマージしないでください。自動テストだけで実サービスの設定・稼働や既存顧客データの整合まで保証するものではありません。
