export const categories = [
    { id: 'all', name: 'すべて' },
    { id: 'illustration', name: 'イラスト' },
    { id: 'design', name: 'デザイン' },
    { id: 'manga', name: '漫画' },
];

export const portfolioItems = [
    // 1. Icon
    { id: 1, isMain: true, title: 'SNS用アイコン', category: 'illustration', subCategory: 'icon', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773168252110.jpg', description: 'SNSやブログで活用できる親しみやすいオリジナルアイコンを制作し、第一印象を和らげ認知度を向上させます。' },
    { id: '1-a', isMain: false, title: 'SNS用アイコン', category: 'illustration', subCategory: 'icon', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773168252130.jpg', description: '' },
    { id: '1-b', isMain: false, title: 'SNS用アイコン', category: 'illustration', subCategory: 'icon', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773168252143.jpg', description: '' },
    { id: '1-c', isMain: false, title: 'SNS用アイコン', category: 'illustration', subCategory: 'icon', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773168252160.png', description: '' },
    { id: '1-d', isMain: false, title: 'SNS用アイコン', category: 'illustration', subCategory: 'icon', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773168252336.jpg', description: '' },

    // 2. 4Koma Manga
    { id: 2, isMain: true, title: 'ビジネス紹介４コマ', category: 'manga', subCategory: 'manga_4koma', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773169597220.jpg', description: '複雑なビジネスモデルや無形商材のサービス内容などを、親しみやすい４コマ漫画でわかりやすく伝えます。' },
    { id: '2-a', isMain: false, title: '４コマ漫画', category: 'manga', subCategory: 'manga_4koma', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773169597235.png', description: '' },
    { id: '2-b', isMain: false, title: '４コマ漫画', category: 'manga', subCategory: 'manga_4koma', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773169597248.jpg', description: '' },
    { id: '2-c', isMain: false, title: '４コマ漫画', category: 'manga', subCategory: 'manga_4koma', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773169597453.png', description: '' },
    { id: '2-d', isMain: false, title: '４コマ漫画', category: 'manga', subCategory: 'manga_4koma', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773169597470.jpg', description: '' },

    // 3. Portrait
    { id: 3, isMain: true, title: '似顔絵イラスト', category: 'illustration', subCategory: 'portrait', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773169852517.jpg', description: '名刺やプロフィール画像に最適な似顔絵イラスト。温かみのあるタッチで、あなたの人柄や魅力を最大限に引き出します。' },
    { id: '3-a', isMain: false, title: '似顔絵イラスト', category: 'illustration', subCategory: 'portrait', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773169903838.jpg', description: '' },
    { id: '3-b', isMain: false, title: '似顔絵イラスト', category: 'illustration', subCategory: 'portrait', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773169903848.jpg', description: '' },
    { id: '3-c', isMain: false, title: '似顔絵イラスト', category: 'illustration', subCategory: 'portrait', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773169903958.png', description: '' },
    { id: '3-d', isMain: false, title: '似顔絵イラスト', category: 'illustration', subCategory: 'portrait', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773169904209.png', description: '' },

    // 4. Pet Goods
    { id: 4, isMain: true, title: 'うちの子グッズ', category: 'illustration', subCategory: 'pet', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773170248540.jpg', description: '大切なペットの写真から温かみのあるオリジナルイラストを作成し、マグカップやトートバッグなどの専用グッズに展開します。' },
    { id: '4-a', isMain: false, title: 'うちの子グッズ', category: 'illustration', subCategory: 'pet', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773170248705.jpg', description: '' },
    { id: '4-b', isMain: false, title: 'うちの子グッズ', category: 'illustration', subCategory: 'pet', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773170248722.jpg', description: '' },
    { id: '4-c', isMain: false, title: 'うちの子グッズ', category: 'illustration', subCategory: 'pet', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773170248730.jpg', description: '' },
    { id: '4-d', isMain: false, title: 'うちの子グッズ', category: 'illustration', subCategory: 'pet', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773170249001.jpg', description: '' },

    // 5. Logo
    { id: 5, isMain: true, title: 'ロゴ制作', category: 'design', subCategory: 'logo', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773169368461.jpg', description: '企業の想いやサービスのコンセプトを視覚化します。シンプルで記憶に残りやすい、洗練されたロゴデザインを提供します。' },
    { id: '5-a', isMain: false, title: 'ロゴ制作', category: 'design', subCategory: 'logo', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773169368478.png', description: '' },
    { id: '5-b', isMain: false, title: 'ロゴ制作', category: 'design', subCategory: 'logo', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773169368482.jpg', description: '' },
    { id: '5-c', isMain: false, title: 'ロゴ制作', category: 'design', subCategory: 'logo', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773169368509.png', description: '' },
    { id: '5-d', isMain: false, title: 'ロゴ制作', category: 'design', subCategory: 'logo', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773169368548.png', description: '' },

    // 6. Character
    { id: 6, isMain: true, title: 'キャラクター制作', category: 'illustration', subCategory: 'character', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773169041629.png', description: '企業の公式マスコットやYouTubeチャンネル用のオリジナルキャラクターデザイン。親しみやすさとブランド力を両立します。' },
    { id: '6-a', isMain: false, title: 'キャラクター', category: 'illustration', subCategory: 'character', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773169041719.jpg', description: '' },
    { id: '6-b', isMain: false, title: 'キャラクター', category: 'illustration', subCategory: 'character', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773169041821.jpg', description: '' },
    { id: '6-c', isMain: false, title: 'キャラクター', category: 'illustration', subCategory: 'character', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773169041871.jpg', description: '' },
    { id: '6-d', isMain: false, title: 'キャラクター', category: 'illustration', subCategory: 'character', image: '/@fs/Users/sitter/.gemini/antigravity/brain/1b9c131e-b260-4e1b-924d-60e540061b5e/media__1773169041891.png', description: '' }
];
