OG Images for カタチ便 (Phase 15)
=================================

このディレクトリには各ページの OGP（SNS シェア時のサムネイル）画像を配置します。

推奨仕様:
  - 解像度: 1200×630px（推奨）/ 1080×566px（最小）
  - 形式: JPG（軽量）または PNG
  - 容量: 1MB 以下推奨
  - 内容: 大きめのテキスト + ブランドカラー（#00CFFF）
  - 日本語フォントは Noto Sans JP / M PLUS Rounded 1c など

必要なファイル:
  - og-home.jpg       … ホーム / 既定
  - og-about.jpg      … /about
  - og-pricing.jpg    … /pricing
  - og-flow.jpg       … /flow
  - og-contact.jpg    … /contact
  - og-portfolio.jpg  … /portfolio
  - og-diagnostic.jpg … /diagnostic
  - og-links.jpg      … /links
  - og-services.jpg   … /services
  - og-pet.jpg        … /pet, /pet/order, /pet/contact

未配置のファイルがあった場合:
  - SNS によっては「画像なし」表示になります
  - 最低限 og-home.jpg だけでも先に配置すると、他ページは
    src/config/seo.config.js の SEO_DEFAULTS.defaultOgImage に
    フォールバックさせるよう設定変更も可能です。

設定変更箇所:
  - src/config/seo.config.js の PAGE_SEO.<key>.ogImage で個別指定
  - 全ページ共通のフォールバックは SEO_DEFAULTS.defaultOgImage
