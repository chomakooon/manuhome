/**
 * @file src/config/before-after.config.js
 *
 * HomePage「Before → After」セクションのデータ（Phase 19）。
 * 松本氏ブランディング論の「変化の可視化」を反映し、依頼前の課題と
 * 依頼後の状態を対比して提示する。Before 側はテキスト表現で代替（撮影不要）。
 *
 * 編集ルール:
 *   - afterImage は public/ 配下の絶対パス。既存の portfolioData の画像を流用
 *   - beforeText: 「課題のスナップショット」を 1〜2 行で
 *   - afterText: 「依頼後の状態」を 1〜2 行で（数字・成果が入ると尚良し）
 *   - tags は 2〜4 件のキーワード（pill 表示）
 *
 * TODO(運用):
 *   - afterImage を「実際にその案件で納品した画像」に差し替える
 *   - beforeText / afterText を実顧客の声に基づくものへ磨く
 *   - 必要なら 4 件目以降を追加（配列順で表示）
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
    {
        id: 1,
        title: '個人事業主のブランド再構築',
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
