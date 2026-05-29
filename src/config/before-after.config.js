/**
 * ====================================================================
 * 【記入ガイド】Before → After ケース (before-after.config.js)
 * ====================================================================
 * HomePage の「Before → After」セクションで「ご依頼前 vs ご依頼後」を
 * 可視化するためのデータです。松本氏ブランディング論の「変化の可視化」
 * を反映しています。
 *
 * ── フィールド説明 ──
 *   id          [必須] 一意な数値
 *   title       [必須] ケースタイトル
 *   challenge   [必須] 一文の課題サマリ
 *   solution    [必須] 一文の解決サマリ
 *   beforeText  [必須] Before 側のキャプション 1〜2 行
 *                     （実物の Before 画像ではなく、CSS で作った
 *                       「依頼前の残念な状態」ダミープレビューの説明文）
 *   afterText   [必須] After 側の本文 1〜2 行（数字・成果が入ると尚良し）
 *   afterImage  [必須] After 側の画像パス（public/ 配下の絶対パス）
 *   afterAlt    [必須] After 画像の alt テキスト（a11y / SEO）
 *   beforeType  [必須] Before 側ダミープレビューの種類
 *                     'flyer'    … 素っ気ないチラシ風
 *                     'website'  … 文字だけのウェブサイト風
 *                     'namecard' … 文字だけの名刺風
 *   tags        [必須] 2〜4 件のキーワード（pill 表示）
 *
 * ── 推奨件数 ──
 *   3 件以上（現状 3 件）。多すぎても読まれないので 3〜5 件が目安。
 *
 * 並び順は配列順（先頭が一番目立つ）。
 * ====================================================================
 *
 * @file src/config/before-after.config.js
 */

/**
 * @typedef {Object} BeforeAfterCase
 * @property {number} id
 * @property {string} title         - ケースタイトル
 * @property {string} challenge     - 一文の課題サマリ
 * @property {string} solution      - 一文の解決サマリ
 * @property {string} beforeText    - Before 側ダミープレビューのキャプション
 * @property {string} afterText     - After 側の本文
 * @property {string} afterImage    - After 側の画像パス
 * @property {string} afterAlt      - After 画像の代替テキスト
 * @property {'flyer'|'website'|'namecard'} beforeType - Before ダミープレビュー種別
 * @property {string[]} tags        - キーワードタグ
 */

/** @type {BeforeAfterCase[]} */
export const BEFORE_AFTER_CASES = [
    {
        id: 1,
        title: '新サービスの魅力を 4 コマ漫画で',
        challenge:
            'まだ世にない新しいサービス。文章や口頭では魅力が伝わらなかった',
        solution: '4 コマ漫画でサービスのストーリーと価値を視覚化',
        beforeText:
            '文字だけの説明では、新しい概念がうまく伝わらず素通りされていた',
        afterText:
            'セリフとイラストで一読で理解できる 4 コマに。「何のサービスか」が一瞬で伝わる',
        afterImage: '/works/manga-4koma-1.jpg',
        afterAlt: '新サービスを説明する 4 コマ漫画',
        beforeType: 'flyer',
        // 実例ベースのBefore画像: 既存のイベントLPスクショ
        beforeImage: '/works/before-1-event-lp.jpg',
        beforeAlt: '改善前のイベントLP（テキスト中心・ビジュアル弱め）',
        tags: ['4 コマ漫画', '新サービス', 'イベント'],
    },
    {
        id: 2,
        title: 'キャラクター設定でブランドの世界観を構築',
        challenge:
            '商品はあるけど、ブランドとしての世界観・個性が伝わっていなかった',
        solution: 'キャラクター設定シートを作成し、ブランドの「顔」を確立',
        beforeText:
            '文字情報だけのサイトでは、ブランドの個性が伝わらなかった',
        afterText:
            'オリジナルキャラクターを軸に、表情・ポーズまで設計。一貫した世界観が生まれた',
        // ⚠️ この画像は岡崎さんが public/works/character-sheet.webp に
        //    手動で配置してください。未配置でも onError でフォールバック表示されます。
        afterImage: '/works/character-sheet.webp',
        afterAlt:
            'オリジナルキャラクターの設定シート（表情・ポーズ・三面図）',
        beforeType: 'website',
        beforeImage: '/works/before-2-website.jpg',
        beforeAlt: '改善前のサンプル企業ダッシュボード風サイト（個性なし）',
        tags: ['キャラクターデザイン', '世界観設計', 'ブランディング'],
    },
    {
        id: 3,
        title: '似顔絵イラスト入りの名刺で信頼感を構築',
        challenge: '名刺・SNS・HP がバラバラで、信頼感を伝えられなかった',
        solution: '似顔絵イラスト＋ブランドカラーで全媒体のデザインを統一',
        beforeText:
            '文字だけの素っ気ない名刺。記憶に残らず、何屋かも伝わりにくかった',
        afterText:
            '似顔絵イラストと統一感のあるデザインで、一目で世界観が伝わり指名相談が増加',
        afterImage: '/works/card-1.jpg',
        afterAlt: '似顔絵イラスト入りの名刺デザイン',
        beforeType: 'namecard',
        beforeImage: '/works/before-3-namecard.jpg',
        beforeAlt: '改善前の名刺（テキストのみ・QRコード）',
        tags: ['名刺デザイン', '似顔絵イラスト', 'ブランディング'],
    },
];
