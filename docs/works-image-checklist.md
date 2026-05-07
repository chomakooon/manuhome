# Works Image Checklist (manuhome)

ステップ2後半で `src/data/portfolioData.js` を新データ構造で再構築しました。
画像パスは `originalImageFilename` から `/works/<filename>` に自動派生する仕組みになっており、
下表の「予定ファイル名」で `public/works/` 配下に配置すれば即座に表示されます。

- 配置先: `public/works/<予定ファイル名>`
- ソース画像保管場所（推奨）: `~/Desktop/manuhome-works-source/<カテゴリ>/`
- 「クライアント名」「入手元メモ」列は許諾済みの場合のみ記入
- ファイル名規則: 番号は1桁固定（10件以上ある場合のみ2桁化）。現状すべて1桁

## 総件数

- ポートフォリオ系（itemType: 'portfolio'）: **22 件**
- 自社販売商品（itemType: 'product'）: **5 件**
- **合計: 27 件**

## ポートフォリオ系

### pet（ペットイラスト） — 11件

| id | subCategory | title | 予定ファイル名 | clientName | 入手元メモ |
| --- | --- | --- | --- | --- | --- |
| pet-photo-01 | pet_photo | ペット元写真サンプル | pet-photo-1.jpg |  |  |
| pet-photo-02 | pet_photo | ペット元写真サンプル | pet-photo-2.jpg |  |  |
| pet-photo-03 | pet_photo | ペット元写真サンプル | pet-photo-3.jpg |  |  |
| pet-illust-01 | pet_illust | ペットイラスト制作 | pet-illust-1.jpg |  |  |
| pet-illust-02 | pet_illust | ペットイラスト制作 | pet-illust-2.jpg |  |  |
| pet-illust-03 | pet_illust | ペットイラスト制作 | pet-illust-3.jpg |  |  |
| pet-illust-04 | pet_illust | ペットイラスト制作 | pet-illust-4.jpg |  |  |
| pet-illust-05 | pet_illust | ペットイラスト制作 | pet-illust-5.jpg |  |  |
| pet-goods-01 | pet_goods | うちの子グッズ | pet-goods-1.jpg |  |  |
| pet-goods-02 | pet_goods | うちの子グッズ | pet-goods-2.jpg |  |  |
| pet-goods-03 | pet_goods | うちの子グッズ | pet-goods-3.jpg |  |  |

### manga（漫画・4コマ） — 4件

| id | subCategory | title | 予定ファイル名 | clientName | reactionCount | 入手元メモ |
| --- | --- | --- | --- | --- | --- | --- |
| manga-4koma-01 | manga_4koma | B2B向けPR4コマ漫画 | manga-4koma-1.jpg |  |  |  |
| manga-4koma-02 | manga_4koma | B2B向けPR4コマ漫画 | manga-4koma-2.jpg |  |  |  |
| manga-4koma-03 | manga_4koma | B2B向けPR4コマ漫画 | manga-4koma-3.jpg |  |  |  |
| manga-1page-01 | manga_1page | 1ページ漫画 | manga-1page-1.jpg |  |  |  |

### businesscard（名刺デザイン） — 2件

| id | subCategory | title | 予定ファイル名 | clientName | 入手元メモ |
| --- | --- | --- | --- | --- | --- |
| card-01 | businesscard | 似顔絵入り名刺 | card-1.jpg |  |  |
| card-02 | businesscard | 似顔絵入り名刺 | card-2.jpg |  |  |

### illustration（イラスト・キャラクター） — 5件

| id | subCategory | title | 予定ファイル名 | clientName | 入手元メモ |
| --- | --- | --- | --- | --- | --- |
| portrait-01 | portrait | 似顔絵イラスト | portrait-1.jpg |  |  |
| portrait-02 | portrait | 似顔絵イラスト | portrait-2.jpg |  |  |
| icon-01 | icon | SNS用アイコン | icon-1.jpg |  |  |
| logo-01 | logo | ロゴ制作 | logo-1.jpg |  |  |
| character-01 | character | キャラクター制作 | character-1.jpg |  |  |

## 自社販売商品（itemType: 'product'）

### shop / line_stamp — 3件

| id | subCategory | title | 予定ファイル名 | externalUrl | externalLabel | 入手元メモ |
| --- | --- | --- | --- | --- | --- | --- |
| stamp-01 | line_stamp | オリジナルLINEスタンプ | stamp-1.jpg |  |  |  |
| stamp-02 | line_stamp | オリジナルLINEスタンプ | stamp-2.jpg |  |  |  |
| stamp-03 | line_stamp | オリジナルLINEスタンプ | stamp-3.jpg |  |  |  |

### shop / sd_banner — 2件

| id | subCategory | title | 予定ファイル名 | externalUrl | externalLabel | 入手元メモ |
| --- | --- | --- | --- | --- | --- | --- |
| banner-01 | sd_banner | SD/漫画バナー販売 | banner-1.jpg |  |  |  |
| banner-02 | sd_banner | SD/漫画バナー販売 | banner-2.jpg |  |  |  |

## 画像配置手順

ユーザー側のソース画像はカテゴリ単位（subCategory ごとではない）で `~/Desktop/manuhome-works-source/<category>/` に
混在保管されている前提です。新たな mkdir は不要です。

```bash
# 1. 全画像を public/works/ にコピー
cp -r ~/Desktop/manuhome-works-source/*/* ~/Documents/manuhome/public/works/

# 2. 不要なサブディレクトリ構造ができていたら整理
ls ~/Documents/manuhome/public/works/

# 3. dev サーバで確認
cd ~/Documents/manuhome && npm run dev
# /portfolio で各カテゴリ画像が表示されることを確認
```

`portfolioData.js` の `image` フィールドは `originalImageFilename` から自動派生されるため、
画像差し替え時のコード変更は不要です（ファイル名さえ表に揃えれば即反映）。
