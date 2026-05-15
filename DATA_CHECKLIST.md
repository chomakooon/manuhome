# 実データ投入チェックリスト

ガワ完成後、**公開前**に以下を実データに置き換えてください。
各ファイルの先頭に「記入ガイド」コメントを追加済みなので、開いてすぐ書き換えられます。

---

## 🔴 必須（これがないと公開できない）

- [ ] **`src/config/profile.config.js`** — 自己紹介・経歴・3 つのこだわり・制作スタイル
  - 全フィールド（name / tagline / intro / story / values / closing / homeMessage 等）を実体験ベースに
  - 顔写真は **配置済み**（`public/profile/mana-portrait.jpg`、Phase 12 で岡崎さん本人写真へ差し替え済み）
- [ ] **`src/config/social.config.js`** — SNS URL（X / Instagram / Threads）
  - 現状はトップページ URL のプレースホルダ。**クリックすると無関係なページへ飛ぶ**ので公開前修正必須
- [ ] **`src/config/seo.config.js`** — 検索エンジン / SNS シェアの土台
  - `SEO_DEFAULTS.twitterHandle` を実アカウントへ
  - `SEO_DEFAULTS.siteUrl` を独自ドメイン取得時に更新
  - `ORG_JSON_LD.sameAs` に実 SNS URL を配列で追加（社会的証明の強化）

## 🟡 推奨（説得力に直結）

- [ ] **`src/config/testimonials.config.js`** — お客様の声
  - 最低 3 件（できれば 5 件）。Phase 19 で 3 件のサンプル配置済み
  - 「依頼前の悩み → 依頼後の変化」の構造があると説得力 ↑
- [ ] **`src/config/before-after.config.js`** — Before / After ケース
  - 3 ケース分の `afterImage` を **既存ポートフォリオ画像から実案件納品物へ差し替え**
  - `beforeText` / `afterText` を実顧客の声に基づくものへ
- [ ] **`src/config/site-stats.config.js`** — 数字で見るカタチ便
  - 制作実績 / 対応カテゴリ / リピート率 / 最短納期 を実数へ
  - ⚠️ 誇張は信頼を損ねるため控えめな実数で

## 🟢 任意（後からでも可・印象を磨くフェーズで）

- [ ] **`src/config/concerns.config.js`** — お悩み 6 件
  - 実顧客の DM / 問い合わせから集めた言葉に置き換えると効果 ↑
- [ ] **`src/config/strengths.config.js`** — 5 つの強み
  - 事業の実態に合わせて文言の精度を上げる
- [ ] **`src/config/personas.config.js`** — ペルソナ別「こんな方におすすめ」
  - 4 ペルソナの problem / solution / recommendedPlan / ctaText の精緻化

---

## 各ファイルの場所と記入方法

| ファイル | 担当セクション | 件数目安 |
|---|---|---|
| `src/config/profile.config.js` | /about ページ + ホーム「運営者紹介」 | 1 つの大きなオブジェクト |
| `src/config/testimonials.config.js` | ホーム「お客様の声」 | 3〜5 件の配列 |
| `src/config/before-after.config.js` | ホーム「Before → After」 | 3 件の配列 |
| `src/config/site-stats.config.js` | ホーム「数字で見るカタチ便」 | 4 件の配列 |
| `src/config/concerns.config.js` | ホーム「こんなお悩みありませんか？」 | 6 件の配列 |
| `src/config/strengths.config.js` | ホーム「カタチ便ができること」 | 5 件の配列 |
| `src/config/personas.config.js` | ホーム「こんな方におすすめ」 | 4 件の配列 |
| `src/config/social.config.js` | ContactPage / Links 等 SNS リンク | URL マップ |
| `src/config/seo.config.js` | 全ページ SEO / OGP | 全体設定 + ページ別 |

---

## OG / Favicon 画像（別途配置が必要）

これらはコードではなく画像ファイルの配置で対応します:

- [ ] `public/og-images/og-home.jpg`（1200×630px、必須）
- [ ] `public/og-images/og-about.jpg` 他 9 枚（推奨）
  - 詳細は `public/og-images/README.txt` 参照
- [ ] `public/favicon-32x32.png` `favicon-16x16.png` `apple-touch-icon.png`（任意・SVG だけでも動く）

OG 画像は SNS シェア時のサムネイル。最低でも `og-home.jpg` だけ用意すると他ページもフォールバックされます。

---

## 配置確認の手順

```bash
# 1. ローカルで起動して目視確認
npm run dev

# 2. ビルドが通ることを確認
npm run build

# 3. デプロイ後、Lighthouse でスコア確認
#    Chrome DevTools → Lighthouse タブ → Mobile / Desktop
```

---

## 各セクションの「非表示」方法

実データが揃わないセクションは、`src/sites/kataribin/pages/KataribinHomePage.jsx` の
return 内の対応する `<XxxSection />` をコメントアウトすれば一時的に隠せます。

例: `<TestimonialsSection />` をコメントアウト → 「お客様の声」セクション非表示。

詳細はファイル上部のセクション順序コメントを参照してください。
