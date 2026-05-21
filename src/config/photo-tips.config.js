/**
 * @file src/config/photo-tips.config.js
 *
 * 「お写真の選び方」ページ（/pet/guide/photo-tips）のコンテンツ定義。
 * PawsPressGuidePage が guideContent 経由で参照する。
 *
 * iconName は lucide-react のアイコン名（PawsPressGuidePage の ICON_MAP に対応）。
 *
 * ★ ENGINEER CONNECTION POINT ★
 *   good/avoid の例示画像（/photo-tips/*.webp）は Mana が後から配置する。
 *   未配置の間は PictureWebpWithFallback がプレースホルダを表示する。
 */

export const goodPoints = [
    {
        iconName: 'Sun',
        title: '明るい場所で撮影',
        description:
            '自然光の入る窓辺がおすすめ。室内照明だけだと色が変わって見えることがあります。',
    },
    {
        iconName: 'Focus',
        title: 'ピントを合わせる',
        description:
            '目元・口元がはっきり写っていることが重要です。顔のディテールがイラストの仕上がりを左右します。',
    },
    {
        iconName: 'Maximize',
        title: '全身が写るアングル',
        description:
            'プランによっては全身を描きます。フレームから体がはみ出していない写真が理想です。',
    },
];

export const goodExamples = [
    {
        src: '/photo-tips/good-1.webp',
        caption: '明るく自然光で撮影',
        subCaption: '色味が正確に伝わります',
    },
    {
        src: '/photo-tips/good-2.webp',
        caption: 'ピントが顔に合っている',
        subCaption: '表情のディテールを再現できます',
    },
    {
        src: '/photo-tips/good-3.webp',
        caption: '全身がフレーム内',
        subCaption: '体型・姿勢を正確に描けます',
    },
];

export const avoidExamples = [
    {
        src: '/photo-tips/avoid-1.webp',
        caption: '暗すぎる・逆光',
        subCaption: '色や表情が判別しづらくなります',
    },
    {
        src: '/photo-tips/avoid-2.webp',
        caption: 'ピントがボケている',
        subCaption: '細部のディテールが描けません',
    },
    {
        src: '/photo-tips/avoid-3.webp',
        caption: '顔が見えない・小さすぎる',
        subCaption: '表情を正確に再現できません',
    },
];

export const photoSpecs = [
    { label: '推奨サイズ', value: '縦横どちらも 1000px 以上' },
    { label: '対応フォーマット', value: 'JPG / PNG / HEIC' },
    { label: 'ファイル上限', value: '1ファイルあたり 10MB まで' },
    { label: '枚数', value: '1〜5枚（複数あると特徴を捉えやすくなります）' },
];
