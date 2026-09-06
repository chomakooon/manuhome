# 決済バックエンドの適用・確認手順

この修正は、注文内容と非公開画像を保存してからStripe Checkoutを作成し、署名済みイベントと保存済み注文の金額・通貨・商品・セッションを照合して受注を確定します。この文書の作成時点では、本番DB・Edge Functionsへの適用、実決済、実返金は行っていません。

## 必要な設定

| 設定 | 配置先 | 内容 |
| --- | --- | --- |
| `SUPABASE_URL` | Edge Functions | 接続先プロジェクト。通常はSupabaseが設定します。DNSと稼働状態を確認してください。 |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functionsのみ | 注文保存・非公開Storage・受注確定RPC用。ブラウザー、Git、通知本文には渡しません。 |
| `STRIPE_SECRET_KEY` | Edge Functionsのみ | Checkoutを作成・照会するStripeアカウントの秘密鍵。検証はテストモードの鍵を使用します。 |
| `STRIPE_WEBHOOK_SECRET` | `stripe-webhook` | 当該エンドポイントの署名シークレット。Stripe CLIの検証用シークレットと本番エンドポイントのシークレットは別です。 |
| `SITE_URL` | Edge Functions | 例：`https://katachi-lab.creative-own.com`。正規の公開URLを設定します。 |
| `ALLOWED_ORIGINS` | Edge Functions | 追加する信頼済みOriginをカンマ区切りで設定します。ローカル検証では必要なポートだけを追加します。ワイルドカードを使用しません。 |
| `VITE_SUPABASE_URL` | フロントエンドのビルド環境 | 接続先Supabase URL。Edge Functionsと同じプロジェクトを指定します。 |
| `VITE_SUPABASE_ANON_KEY` | フロントエンドのビルド環境 | 公開用キー。サービス権限のキーを指定しないでください。 |

Stripeのホスト画面へ遷移するため、現在の注文フローは`VITE_STRIPE_PUBLISHABLE_KEY`を使用しません。秘密鍵が未設定でもブラウザーには成功を表示しませんが、サービスの受付可否は実際のEdge Function接続で確認してください。

`supabase/config.toml`では`create-checkout`、`checkout-status`、`stripe-webhook`の`verify_jwt=false`を指定しています。前二者はゲスト注文用の入力検証・永続レート制限で保護し、Webhookは生のリクエスト本文に対するStripe署名で認証します。WebhookをJWT必須にするとStripeからの通知が拒否されます。

## 既存の注文・未完了Checkoutを先に確認する

旧版はブラウザーの任意金額・`mofulabo-<timestamp>`形式の注文IDをStripeへ渡し、DB保存失敗にも成功を返していました。新しいWebhookは、旧形式や対応するDB注文のない支払いを自動で受注確定しません。デプロイだけで既存の支払いが復元されることもありません。

適用前に新規Checkoutの受付を一時停止し、Stripe DashboardとDBの既存注文を管理者権限で照合してください。移行中も現在のWebhookを無計画に削除・切断せず、失敗イベントと顧客対応の担当を決めてください。

1. 対象Stripeアカウントとテスト／本番モードを確認し、未完了・支払済み・失敗イベントのCheckoutを確認します。メール、金額、通貨、Payment Intent、既存注文との対応をアクセス制限された作業記録に残します。
2. 既存`paid`表示だけを入金の証拠にしません。移行SQLによる`payment_status`の初期化は旧状態の引継ぎであり、不正注文や保存漏れをStripeに照合した結果ではありません。
3. 旧Checkoutに写真・配送先等が保存されていない場合は、不足内容を勝手に補って確定しません。担当者が顧客への確認方法と受注処理を決めます。既に入金済みの顧客へ、そのまま新しい決済をやり直させないでください。
4. 旧形式の未完了Checkoutを継続する場合は、対応する注文を信頼できる情報から復元する移行処理が別途必要です。新形式へ切り替える場合は、旧セッションの扱いと案内を先に決め、二重決済を防ぎます。返金や再注文を行う場合も、対象の照合と必要な本人確認を経て判断します。
5. 新しいWebhookの503とStripeの配送失敗を監視し、既存顧客のイベントが残ったまま「移行完了」としないでください。

このリポジトリには、情報が不足する旧Checkoutを安全に復元する自動移行ジョブは含まれていません。旧Webhookへ戻して任意ID・金額を信用する方法も使用しないでください。

## 適用順序

1. バックアップと適用済みmigration履歴を確認し、まず隔離した検証用Supabaseに適用します。`supabase_setup.sql`等の旧手動セットアップを追加実行しません。
2. 既存の`20260101000000`〜`20260101000006`に続けて、以下をファイル名順に適用します。
   - `20260906000000_security_hardening.sql`：RLS・列権限、非公開Storage、レート制限。
   - `20260906000001_checkout_integrity.sql`：注文の決済状態・リクエストID・通貨、販売商品、原子的な`fulfill_checkout`。
   - `20260906000002_private_internal_notes.sql`：管理者専用メモの分離。
   - `20260906000003_first_order_coupon_reservation.sql`：初回クーポンのメールアドレス単位の一意予約。
3. 既存`stripe_session_id`が重複していると一意インデックスの作成は停止します。データを削除して通さず、決済との対応を確認してから解消してください。既存の重複案件も自動削除しません。
4. 既定tenant `00000000-0000-0000-0000-000000000000`で、`metadata.plan_id`が`pet-trial`、`pet-single`、`pet-pair`の有効商品が各1件であることを確認します。初期価格は順に4,980円、7,800円、9,900円。既存の同一プラン商品の価格はmigrationで上書きしないため、公開画面の表示と実DB価格の一致を確認してください。ギフト包装は3,300円です。
5. サーバー秘密情報とOrigin設定を登録し、`create-checkout`、`checkout-status`、`stripe-webhook`を同じ修正版としてデプロイします。Stripeの通知先は対象プロジェクトの`/functions/v1/stripe-webhook`です。最低限`checkout.session.completed`と`checkout.session.async_payment_succeeded`を購読します。
6. フロントエンドを同じバックエンド契約に更新します。旧フロントエンドの任意金額形式は新しい関数で拒否されます。バックエンドのみを切り替えて受付を再開しないでください。
7. 下記の検証を完了し、旧Checkoutへの対応に漏れがないことを確認してから受付を再開します。

## 確認する動作

- 各プラン・グッズ・ギフト・クーポンの金額が表示と一致し、配送先、ペットの情報、写真、画風参考画像が管理画面から確認できること。
- `PROMO5500`はSingle Item・掲載同意あり・掲載不可設定なしの場合だけ適用できること。`はつもふ10`を同じメールアドレスで並行送信しても、異なる注文に複数適用されないこと。
- 注文写真と参考画像は合計20MB以内、各ファイル10MB以内・各区分3枚以内。Storageの公開URLから取得できず、権限のある利用者だけが期限付きリンクを取得できること。
- 通信失敗後の同じ送信内容の再試行で、同じ注文・Stripeの冪等性キーを使用すること。写真保存失敗時にCheckoutを開始しないこと。
- テストカードの支払完了で、注文の`payment_status=paid`、案件、画像レコードが保存されること。同じWebhookを再送しても案件が増えず、業務の進行状態が巻き戻らないこと。
- 支払いなしの`?stripe=success`、偽のセッションID、署名不正、金額・通貨・商品不一致を成功表示しないこと。DB障害時のWebhookが非2xxとなり、復旧後の再送で処理されること。
- `checkout-status`は個人情報を返さず、`paymentStatus`は`paid`／`pending`／`unpaid`／`refunded`、`orderStatus`は`confirmed`／`processing`／`pending`のみ返すこと。DBに返金済みと記録された注文は`refunded`／`pending`となること。

自動検証：

```sh
node --test tests/commerce.test.ts
npx --yes deno check --node-modules-dir=none supabase/functions/create-checkout/index.ts supabase/functions/checkout-status/index.ts supabase/functions/stripe-webhook/index.ts
npx --yes deno test --node-modules-dir=none tests/stripe-signature.deno.ts
```

上記は外部決済を発生させません。Stripe API・実Storage・実DBを組み合わせた動作確認は、検証用プロジェクトとStripeテストモードで別途実施します。

## 残る運用上の制約

注文はゲスト注文として保存し、メールアドレスが一致するだけでは既存アカウントへ紐付けません。確認メールの自動送信、ゲスト注文をメール確認済みアカウントへ移す処理、Stripeの返金イベントからDB状態を自動更新する処理は含まれません。返金済みの表示は、管理されたサーバー処理でDBの`payment_status=refunded`にした場合に反映されます。通常の管理画面から決済状態を直接変更することはできません。

決済リクエストの冪等性は同じ`requestId`と同じ注文内容に対するものです。別のリクエストIDで同一人物が作った注文を、同じ注文と判定する機能ではありません。Stripeが冪等性キーを保持しなくなる可能性に備え、セッションの保存状態が不明なまま23時間以上経過した注文は自動で決済を作り直しません。担当者がStripeを照合してから対応してください。

画像の保存先は送信ごとに別のランダムパスです。並行送信で採用されなかった画像は削除しますが、DB応答が途切れて書込みの成否が不明な場合は、受け付けた画像を誤削除しないため保持します。未決済の放置注文・未参照画像を定期削除するジョブは未実装です。削除処理を追加する際は、保存済み注文・案件の参照確認、十分な保留期間、未完了の書込みとの競合対策を設けてください。

### 初回クーポンの予約と取消

割引額、対象プラン、掲載同意はサーバーで検証します。`PROMO5500`は掲載同意と掲載不可設定が矛盾する場合も拒否します。

`はつもふ10`は、サーバー側で注文を作成した後、画像保存・Stripe呼出しより先に`reserve_first_order_coupon`で予約します。`first_order_coupon_reservations`にはtenantと正規化したメールアドレスの一意制約があり、同じメールによる別注文の並行利用は拒否します。同じ注文の再試行は既存の予約を再利用します。予約処理が失敗した場合は決済を開始しません。移行前を含む別注文の支払済み・返金済み履歴がある場合も対象外です。

予約に自動有効期限はありません。画像保存・決済開始の失敗後も、元の注文内容のまま再試行してください。別の注文としてやり直す場合や入力内容の修正で注文が変わる場合は、担当者による予約取消の確認が必要です。予約表を一般ユーザーから変更することはできません。

予約を手動で解除する場合は、元の注文を処理中のリクエストがないこと、関連するStripe Checkoutが支払済みではなく再決済もできない状態であること、遅れて入金確定する支払いがないことを確認してください。単にDB注文が`pending`であることや時間の経過だけを理由に予約を削除しないでください。支払われた注文の予約は消費済みとして保持します。旧版で既に複数作成されている未完了Checkoutは、この予約だけでは無効化されないため、前述の移行前照合で扱います。

メールの本人性やLINEの友だち登録は確認していません。同一人物による別メールアドレスでの利用制限、第三者が他人のメールアドレスを入力することへの防止には、確認済みメール／認証済みユーザーによる予約が別途必要です。`NMとくべつ`もコード一致による共有クーポンで、関係者資格を認証する仕組みではありません。

実装根拠： [SupabaseのStripe署名検証例](https://supabase.com/docs/guides/functions/examples/stripe-webhooks)、[Stripeの冪等性と保持期間](https://docs.stripe.com/api/idempotent_requests)、[StripeのWebhook配送](https://docs.stripe.com/webhooks)。
