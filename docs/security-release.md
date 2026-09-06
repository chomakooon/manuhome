# セキュリティ・機能修正の適用手順

2026年9月6日の監査で確認した権限昇格、問い合わせ閲覧、偽paid注文、任意価格決済、保存失敗の成功扱い、画像未送信、AI利用制限不足を修正する更新です。GitHub上のフロントエンドとSupabaseを同じ契約で切り替えます。

## 実環境の確認結果

管理APIで`manuhome`（`nhktlafexurxzzbitvjy`）は`INACTIVE`でした。公開フロントエンドが参照するホストのDNS障害はこの停止状態と整合します。コード内のURLを別の推測したプロジェクトへ変更していません。関数の登録メタデータは取得できましたが、Secrets一覧の取得はCLI認証形式エラーになったため、秘密情報の設定有無は未確認です。

この修正の作成・ローカル検証では、プロジェクト再開、本番migration、関数デプロイ、mainへのマージ、実通知・メール・決済は行っていません。稼働再開前に以下を実施します。

## 切替手順

1. Supabase管理画面で対象プロジェクト、停止理由、バックアップと復元可否を確認します。プロジェクト再開だけでは旧版の認可問題も再び公開されるため、受付停止中の作業として、DB・Functions・フロントを一組で切り替える時間を設けます。
2. 復元後、**migration適用前バックアップを取得**し、DBの復元方法とStorageの画像本体の保全を確認します。適用済みmigration・実テーブル・列権限・`pg_policies`・Storage設定を照合し、`information_schema.columns`で`public.orders.notes`と`public.projects.notes`の列実在を[下記クエリ](#内部メモ移行前の列実在確認)で確認します。旧手動セットアップだけで構築されたDBなら、migration履歴を偽って追加せず差分を確認してください。どちらかの列が存在しない場合は適用を止め、バックアップと旧スキーマからメモの保存先を確認します。空の`notes`列を追加して検査だけを通したり、異なるスキーマにSQLを強制適用したりしません。
3. 旧Stripeの未完了・支払済みセッションを[決済手順](commerce-deployment.md)に従って照合します。旧`paid`値は入金確認の代わりになりません。顧客データやStripe秘密情報は公開PR・ログへ掲載しません。
4. 検証環境で`20260906000000`〜`20260906000003`を順に適用し、本番にも同順で適用します。新規DBはそれ以前のmigrationも必要です。内部メモは専用テーブルへコピーした後に旧列を削除します。旧版の管理画面への単純ロールバックはできません。失敗時は受付を停止したまま、バックアップと適用履歴から対処します。
5. 以下のサーバー設定を準備し、全7関数をこのコミットからデプロイします。`supabase/config.toml`の関数ごとのJWT設定を適用し、ゲスト関数が古いJWT必須設定のままになっていないことを確認します。
6. 公開用Supabase URL・キーを確認してフロントエンドをビルドします。XserverとVercelの両配信先を確認します。VercelではSPA rewriteと基本ヘッダーもこの更新に含みます。
7. 以下の実サービス検証を完了してから受付を再開します。

## 適用順序チェックリスト

以下は未実施の本番切替作業です。順番に完了を記録し、`checkout-status`の疎通確認まではDraftを維持して`main`へマージしません。Supabase復旧・バックアップ、旧Stripeセッション照合、Supabase/GitHub Secrets登録はオーナーが実施し、アクセス権の受け渡しも当事者間で調整します。ローカルテストやCIの成功を、本番作業の完了としてチェックしないでください。

- [ ] **Supabase復旧確認**：対象プロジェクトと権限を確認し、受付を停止した状態でDB・Auth・Storageへ接続できることを確認する。
- [ ] **バックアップ取得**：適用前DBバックアップと画像本体を保全し、復元手順、下記の`notes`列実在、適用済みmigrationを確認する。旧Stripeの支払済み・未完了セッションの照合も完了する。
- [ ] **migration順次適用**：検証環境で確認後、本番へ`20260906000000` → `20260906000001` → `20260906000002` → `20260906000003`の順で適用する。失敗した場合は後続へ進まない。
- [ ] **Secrets設定**：オーナーがSupabaseの`STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `OPENROUTER_API_KEY` / `SITE_URL` / `CONTACT_WEBHOOK_URL`等と、GitHubの`FTP_*`を設定する。プロジェクト・Stripeモード・通知先を照合する。
- [ ] **全7 Functionsデプロイ**：`submit-contact`、`create-checkout`、`checkout-status`、`stripe-webhook`、`ai-chat`、`generate-manga-preview`、`retry-contact-notification`を同じ修正コミットからデプロイし、`config.toml`のJWT設定も確認する。
- [ ] **`checkout-status`疎通確認**：下記の応答契約を、DBとStripeに対応する保存済みセッションで確認する。未デプロイ、認証/CORSエラー、5xxの状態ではフロント配信へ進まない。
- [ ] **`main`マージ（フロント自動配信）**：上記を完了し、レビューと当該コミットのCI成功を確認してからDraft解除・マージを行う。XserverとVercelへ新契約のフロントが配信されたことを確認する。
- [ ] **合格条件検証**：受付停止を維持し、[実サービスでの合格条件](#実サービスでの合格条件)を配信後の画面を含めて確認する。テスト課金はStripeテストモードで行い、旧顧客の決済を再実行しない。
- [ ] **受付再開**：検証結果と未処理の旧決済・問い合わせを確認し、オーナー判断で受付を再開する。

### 内部メモ移行前の列実在確認

バックアップ取得後、migration `20260906000002`を適用する前に、管理用SQLで次を実行します。2行とも`notes_column_exists=true`であることが前提です。これは列の実在を調べるクエリで、メモの件数やバックアップの正しさを保証するものではありません。

```sql
SELECT expected.table_name,
       actual.column_name IS NOT NULL AS notes_column_exists,
       actual.data_type
FROM (VALUES ('orders'), ('projects')) AS expected(table_name)
LEFT JOIN information_schema.columns AS actual
  ON actual.table_schema = 'public'
 AND actual.table_name = expected.table_name
 AND actual.column_name = 'notes'
ORDER BY expected.table_name;
```

migration自体も先頭で同じ列の実在を検査し、欠落時は`RAISE EXCEPTION`で新テーブル作成・メモのコピー・旧列削除の前に停止します。列欠落は元の静的`INSERT ... SELECT`でもPostgreSQLのエラーとなる条件ですが、前提検査により作業開始前に原因を明示します。既に`00002`が正常適用済みなら旧列がないのは期待どおりなので、migration履歴と移行先メモを確認し、再適用しません。

### `checkout-status`の応答契約確認

検証環境で新しいCheckout受付とStripeテストモードを使い、同じ環境に保存されたセッションを照会します。リクエストは`POST /functions/v1/checkout-status`、JSON本文は`{"sessionId":"cs_test_..."}`です。実際のセッションIDへ置き換え、呼出元のOriginでCORSが通ることも確認します。

- Stripeで`status=open`かつ`payment_status=unpaid`の保存済みセッションはHTTP 200で`{"paymentStatus":"unpaid","orderStatus":"pending"}`となる。
- 支払済みで受注確定待ちの場合は`paid / processing`、署名済みWebhook処理後はHTTP 200で`{"paymentStatus":"paid","orderStatus":"confirmed"}`となる。
- 存在しないセッションの400/404だけをもって成功としない。JSONに`paymentStatus`と`orderStatus`があり、個人情報を含まず、新フロントの確認画面が応答を扱えることを確認する。

本番では接続先とStripeモード、関数のデプロイ版を照合し、オーナーが照合済みの保存済みセッションで確認します。本番のStripe秘密鍵をテスト鍵へ置き換えて既存決済を混在させないでください。

## サーバー設定

Supabaseが付与する`SUPABASE_URL`・`SUPABASE_SERVICE_ROLE_KEY`に加え、用途ごとに次を設定します。秘密値はSupabase Secretsへ登録します。

| 用途 | 設定 |
| --- | --- |
| 決済 | `STRIPE_SECRET_KEY`、当該Webhookの`STRIPE_WEBHOOK_SECRET` |
| AI | `OPENROUTER_API_KEY`。プロバイダー側にも費用上限を設定 |
| Origin | `SITE_URL`、必要な場合のみ`ALLOWED_ORIGINS`（カンマ区切りの完全Origin） |
| 問い合わせ通知 | `CONTACT_WEBHOOK_URL`、`CONTACT_WEBHOOK_TYPE=discord`または`slack` |

通知先を省略するとDBへの受付は保存し、管理画面で通知未設定と表示します。通知が失敗しても保存済み問い合わせを消さず、管理者が再送できます。新規注文の自動メールや通知送信はこの更新の機能には含まれません。

ゲスト受付は`submit-contact`、`create-checkout`、`checkout-status`、`ai-chat`。`stripe-webhook`はStripe署名で認証します。`generate-manga-preview`と`retry-contact-notification`はユーザーJWTとcreator権限を検証します。通知の再送は同じtenantの問い合わせに限定します。

新規登録はcustomerとして固定します。creator付与やtenant変更は信頼された管理用SQLで対象を確認して行い、ブラウザーからprofile全列を更新して権限を付与しません。移行前に不適切なcreatorが作られていないか、既存の管理者一覧を管理側で確認してください。

## 実サービスでの合格条件

- 管理者と一般ユーザー2名、別tenant、匿名で、権限昇格・他人の問い合わせ閲覧・偽paid注文・案件外ファイル/メッセージ登録が拒否される。
- 管理者のログイン、再設定メール、パスワード変更、一覧、状態更新、内部メモの初回保存と再編集が動作する。
- 問い合わせの本文と画像が保存され、通知が届く。通知失敗を管理画面で判別・再送できる。DB保存失敗時に受付完了と表示されない。
- 非公開画像は権限のある管理者の署名URLだけで取得でき、匿名や無関係ユーザーには取得できない。
- Stripeテストモードで各プランの注文、写真・住所保存、支払い成功/取消、署名不正、Webhook再送を確認する。案件が1件だけ作られ、表示と保存価格が一致する。
- AIの正常応答、回数超過、プロバイダー障害が適切に表示される。日次/分次の全体上限がDBで有効になっている。
- 両配信先の深いURLを直接開ける。実環境でのエラーとログを確認してから受付を再開する。

自動テストは外部サービスの代替と一時PostgreSQLを使います。実Supabaseゲートウェイ、実メール/通知、実Stripe APIとStorageを組み合わせた試験は別に必要です。未登録の顧客・制作者ポータルや未実装のPDFメール配信を「動作確認済み機能」として扱いません。
