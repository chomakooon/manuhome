/**
 * @file src/config/_schema.js
 *
 * このファイルは config/ 配下の各設定ファイルが満たすべき形を JSDoc typedef で
 * 一元的に定義する場所です。実データは持たず、型定義（コメント）のみを持ちます。
 *
 * 目的:
 *   - 各 config ファイルの編集者にスキーマを明示する
 *   - 将来 zod 等を導入したくなった際の移行先テーブルとなる
 *   - エディタの補完を効かせる
 *
 * TODO(step2-後半): 各 config ファイルの実データ投入時にスキーマを確定させる
 */

// ─────────────────────────────────────────────
// Site (site.config.js)
// ─────────────────────────────────────────────
/**
 * @typedef {Object} NavItem
 * @property {string} path - ルーティングパス（例: '/works'）
 * @property {string} label - ヘッダーに表示するラベル
 * @property {boolean} [external] - true の場合 <a href> で扱う
 */

/**
 * @typedef {Object} SiteConfig
 * @property {string} siteKey - マルチテナント識別キー（例: 'manuhome'）
 * @property {string} siteName - サイト名
 * @property {string} tagline - サブコピー
 * @property {NavItem[]} nav - グローバルナビ項目
 * @property {{ label: string, to: string }} headerCta - ヘッダー右の CTA ボタン
 * @property {{ twitter?: string, instagram?: string, youtube?: string, other?: { label: string, url: string }[] }} social
 * @property {string} footerCopyright
 */

// ─────────────────────────────────────────────
// Pricing (pricing.config.js)
// ─────────────────────────────────────────────
/**
 * @typedef {Object} PricingPlan
 * @property {string} id - 一意な識別子（例: 'icon-basic'）
 * @property {string} category - 大分類（works/categories.js の id と一致させる想定）
 * @property {string} name - プラン名
 * @property {number} price - 金額（数値）
 * @property {'JPY'|'USD'} currency
 * @property {number} [deliveryDays] - 標準納期（日）
 * @property {string[]} features - 含まれる項目
 * @property {{ label: string, to: string }} cta - プラン CTA
 * @property {boolean} [popular] - 「人気」バッジ表示
 * @property {string} [note] - 補足説明
 */

// ─────────────────────────────────────────────
// Flow (flow.config.js)
// ─────────────────────────────────────────────
/**
 * @typedef {Object} FlowStep
 * @property {number} order - 表示順（1 始まり）
 * @property {string} title - ステップタイトル
 * @property {string} description - 説明文
 * @property {string} [duration] - 期間目安（例: '1〜2 営業日'）
 * @property {string} [icon] - lucide-react のアイコン名
 */

// ─────────────────────────────────────────────
// Contact (contact.config.js)
// ─────────────────────────────────────────────
/**
 * @typedef {Object} ContactField
 * @property {string} name - フォーム送信時のキー
 * @property {string} label - 表示ラベル
 * @property {'text'|'email'|'tel'|'textarea'|'select'} type
 * @property {boolean} [required]
 * @property {string} [placeholder]
 * @property {string[]} [options] - select 時の選択肢
 */

/**
 * @typedef {Object} ContactConfig
 * @property {string} endpoint - 送信先 URL（VITE_CONTACT_ENDPOINT で上書き可）
 * @property {string} subjectTemplate - メール件名テンプレ（{name} 等のプレースホルダ可）
 * @property {ContactField[]} fields - 表示するフィールド定義
 * @property {{ to: string, label: string }} [intakeLink] - 「詳しく相談」導線
 */

// ─────────────────────────────────────────────
// Works (works/categories.js, works/items/*.json)
// ─────────────────────────────────────────────
/**
 * @typedef {Object} WorksCategory
 * @property {string} id - カテゴリ識別子（例: 'pet', 'illustration', 'shop'）
 * @property {string} label - 表示名（例: 'ペットイラスト'）
 * @property {string} [description] - カテゴリ説明
 * @property {string[]} [subCategories] - 含まれる subCategory id の配列
 * @property {number} [sortOrder] - 表示順（昇順）
 * @property {boolean} [isShop] - true の場合、自社販売商品カテゴリとして扱う
 * @property {string} [slug] - URL 用スラッグ（未指定なら id をそのまま使用）
 */

/**
 * @typedef {Object} WorksItem
 * @property {string} id - 一意な識別子（例: 'pet-photo-01'）
 * @property {string} title
 * @property {string} category - WorksCategory.id を参照
 * @property {string} subCategory
 * @property {boolean} isMain - サブカテゴリの代表作かどうか
 * @property {string} image - 公開パス（例: '/works/pet-photo-01.jpg' or '/works/placeholder.svg'）
 * @property {string} [originalImageFilename] - 差し替え予定ファイル名
 * @property {string} [description]
 * @property {string[]} [tags]
 * @property {string} [publishedAt] - ISO 日付
 *
 * @property {'portfolio'|'product'} itemType - 受注実績か自社販売商品か
 * @property {string|null} externalUrl - 外部購入リンク（LINE STORE, SUZURI 等）
 * @property {string|null} externalLabel - リンクボタン文言（例: 'LINEスタンプを買う'）
 * @property {number|null} reactionCount - SNS 反応数（漫画用、後で記入）
 * @property {string|null} clientName - クライアント名（許諾済み案件のみ）
 * @property {string} tenantId - マルチテナント識別子（manuhome 等）
 */

export {};
