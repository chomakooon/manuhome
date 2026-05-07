/**
 * @file src/config/works/categories.js
 *
 * /works ページのカテゴリ定義（テナント "manuhome" 用）。
 * WorksPage / WorksFilter および後方互換のため src/data/portfolioData.js が参照する。
 *
 * @see ../_schema.js  (WorksCategory の型定義)
 *
 * 編集ルール:
 *   - 'all' は WorksFilter 側で動的に生成するため、ここには含めない
 *   - id は src/data/portfolioData.js の category と一致させる
 *   - subCategories は実際に使用する subCategory id を網羅する
 *   - sortOrder 昇順で表示される
 *   - isShop=true のカテゴリは自社販売商品カテゴリとして UI で区別する
 */

/** @type {import('../_schema.js').WorksCategory[]} */
export const worksCategories = [
    {
        id: 'pet',
        label: 'ペットイラスト',
        description: '写真からイラスト、グッズまで',
        subCategories: ['pet_photo', 'pet_illust', 'pet_goods'],
        sortOrder: 1,
    },
    {
        id: 'manga',
        label: '漫画・4コマ',
        description: 'B2B向けPR漫画',
        subCategories: ['manga_4koma', 'manga_1page'],
        sortOrder: 2,
    },
    {
        id: 'businesscard',
        label: '名刺デザイン',
        description: '似顔絵入り名刺対応',
        subCategories: ['businesscard'],
        sortOrder: 3,
    },
    {
        id: 'illustration',
        label: 'イラスト・キャラクター',
        description: '似顔絵・SNSアイコン・ロゴ・キャラ',
        subCategories: ['portrait', 'icon', 'logo', 'character'],
        sortOrder: 4,
    },
    {
        id: 'shop',
        label: 'オリジナル販売',
        description: 'LINEスタンプ・バナー販売中',
        subCategories: ['line_stamp', 'sd_banner'],
        sortOrder: 5,
        isShop: true,
    },
];
