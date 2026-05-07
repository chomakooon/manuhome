# `src/sites/` — マルチブランド構造の単一ソース

このリポジトリは **1 リポジトリ・1 サイト内に 2 つのブランド** を成立させます。
訪問者にはそれぞれ独立サイトに見えるよう、レイアウト・テーマ・ページを `src/sites/<brand>/` 配下に分離して保持します。

## ブランドと役割分担

| ディレクトリ | ブランド名 | 適用URL範囲 | 説明 |
| --- | --- | --- | --- |
| `kataribin/` | かたち便（岡崎真奈のHP） | `/pet` 以外すべて | 既存 manuhome 由来。クリエイティブHP / 受注実績 / お問い合わせ |
| `pawspress/` | PAWS PRESS | `/pet` 配下 | ペットグッズ専門ブランド。独立サイトの体裁 |

ルーティング切替は `src/App.jsx`（あるいは将来導入する Layout 切替ロジック）で行う想定。
本ステップでは **準備のみ** で、まだルーティングや既存ページの移動は行っていません。

## 各ブランドのディレクトリ構成

```
src/sites/<brand>/
├── pages/   # ブランド固有ページ（次ステップ以降で移植）
├── layout/  # ブランド固有の Header / Footer / Layout
└── theme/
    └── tokens.js  # ブランドカラー・フォント・スペーシング
```

## 共通コンポーネント

ブランド非依存の汎用 UI（ボタン、カード、アコーディオン、ポートフォリオモーダル等）は
`src/components/` 配下に置き、両ブランドから import します。

ブランド固有の見た目はテーマトークン（CSS 変数 / props）経由で適用してください。
共通コンポーネント側に「ブランド名による分岐」を書かないこと。

## 現状（Step 1 時点）

- ディレクトリと `theme/tokens.js` の雛形のみ作成済み
- 既存 `src/pages/` `src/components/` `src/data/` は未移動
- `src/App.jsx` も未変更
- `pages/` `layout/` 配下は空（`.gitkeep` でディレクトリのみ保持）

## やってはいけないこと

1. **クロスブランド import の禁止**
   - `kataribin/` 配下から `pawspress/` の theme / layout / pages を import しない（逆も同様）
   - ブランド境界を超える参照は **常に `src/components/` 経由** にする

2. **共通コンポーネントへのブランド名直書きの禁止**
   - `if (brand === 'pawspress')` のような分岐を `src/components/` に書かない
   - 差異はテーマトークンや props で表現する

3. **theme/tokens.js から JSX や副作用を export しない**
   - 純粋な値（オブジェクト・文字列・数値）のみ
   - 関数化したい場合は `src/lib/` 等に切り出す

4. **既存 `src/index.css` の CSS 変数との二重管理に注意**
   - 当面は `index.css` が真正のソース。`tokens.js` はそれと整合させる
   - 次ステップで `tokens.js` から CSS 変数を生成する仕組みに寄せる予定

## 関連

- ヒーロー画像: `public/hero/`
- ポートフォリオ画像: `public/works/`
- サイト全体の設定: `src/config/`（site.config.js でナビ・SNS 等を一元管理予定）
