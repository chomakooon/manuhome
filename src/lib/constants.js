/* ========================================
   カタチ便 — System Constants
   ======================================== */

export const PROJECT_STATUS = {
    NEW: 'NEW',
    WAITING_ASSETS: 'WAITING_ASSETS',
    IN_PRODUCTION: 'IN_PRODUCTION',
    REVIEW: 'REVIEW',
    DELIVERED: 'DELIVERED',
    CLOSED: 'CLOSED',
};

export const PROJECT_STATUS_LABELS = {
    NEW: '新規受付',
    WAITING_ASSETS: '素材待ち',
    IN_PRODUCTION: '制作中',
    REVIEW: '確認中',
    DELIVERED: '納品済み',
    CLOSED: '完了',
};

export const PROJECT_STATUS_ORDER = [
    'NEW',
    'WAITING_ASSETS',
    'IN_PRODUCTION',
    'REVIEW',
    'DELIVERED',
    'CLOSED',
];

export const ILLUSTRATION_STYLES = [
    {
        id: 'realistic',
        name: 'リアル風',
        description: '写真に近い繊細なタッチで描きます',
        color: '#4A5568',
    },
    {
        id: 'cute',
        name: 'かわいい系',
        description: 'デフォルメの効いたポップなスタイル',
        color: '#E53E7A',
    },
    {
        id: 'watercolor',
        name: '水彩風',
        description: '柔らかく温かみのある水彩タッチ',
        color: '#3182CE',
    },
    {
        id: 'simple',
        name: 'シンプル',
        description: 'ミニマルな線画ベースのイラスト',
        color: '#2D3748',
    },
];

export const PET_PRODUCTS = [
    {
        id: 'pet-illustration-1',
        name: 'ペットイラスト（1匹）',
        description: '大切なペットを1匹、お好みのスタイルで描きます',
        basePrice: 15000,
        petCount: 1,
    },
    {
        id: 'pet-illustration-2',
        name: 'ペットイラスト（2匹）',
        description: '2匹のペットを一緒に描きます',
        basePrice: 25000,
        petCount: 2,
    },
    {
        id: 'pet-illustration-3',
        name: 'ペットイラスト（3匹以上）',
        description: '3匹以上のペットをまとめてお描きします',
        basePrice: 35000,
        petCount: 3,
    },
];

export const ORDER_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
};

export const FILE_TYPES = {
    ASSET: 'asset',
    DELIVERY: 'delivery',
};

export const USER_ROLES = {
    CUSTOMER: 'customer',
    CREATOR: 'creator',
};

export const formatPrice = (price) => {
    return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
    }).format(price);
};

import template from './templates/pet-illustration.json';

export const getFormValueLabel = (key, value) => {
    for (const step of template.formSteps) {
        if (step.fields) {
            const field = step.fields.find(f => f.id === key);
            if (field && field.options) {
                const opt = field.options.find(o => (typeof o === 'string' ? o === value : o.value === value));
                if (opt && opt.label) return opt.label;
            }
        }
    }
    return String(value);
};

export const getFormKeyLabel = (key) => {
    for (const step of template.formSteps) {
        if (step.fields) {
            const field = step.fields.find(f => f.id === key);
            if (field && field.label) return field.label;
        }
    }
    return key;
};
