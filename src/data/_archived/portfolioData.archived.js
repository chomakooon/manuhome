/**
 * @file src/data/_archived/portfolioData.archived.js
 * @archivedAt 2026-05-07
 * @reason  ステップ2後半（portfolioData.js の全面再構築）に伴い、旧30件をここに退避。
 *          メタデータ（title / description / category / subCategory / isMain）は温存。
 *          画像本体は src/data 配下には保管していない（旧 @fs パスは git 履歴を参照）。
 *
 * 注意:
 *   - このファイルは参照用のスナップショットであり、本体コードからは import しない。
 *   - 復元する場合は本ファイルの内容を src/data/portfolioData.js にコピーし直すこと。
 *   - 名前衝突を避けるため、エクスポート名は archived プレフィックスを付与。
 */

const PLACEHOLDER_IMAGE = '/works/placeholder.svg';

export const archivedCategories = [
    { id: 'all', name: 'すべて' },
    { id: 'illustration', name: 'イラスト' },
    { id: 'design', name: 'デザイン' },
    { id: 'manga', name: '漫画' },
];

export const archivedPortfolioItems = [
    // 1. Icon
    { id: 1, isMain: true, title: 'SNS用アイコン', category: 'illustration', subCategory: 'icon', image: PLACEHOLDER_IMAGE, originalImageFilename: '1.jpg', description: 'SNSやブログで活用できる親しみやすいオリジナルアイコンを制作し、第一印象を和らげ認知度を向上させます。' },
    { id: '1-a', isMain: false, title: 'SNS用アイコン', category: 'illustration', subCategory: 'icon', image: PLACEHOLDER_IMAGE, originalImageFilename: '1-a.jpg', description: '' },
    { id: '1-b', isMain: false, title: 'SNS用アイコン', category: 'illustration', subCategory: 'icon', image: PLACEHOLDER_IMAGE, originalImageFilename: '1-b.jpg', description: '' },
    { id: '1-c', isMain: false, title: 'SNS用アイコン', category: 'illustration', subCategory: 'icon', image: PLACEHOLDER_IMAGE, originalImageFilename: '1-c.jpg', description: '' },
    { id: '1-d', isMain: false, title: 'SNS用アイコン', category: 'illustration', subCategory: 'icon', image: PLACEHOLDER_IMAGE, originalImageFilename: '1-d.jpg', description: '' },

    // 2. 4Koma Manga
    { id: 2, isMain: true, title: 'ビジネス紹介４コマ', category: 'manga', subCategory: 'manga_4koma', image: PLACEHOLDER_IMAGE, originalImageFilename: '2.jpg', description: '複雑なビジネスモデルや無形商材のサービス内容などを、親しみやすい４コマ漫画でわかりやすく伝えます。' },
    { id: '2-a', isMain: false, title: '４コマ漫画', category: 'manga', subCategory: 'manga_4koma', image: PLACEHOLDER_IMAGE, originalImageFilename: '2-a.jpg', description: '' },
    { id: '2-b', isMain: false, title: '４コマ漫画', category: 'manga', subCategory: 'manga_4koma', image: PLACEHOLDER_IMAGE, originalImageFilename: '2-b.jpg', description: '' },
    { id: '2-c', isMain: false, title: '４コマ漫画', category: 'manga', subCategory: 'manga_4koma', image: PLACEHOLDER_IMAGE, originalImageFilename: '2-c.jpg', description: '' },
    { id: '2-d', isMain: false, title: '４コマ漫画', category: 'manga', subCategory: 'manga_4koma', image: PLACEHOLDER_IMAGE, originalImageFilename: '2-d.jpg', description: '' },

    // 3. Portrait
    { id: 3, isMain: true, title: '似顔絵イラスト', category: 'illustration', subCategory: 'portrait', image: PLACEHOLDER_IMAGE, originalImageFilename: '3.jpg', description: '名刺やプロフィール画像に最適な似顔絵イラスト。温かみのあるタッチで、あなたの人柄や魅力を最大限に引き出します。' },
    { id: '3-a', isMain: false, title: '似顔絵イラスト', category: 'illustration', subCategory: 'portrait', image: PLACEHOLDER_IMAGE, originalImageFilename: '3-a.jpg', description: '' },
    { id: '3-b', isMain: false, title: '似顔絵イラスト', category: 'illustration', subCategory: 'portrait', image: PLACEHOLDER_IMAGE, originalImageFilename: '3-b.jpg', description: '' },
    { id: '3-c', isMain: false, title: '似顔絵イラスト', category: 'illustration', subCategory: 'portrait', image: PLACEHOLDER_IMAGE, originalImageFilename: '3-c.jpg', description: '' },
    { id: '3-d', isMain: false, title: '似顔絵イラスト', category: 'illustration', subCategory: 'portrait', image: PLACEHOLDER_IMAGE, originalImageFilename: '3-d.jpg', description: '' },

    // 4. Pet Goods
    { id: 4, isMain: true, title: 'うちの子グッズ', category: 'illustration', subCategory: 'pet', image: PLACEHOLDER_IMAGE, originalImageFilename: '4.jpg', description: '大切なペットの写真から温かみのあるオリジナルイラストを作成し、マグカップやトートバッグなどの専用グッズに展開します。' },
    { id: '4-a', isMain: false, title: 'うちの子グッズ', category: 'illustration', subCategory: 'pet', image: PLACEHOLDER_IMAGE, originalImageFilename: '4-a.jpg', description: '' },
    { id: '4-b', isMain: false, title: 'うちの子グッズ', category: 'illustration', subCategory: 'pet', image: PLACEHOLDER_IMAGE, originalImageFilename: '4-b.jpg', description: '' },
    { id: '4-c', isMain: false, title: 'うちの子グッズ', category: 'illustration', subCategory: 'pet', image: PLACEHOLDER_IMAGE, originalImageFilename: '4-c.jpg', description: '' },
    { id: '4-d', isMain: false, title: 'うちの子グッズ', category: 'illustration', subCategory: 'pet', image: PLACEHOLDER_IMAGE, originalImageFilename: '4-d.jpg', description: '' },

    // 5. Logo
    { id: 5, isMain: true, title: 'ロゴ制作', category: 'design', subCategory: 'logo', image: PLACEHOLDER_IMAGE, originalImageFilename: '5.jpg', description: '企業の想いやサービスのコンセプトを視覚化します。シンプルで記憶に残りやすい、洗練されたロゴデザインを提供します。' },
    { id: '5-a', isMain: false, title: 'ロゴ制作', category: 'design', subCategory: 'logo', image: PLACEHOLDER_IMAGE, originalImageFilename: '5-a.jpg', description: '' },
    { id: '5-b', isMain: false, title: 'ロゴ制作', category: 'design', subCategory: 'logo', image: PLACEHOLDER_IMAGE, originalImageFilename: '5-b.jpg', description: '' },
    { id: '5-c', isMain: false, title: 'ロゴ制作', category: 'design', subCategory: 'logo', image: PLACEHOLDER_IMAGE, originalImageFilename: '5-c.jpg', description: '' },
    { id: '5-d', isMain: false, title: 'ロゴ制作', category: 'design', subCategory: 'logo', image: PLACEHOLDER_IMAGE, originalImageFilename: '5-d.jpg', description: '' },

    // 6. Character
    { id: 6, isMain: true, title: 'キャラクター制作', category: 'illustration', subCategory: 'character', image: PLACEHOLDER_IMAGE, originalImageFilename: '6.jpg', description: '企業の公式マスコットやYouTubeチャンネル用のオリジナルキャラクターデザイン。親しみやすさとブランド力を両立します。' },
    { id: '6-a', isMain: false, title: 'キャラクター', category: 'illustration', subCategory: 'character', image: PLACEHOLDER_IMAGE, originalImageFilename: '6-a.jpg', description: '' },
    { id: '6-b', isMain: false, title: 'キャラクター', category: 'illustration', subCategory: 'character', image: PLACEHOLDER_IMAGE, originalImageFilename: '6-b.jpg', description: '' },
    { id: '6-c', isMain: false, title: 'キャラクター', category: 'illustration', subCategory: 'character', image: PLACEHOLDER_IMAGE, originalImageFilename: '6-c.jpg', description: '' },
    { id: '6-d', isMain: false, title: 'キャラクター', category: 'illustration', subCategory: 'character', image: PLACEHOLDER_IMAGE, originalImageFilename: '6-d.jpg', description: '' },
];
