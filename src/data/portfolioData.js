/**
 * @file src/data/portfolioData.js
 *
 * テナント "manuhome" の作品 / 商品データ。
 * - 共通スキーマは src/config/_schema.js (WorksItem) を参照
 * - カテゴリ定義は src/config/works/categories.js を単一ソースとして利用
 * - 旧30件は src/data/_archived/portfolioData.archived.js に退避済み
 *
 * 編集ルール:
 *   - 1作品 = rawItems の1要素。tenantId は portfolioItems エクスポート時に自動付与
 *   - 画像パスは originalImageFilename から item ヘルパーが自動派生する
 *     （`image` を明示指定すればそれを優先。placeholder へ戻したい場合に利用）
 *   - product 系（itemType='product'）は externalUrl / externalLabel を後追いで埋める
 *   - 各 subCategory に isMain: true を 1 件だけ設ける（サブカテゴリの代表作）
 */

import { worksCategories } from '../config/works/categories';

const TENANT_ID = 'manuhome';
const PLACEHOLDER_IMAGE = '/works/placeholder.svg';

/**
 * 既存ページ（PortfolioPage / PortfolioSubCategoryPage）が import している
 * shape `{ id, name }` を維持するための後方互換ビュー。
 * 本来は worksCategories を直接参照するのが望ましい（WorksPage 実装時に切替予定）。
 */
export const categories = [
    { id: 'all', name: 'すべて' },
    ...[...worksCategories]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((c) => ({ id: c.id, name: c.label })),
];

/**
 * WorksItem 既定値を埋めるヘルパー（共通ロジック）。
 * image は originalImageFilename から `/works/${filename}` に自動派生する。
 * 明示的に image を渡せば（placeholder 等への退避用途で）そちらを優先する。
 */
const item = (overrides) => {
    const merged = {
        isMain: false,
        description: '',
        itemType: 'portfolio',
        externalUrl: null,
        externalLabel: null,
        reactionCount: null,
        clientName: null,
        ...overrides,
    };
    if (!merged.image) {
        merged.image = merged.originalImageFilename
            ? `/works/${merged.originalImageFilename}`
            : PLACEHOLDER_IMAGE;
    }
    return merged;
};

/** テナント固有データ。tenantId は export 時に注入する */
const rawItems = [
    // ── pet / pet_photo (工程1: 元写真) ─────────────
    item({
        id: 'pet-photo-01', category: 'pet', subCategory: 'pet_photo', isMain: true,
        originalImageFilename: 'pet-photo-1.jpg',
        title: 'ペット元写真サンプル',
        description: 'イラスト化前のペット写真のサンプル。ご提供いただく写真の参考としてご活用ください。',
    }),
    item({ id: 'pet-photo-02', category: 'pet', subCategory: 'pet_photo', originalImageFilename: 'pet-photo-2.jpg', title: 'ペット元写真サンプル' }),
    item({ id: 'pet-photo-03', category: 'pet', subCategory: 'pet_photo', originalImageFilename: 'pet-photo-3.jpg', title: 'ペット元写真サンプル' }),

    // ── pet / pet_illust (工程2: イラスト) ──────────
    item({
        id: 'pet-illust-01', category: 'pet', subCategory: 'pet_illust', isMain: true,
        originalImageFilename: 'pet-illust-1.jpg',
        title: 'ペットイラスト制作',
        description: 'お預かりしたお写真をもとに、温かみのあるオリジナルイラストを描き起こします。',
    }),
    item({ id: 'pet-illust-02', category: 'pet', subCategory: 'pet_illust', originalImageFilename: 'pet-illust-2.jpg', title: 'ペットイラスト制作' }),
    item({ id: 'pet-illust-03', category: 'pet', subCategory: 'pet_illust', originalImageFilename: 'pet-illust-3.jpg', title: 'ペットイラスト制作' }),
    item({ id: 'pet-illust-04', category: 'pet', subCategory: 'pet_illust', originalImageFilename: 'pet-illust-4.jpg', title: 'ペットイラスト制作' }),
    item({ id: 'pet-illust-05', category: 'pet', subCategory: 'pet_illust', originalImageFilename: 'pet-illust-5.jpg', title: 'ペットイラスト制作' }),

    // ── pet / pet_goods (工程3: グッズ写真) ─────────
    item({
        id: 'pet-goods-01', category: 'pet', subCategory: 'pet_goods', isMain: true,
        originalImageFilename: 'pet-goods-1.jpg',
        title: 'うちの子グッズ',
        description: '完成したイラストはマグカップやトートバッグなどのオリジナルグッズに展開できます。',
    }),
    item({ id: 'pet-goods-02', category: 'pet', subCategory: 'pet_goods', originalImageFilename: 'pet-goods-2.jpg', title: 'うちの子グッズ' }),
    item({ id: 'pet-goods-03', category: 'pet', subCategory: 'pet_goods', originalImageFilename: 'pet-goods-3.jpg', title: 'うちの子グッズ' }),

    // ── manga / manga_4koma ─────────────────────────
    item({
        id: 'manga-4koma-01', category: 'manga', subCategory: 'manga_4koma', isMain: true,
        originalImageFilename: 'manga-4koma-1.jpg',
        title: 'B2B向けPR4コマ漫画',
        description: '複雑なサービスや商材の魅力を、4コマ漫画で親しみやすく伝えます。',
    }),
    item({ id: 'manga-4koma-02', category: 'manga', subCategory: 'manga_4koma', originalImageFilename: 'manga-4koma-2.jpg', title: 'B2B向けPR4コマ漫画' }),
    item({ id: 'manga-4koma-03', category: 'manga', subCategory: 'manga_4koma', originalImageFilename: 'manga-4koma-3.jpg', title: 'B2B向けPR4コマ漫画' }),

    // ── manga / manga_1page ─────────────────────────
    item({
        id: 'manga-1page-01', category: 'manga', subCategory: 'manga_1page', isMain: true,
        originalImageFilename: 'manga-1page-1.jpg',
        title: '1ページ漫画',
        description: '企業ストーリーや採用広報を1ページの漫画で伝えるフォーマット。',
    }),

    // ── businesscard ────────────────────────────────
    item({
        id: 'card-01', category: 'businesscard', subCategory: 'businesscard', isMain: true,
        originalImageFilename: 'card-1.jpg',
        title: '似顔絵入り名刺',
        description: '名刺に似顔絵イラストを差し込み、第一印象に温かみを加えます。',
    }),
    item({ id: 'card-02', category: 'businesscard', subCategory: 'businesscard', originalImageFilename: 'card-2.jpg', title: '似顔絵入り名刺' }),

    // ── illustration / portrait ─────────────────────
    item({
        id: 'portrait-01', category: 'illustration', subCategory: 'portrait', isMain: true,
        originalImageFilename: 'portrait-1.jpg',
        title: '似顔絵イラスト',
        description: 'プロフィール写真や記念用に、温かみのある似顔絵を制作します。',
    }),
    item({ id: 'portrait-02', category: 'illustration', subCategory: 'portrait', originalImageFilename: 'portrait-2.jpg', title: '似顔絵イラスト' }),

    // ── illustration / icon ─────────────────────────
    item({
        id: 'icon-01', category: 'illustration', subCategory: 'icon', isMain: true,
        originalImageFilename: 'icon-1.jpg',
        title: 'SNS用アイコン',
        description: 'SNSやブログで使えるオリジナルアイコン。第一印象を和らげます。',
    }),

    // ── illustration / logo ─────────────────────────
    item({
        id: 'logo-01', category: 'illustration', subCategory: 'logo', isMain: true,
        originalImageFilename: 'logo-1.jpg',
        title: 'ロゴ制作',
        description: '企業の想いやサービスのコンセプトを視覚化したロゴデザイン。',
    }),

    // ── illustration / character ────────────────────
    item({
        id: 'character-01', category: 'illustration', subCategory: 'character', isMain: true,
        originalImageFilename: 'character-1.jpg',
        title: 'キャラクター制作',
        description: '公式マスコットやチャンネル用キャラクターのデザイン。',
    }),

    // ── shop / line_stamp (自社販売商品) ────────────
    item({
        id: 'stamp-01', category: 'shop', subCategory: 'line_stamp', isMain: true,
        itemType: 'product',
        originalImageFilename: 'stamp-1.jpg',
        title: 'オリジナルLINEスタンプ',
        description: 'クリエイター本人が制作・販売しているLINEスタンプ。',
    }),
    item({ id: 'stamp-02', category: 'shop', subCategory: 'line_stamp', itemType: 'product', originalImageFilename: 'stamp-2.jpg', title: 'オリジナルLINEスタンプ' }),
    item({ id: 'stamp-03', category: 'shop', subCategory: 'line_stamp', itemType: 'product', originalImageFilename: 'stamp-3.jpg', title: 'オリジナルLINEスタンプ' }),

    // ── shop / sd_banner (自社販売商品) ─────────────
    item({
        id: 'banner-01', category: 'shop', subCategory: 'sd_banner', isMain: true,
        itemType: 'product',
        originalImageFilename: 'banner-1.jpg',
        title: 'SD/漫画バナー販売',
        description: 'SNS運用や広告バナー向けに、SDキャラ・漫画スタイルのバナー素材を販売中。',
    }),
    item({ id: 'banner-02', category: 'shop', subCategory: 'sd_banner', itemType: 'product', originalImageFilename: 'banner-2.jpg', title: 'SD/漫画バナー販売' }),
];

/** @type {import('../config/_schema.js').WorksItem[]} */
export const portfolioItems = rawItems.map((it) => ({ ...it, tenantId: TENANT_ID }));
