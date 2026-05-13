# Archived Layout Files (Phase 16)

このディレクトリには、Phase 1〜5 で kataribin 領域から段階的に撤去された旧 Layout 系ファイルを温存しています。

## 含まれるファイル

| ファイル | 概要 | 旧用途 |
|---|---|---|
| `Layout.jsx` / `Layout.css` | 旧 SPA 全体 Layout | 全ルートを包む shell（Header + Footer + StickyCTA + AiAssistant） |
| `Header.jsx` / `Header.css` | 旧グローバルヘッダー | Phase 5 で `sites/kataribin/layout/KataribinHeader` に置換済み |
| `Footer.jsx` / `Footer.css` | 旧グローバルフッター | 同上で `KataribinFooter` に置換 |
| `StickyCTA.jsx` / `StickyCTA.css` | 旧スティッキー CTA | 現在は HomePage の `BigCtaSection` に統合 |
| `DashboardLayout.jsx` / `DashboardLayout.css` | 旧ダッシュボード（AuthContext 依存） | ログイン機能撤去（commit 03c1e96）に伴い未参照化 |
| `ProtectedRoute.jsx` | 旧 認証ガード | 同上で未参照化 |

Phase 16 時点での参照は **すべて 0 件**（`grep -r "from '.*components/layout/<file>'" src/` で確認）。

## 復元手順

このディレクトリから 1 階層上に戻すだけで使用再開可能です:

```bash
mv src/components/layout/_archived/<filename> src/components/layout/
```

そのうえで App.jsx に `import` を追加してください。なお `DashboardLayout` を復元する場合は `src/contexts/AuthContext` の存在 / 内容も確認してください（こちらも撤去済みの可能性あり）。

## 削除タイミング

将来「もう不要」と判断されたら、`_archived/` ごと削除してください:

```bash
rm -rf src/components/layout/_archived/
```

履歴には残るので、後から完全復元したい場合は `git log -- src/components/layout/_archived/` から確認できます。
