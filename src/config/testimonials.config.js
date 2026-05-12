/**
 * @file src/config/testimonials.config.js
 *
 * HomePage「お客様の声」セクションに表示する顧客の声の単一ソース。
 *
 * 編集ルール:
 *   - name はイニシャル＋様 推奨（個人情報保護のため）
 *   - role は属性のみ（個人事業主 / 飲食店オーナー / ペットオーナー など）
 *   - body は 2〜4 行程度。改行は CSS で折り返すため \n は不要
 *   - 並び順は配列順
 *
 * TODO(運用): 岡崎さんが実際にいただいた声に差し替えてください。現状はプレースホルダ。
 */

/**
 * @typedef {Object} Testimonial
 * @property {string} id
 * @property {string} name
 * @property {string} role
 * @property {string} body
 */

/** @type {Testimonial[]} */
export const TESTIMONIALS = [
    {
        id: 't1',
        name: 'A.K 様',
        role: '個人事業主',
        body: 'ヒアリングが丁寧で、こちらの曖昧なイメージをきちんと形にしてくださいました。名刺の印象が変わって、商談の入り口がスムーズになりました。',
    },
    {
        id: 't2',
        name: 'M.S 様',
        role: '飲食店オーナー',
        body: 'お店の雰囲気に合わせた手描き感のあるイラストで、SNS投稿の反応が明らかに変わりました。修正対応も柔軟で安心してお任せできました。',
    },
    {
        id: 't3',
        name: 'Y.T 様',
        role: 'ペットオーナー',
        body: '愛犬の特徴をしっかり掴んでいただき、家族みんなが笑顔になる仕上がりでした。グッズにもしていただけて、毎日眺めるのが楽しみです。',
    },
];
