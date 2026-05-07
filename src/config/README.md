# `src/config/` — サイト設定の単一ソース

このディレクトリは「サイトオーナー（クリエイター本人）が触る設定」を**コードから分離**して集約する場所です。
将来テンプレートとして他クリエイターに販売する際、ここを差し替えるだけでサイトが完成することをゴールにしています。

ページ実装（`src/pages/`）からは `src/config/` を **import するだけ** でデータを参照できる状態を保ち、
ロジックや表示処理を config 内に書き込まないでください。

## ディレクトリ構成

```
src/config/
├── README.md             # このファイル
├── _schema.js            # 全 config の型定義（JSDoc typedef）
├── site.config.js        # サイト名・ナビ・SNS・フッター
├── pricing.config.js     # /pricing の料金プラン
├── flow.config.js        # /flow の制作フロー（ステップ）
├── contact.config.js     # /contact の送信先・件名テンプレ・必須項目
└── works/
    ├── categories.js     # /works のカテゴリ定義
    └── items/            # 1作品 = 1ファイル（次ステップで導入）
```

## 各ファイルの責任範囲

| ファイル | 何を持つか | どこから参照される想定か |
| --- | --- | --- |
| `_schema.js` | 型定義（実データなし） | エディタ補完 / 将来の zod 移行先 |
| `site.config.js` | サイト名・ナビ項目・ヘッダー CTA・SNS・フッター | `Header.jsx` / `Footer.jsx` |
| `pricing.config.js` | 料金プラン配列 | `PricingPage.jsx` / `PricingTable.jsx` / `PricingCard.jsx` |
| `flow.config.js` | 制作フローのステップ配列 | `FlowPage.jsx` / `FlowSteps.jsx` |
| `contact.config.js` | フォーム項目・送信先・件名テンプレ | `ContactPage.jsx` / `ContactForm.jsx` |
| `works/categories.js` | カテゴリ配列 | `WorksPage.jsx` / `WorksFilter.jsx` |
| `works/items/*.json` | 個別作品（後続で追加） | `lib/works.js` 経由で集約 |

## 編集ルール

1. **JSX / 副作用を書かない**
   - config はプレーンな値（オブジェクト・配列・文字列）のみ。アイコンや関数は名前で参照。
2. **環境差は `import.meta.env` で上書き可能にする**
   - 例: `contact.config.js` の `endpoint` は実行時に `VITE_CONTACT_ENDPOINT` で上書きする。
3. **id / slug は変更しない**
   - 既存ページや CTA の URL（例: `/contact?plan=icon-basic`）が壊れます。
4. **スキーマと一致させる**
   - 各ファイル冒頭の JSDoc 型注釈と `_schema.js` の typedef を一致させてください。
5. **このディレクトリ内では他の config を import しない**
   - 結合度を下げるため、cross-import は避けます（必要な場合は呼び出し側で組み合わせる）。

## 雛形の現状

ステップ2前半（雛形作成）時点では、各 config の export 値は空配列または `null` です。
実データの投入はステップ3以降の指示に従って順次行います。
