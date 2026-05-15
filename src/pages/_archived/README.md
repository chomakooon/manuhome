# Archived Pages (Phase 24.1)

このディレクトリには、Phase 24.1 で kataribin の本線ルートから外した**孤立ルートのページ**を温存しています。

Phase 24 のルート棚卸しで「現行サイトから一切リンクされていない」または「他セクションへ統合済み」と確認できた一群です。今後の方針変更で復活させる可能性に備え、`git mv` で履歴を保ったまま隔離しています。

## 含まれるファイル

| ファイル | 旧ルート | 退役理由 |
|---|---|---|
| `NetworkingPage.jsx` / `.css` | `/networking` | サイト内導線が 0 件。現在のカタチ便ナビには存在せず、SNS / 検索からの被リンクも未確認。 |
| `ThanksPage.jsx` / `.css` | `/thanks` | Phase 22 で `ContactPage` 内 `CompletedScreen` に統合済み。送信完了後に同一ページで完了体験を完結させる方針に変更。 |
| `OrderPage.jsx` / `.css` | `/order` | 旧「ジャンル別オーダーフロー入口」。現在は `/pricing` + `/contact` + `/pet/order`（PAWS PRESS）に役割を分散。 |
| `OrderFlowPage.jsx` / `.css` | `/order/flow/:templateId` | 旧 Stripe Checkout 連動ステップフロー。事業方針見直しで都度見積もり制（`/contact` ベース）へ。 |
| `OrderSuccessPage.jsx` / `.css` | `/order/success` | `OrderFlowPage` の到達ページ。同上で未参照。 |
| `stripe.js` | （lib） | `OrderFlowPage` 専用の Stripe Checkout セッション生成ヘルパー。他に依存なし。 |

Phase 24.1 時点で本線コード（`App.jsx` / 各ページ / `lib/`）からの import 参照は **すべて 0 件**。

## ⚠️ 「あえて archive しなかった」依存

Phase 24.1 監査で「OrderFlowPage 関連だから一見不要」と思える資産のうち、**本線にまだ依存している**ものは現状の場所に残してあります:

- `src/lib/templates/`（5 つの JSON + `index.js`）
  - `pet-illustration.json` を `src/lib/constants.js` が import → `getFormKeyLabel` / `getFormValueLabel` が `ProjectRoomPage` / `DashProjectDetailPage` で利用中。
- `src/assets/order_flow_manga.png` / `.webp`
  - `ServicesPage`（`/services`、有効ルート）と `TopPage`（保守用に温存）で使用。

これらを将来整理するときは、まず利用側を差し替えてから移動してください。

## 復元手順

このディレクトリから元の位置に戻すだけで使用再開可能です:

```bash
git mv src/pages/_archived/NetworkingPage.jsx src/pages/public/
git mv src/pages/_archived/NetworkingPage.css src/pages/public/
# 他のファイルも同様に元のディレクトリへ
```

そのうえで `src/App.jsx` に `lazy()` import と `<Route>` を再追加してください。

復元先ディレクトリの目安:

| ファイル | 復元先 |
|---|---|
| `NetworkingPage.*` / `OrderPage.*` | `src/pages/public/` |
| `ThanksPage.*` | `src/pages/client/` |
| `OrderFlowPage.*` / `OrderSuccessPage.*` | `src/pages/order/`（再作成） |
| `stripe.js` | `src/lib/` |

## 削除タイミング

将来「もう不要」と判断されたら、`_archived/` ごと削除してください:

```bash
rm -rf src/pages/_archived/
```

履歴には残るので、後から完全復元したい場合は `git log -- src/pages/_archived/` から確認できます。

## ESLint / ビルドからの除外

`eslint.config.js` の `globalIgnores(['dist', '**/_archived/**'])`（Phase 16 で導入）により、このディレクトリ配下のファイルは lint 対象外です。Vite ビルドからも import されないため自動的に対象外です。
