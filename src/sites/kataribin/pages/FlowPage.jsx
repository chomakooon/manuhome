/**
 * @file src/sites/kataribin/pages/FlowPage.jsx
 *
 * /flow 独立ページ。制作の流れの詳細説明。
 */

import { Link } from 'react-router-dom';
import '../styles/page-shared.css';
import './FlowPage.css';

const STEPS = [
    {
        num: 1,
        title: 'お問い合わせ',
        desc: 'お問い合わせフォームから、ご希望のテイスト・用途・納期などをお聞かせください。参考画像や資料があると、初回ヒアリングがスムーズです。',
        customer: ['フォームから相談', '参考画像・資料をご共有'],
        studio: ['1営業日以内に返信', '初期ヒアリング'],
        duration: '即日〜1営業日',
    },
    {
        num: 2,
        title: 'お見積り',
        desc: 'ご要件を整理し、最適なプラン・納期・料金をご提案します。ご質問・ご要望にお答えしながら詳細を詰めていきます。',
        customer: ['要件確認', 'プラン承認'],
        studio: ['詳細ヒアリング', 'お見積もり提示', '制作スケジュール調整'],
        duration: '2〜3営業日',
    },
    {
        num: 3,
        title: '制作',
        desc: 'ラフ案 → ご確認 → 修正 → 仕上げ、の順で進行します。各段階でご確認をお願いし、方向性を合わせながら丁寧に作り込みます。',
        customer: ['ラフ確認', '修正リクエスト', '最終承認'],
        studio: ['ラフ作成', '修正対応', '本制作・仕上げ'],
        duration: 'プランによる（7〜21営業日）',
    },
    {
        num: 4,
        title: '納品',
        desc: 'ご指定の形式で納品します。商用利用OK。納品後の追加修正やアレンジもオプションでお気軽にご相談ください。',
        customer: ['納品データ受領', '最終確認'],
        studio: ['データ納品', '利用範囲のご案内'],
        duration: '即日',
    },
];

const REVISION_POINTS = [
    'ラフ段階での方向修正を優先的に承ります（プランごとに 2〜3 回が目安）。',
    '仕上げ後の大幅な仕様変更は、追加お見積もりでのご対応となります。',
    '部分的なディテール修正（色味・線の太さ・配置調整等）は柔軟に対応します。',
];

const DELIVERY_FORMATS = [
    { label: 'PNG / JPG', desc: 'Web・SNS・印刷物など多用途に。透過 PNG にも対応。' },
    { label: 'PSD', desc: 'レイヤー保持。社内編集・追加加工される場合に。' },
    { label: 'AI', desc: 'ベクター納品。ロゴや名刺など印刷品質を保ちたい場合に。' },
    { label: 'PDF', desc: '印刷会社入稿向け。トンボ・塗り足し付き対応可能。' },
];

const COMMERCIAL_USE_POINTS = [
    '基本的にすべて商用利用 OK です。',
    '広範囲な二次利用（パッケージ展開、テレビ放送等）は事前に利用範囲をご相談ください。',
    'NG 用途（公序良俗に反する用途、第三者への譲渡 等）はお断りする場合があります。',
];

// ── Sections ─────────────────────────────────

function PageHero() {
    return (
        <header className="kt-page-hero">
            <div className="kt-page-hero__inner">
                <h1 className="kt-page-hero__title">制作の流れ</h1>
                <p className="kt-page-hero__lead">
                    お問い合わせから納品まで、4 つのステップで進めます。<br />
                    各段階で密にコミュニケーションを取り、ご納得いただける形でお届けします。
                </p>
            </div>
        </header>
    );
}

function StepCard({ step, alt }) {
    return (
        <article className={`kt-step-card${alt ? ' kt-step-card--alt' : ''}`}>
            <div className="kt-step-card__head">
                <span className="kt-step-card__num">STEP {step.num}</span>
                <h3 className="kt-step-card__title">{step.title}</h3>
            </div>
            <p className="kt-step-card__desc">{step.desc}</p>
            <div className="kt-step-card__cols">
                <div className="kt-step-card__col">
                    <span className="kt-step-card__col-label">お客様</span>
                    <ul className="kt-step-card__list">
                        {step.customer.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                </div>
                <div className="kt-step-card__col">
                    <span className="kt-step-card__col-label">カタチ便</span>
                    <ul className="kt-step-card__list">
                        {step.studio.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
                <div className="kt-step-card__col">
                    <span className="kt-step-card__col-label">所要日数</span>
                    <p className="kt-step-card__duration">{step.duration}</p>
                </div>
            </div>
        </article>
    );
}

function StepsSection() {
    return (
        <section className="kt-section">
            <div className="kt-section__inner">
                <h2 className="kt-section__title">4ステップで進めます</h2>
                <ol className="kt-step-list">
                    {STEPS.map((s, i) => (
                        <li key={s.num}>
                            <StepCard step={s} alt={i % 2 === 1} />
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

function RevisionSection() {
    return (
        <section className="kt-section kt-section--alt">
            <div className="kt-section__inner kt-section__inner--narrow">
                <h2 className="kt-section__title">修正フローについて</h2>
                <p className="kt-section__lead">
                    各プランに含まれる修正回数の範囲内で、丁寧に方向性を合わせていきます。
                </p>
                <ul className="kt-notes">
                    {REVISION_POINTS.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
            </div>
        </section>
    );
}

function DeliverySection() {
    return (
        <section className="kt-section">
            <div className="kt-section__inner">
                <h2 className="kt-section__title">納品形式</h2>
                <p className="kt-section__lead">
                    用途に合わせて柔軟に納品形式を選べます。プランに応じて含まれる形式が異なります。
                </p>
                <div className="kt-formats">
                    {DELIVERY_FORMATS.map((f) => (
                        <div key={f.label} className="kt-format-card">
                            <span className="kt-format-card__label">{f.label}</span>
                            <p className="kt-format-card__desc">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CommercialUseSection() {
    return (
        <section className="kt-section kt-section--alt">
            <div className="kt-section__inner kt-section__inner--narrow">
                <h2 className="kt-section__title">商用利用について</h2>
                <ul className="kt-notes">
                    {COMMERCIAL_USE_POINTS.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
            </div>
        </section>
    );
}

function BigCtaSection() {
    return (
        <section className="kt-bigcta">
            <div className="kt-bigcta__inner">
                <h2 className="kt-bigcta__title">
                    まずはお気軽にご相談ください
                </h2>
                <Link to="/contact" className="kt-btn kt-btn--white kt-btn--lg">
                    相談する →
                </Link>
            </div>
        </section>
    );
}

export default function FlowPage() {
    return (
        <div className="kt-page">
            <PageHero />
            <StepsSection />
            <RevisionSection />
            <DeliverySection />
            <CommercialUseSection />
            <BigCtaSection />
        </div>
    );
}
