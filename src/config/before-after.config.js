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
 *   title       [必須] ケースタイトル（例 "個人事業主のブランド再構築"）
 *   challenge   [必須] 一文の課題サマリ
 *   solution    [必須] 一文の解決サマリ
 *   beforeText  [必須] Before 側の本文 1〜2 行（画像なしのテキスト表現）
 *   afterText   [必須] After 側の本文 1〜2 行（数字・成果が入ると尚良し）
 *   afterImage  [必須] After 側の画像パス（public/ 配下の絶対パス）
 *                     現状は既存ポートフォリオ画像を流用しています。
 *                     ⚠️ 実案件の納品画像に差し替えてください。
 *   afterAlt    [必須] After 画像の alt テキスト（a11y / SEO）
 *   tags        [必須] 2〜4 件のキーワード（pill 表示）
 *
 * ── 推奨件数 ──
 *   3 件以上（現状 3 件）。多すぎても読まれないので 3〜5 件が目安。
 *
 * ── 記入例 ──
 *   {
 *     id: 4,
 *     title: '採用ブランディング刷新',
 *     challenge: '採用 LP の応募率が伸び悩み、雰囲気もぼやけていた',
 *     solution: 'キャラクター + ストーリー漫画で「働く未来」を可視化',
 *     beforeText: '写真と文章だけの一般的な採用 LP',
 *     afterText: '応募率が前月比 1.8 倍に。社内浸透も加速',
 *     afterImage: '/works/manga-1page-1.jpg',
 *     afterAlt: '採用ブランディングの 1 ページ漫画',
 *     tags: ['採用', 'LP漫画', 'キャラ'],
 *   }
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
 * @property {string} beforeText    - Before 側の本文（画像なし）
 * @property {string} afterText     - After 側の本文
 * @property {string} afterImage    - After 側の画像パス（既存 works 流用 OK）
 * @property {string} afterAlt      - After 画像の代替テキスト
 * @property {string[]} tags        - キーワードタグ
 */

/** @type {BeforeAfterCase[]} */
export const BEFORE_AFTER_CASES = [
    // ⚠️ 以下は全てサンプル。afterImage は既存ポートフォリオを流用しているため、
    // 公開前に「実案件の納品画像 + 実顧客の声」へ差し替えてください。
    {
        id: 1,
        title: '個人事業主のブランド再構築', // ← サンプル、要差し替え
        challenge: '名刺・SNS・HP がバラバラで、信頼感を伝えられなかった',
        solution: 'ロゴから世界観を統一し、全媒体を再設計',
        beforeText: '統一感がなく、何屋かが一目で分かりにくい状態でした。',
        afterText: '一目で世界観が伝わり、指名相談が増加。価格交渉も減少しました。',
        afterImage: '/works/card-1.jpg',
        afterAlt: '統一感のある名刺デザイン',
        tags: ['ブランディング', '名刺', 'SNS'],
    },
    {
        id: 2,
        title: 'ペットグッズ D2C の立ち上げ',
        challenge: '商品はあるけど、SNS での反応が伸び悩んでいた',
        solution: 'PAWS PRESS のキャラ世界観で、全 SNS 導線を統一',
        beforeText: '商品写真だけでは、共感もファンも生まれませんでした。',
        afterText: 'ストーリーで売れる、共感ベースの顧客獲得に転換できました。',
        afterImage: '/works/pet-goods-1.jpg',
        afterAlt: 'PAWS PRESS のペットグッズ',
        tags: ['D2C', 'キャラデザイン', 'SNS 運用'],
    },
    {
        id: 3,
        title: '飲食店のメニュー漫画化',
        challenge: 'メニュー写真だけでは、料理のこだわりが伝わらない',
        solution: '4 コマ漫画でストーリーを表現、SNS 拡散も意識した構成に',
        beforeText: '写真だけの普通のメニュー、見るだけで素通りされていました。',
        afterText: '漫画で「読まれる」メニューに転換、来店動機 UP・SNS 拡散にも貢献。',
        afterImage: '/works/manga-4koma-1.jpg',
        afterAlt: '飲食店向けの 4 コマ漫画',
        tags: ['販促漫画', 'メニュー', '飲食店'],
    },
];
