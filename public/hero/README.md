# `public/hero/` — ヒーロー画像配置先

サイト各所のトップ／メインビジュアル（ヒーロー画像）の配置先です。
`<img src="/hero/<filename>" />` の絶対パスで参照できます。

## 用途

- 各ブランドのトップページ・メインビジュアル
- セクション冒頭のキービジュアル
- OGP / SNS シェア用画像

## 推奨

- ファイル名規則: `<site>-<role>-<n>.<ext>`
  - 例: `kataribin-top-1.jpg` / `pawspress-top-1.jpg` / `kataribin-about-1.jpg`
- フォーマット: 写真は `.jpg`、イラストは `.png` または `.svg`
- 解像度: 横幅 1920px 以上を推奨（Retina 対応）

## 参考: ブランド構造

- `kataribin-*` = 岡崎真奈のHP（屋号: かたち便）用
- `pawspress-*` = PAWS PRESS（ペットグッズ専門）用

詳細は `src/sites/README.md` を参照。
