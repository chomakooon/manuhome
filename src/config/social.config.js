/**
 * @file src/config/social.config.js
 *
 * 外部 SNS / ソーシャルリンクの単一ソース。
 * URL を更新する際はこのファイルだけを編集すれば全画面に反映される。
 *
 * 編集ルール:
 *   - URL のみのプレーンオブジェクト（JSX / 関数は持たない）
 *   - サービス識別子（key）はサイト内で一意に
 *   - 表示ラベルは利用側コンポーネントで管理する（key だけでは表示不可）
 *
 * TODO(運用): ユーザーが実 URL に差し替えてください。現状はプレースホルダ。
 */

/** @type {Record<string, string>} */
export const SNS_LINKS = {
    x: 'https://twitter.com/',
    instagram: 'https://instagram.com/',
    threads: 'https://threads.net/',
};
