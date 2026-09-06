import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCheckoutStatus } from '../../../lib/stripe';
import PageSeo from '../../../components/PageSeo';

export default function CheckoutReturn({ sessionId }) {
    const [result, setResult] = useState({ state: 'checking', message: '' });
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        let cancelled = false;
        let timer;
        let attempts = 0;
        const check = async () => {
            try {
                const status = await getCheckoutStatus(sessionId);
                if (cancelled) return;
                if (status.paymentStatus === 'paid' && status.orderStatus === 'confirmed') {
                    setResult({ state: 'confirmed', message: 'お支払いとご注文の受付が完了しました。内容を拝見のうえ、3営業日以内にご連絡いたします。' });
                } else if (status.paymentStatus === 'refunded') {
                    setResult({ state: 'refunded', message: 'このご注文は返金済みです。ご不明な点はお問い合わせください。' });
                } else {
                    setResult({ state: 'pending', message: status.paymentStatus === 'paid'
                        ? 'お支払いを確認しました。ご注文の受付を確認しています。再度のお支払いは不要です。'
                        : 'お支払いの完了をまだ確認できません。しばらくしてから確認してください。' });
                    if (++attempts < 5) timer = setTimeout(check, 2000);
                }
            } catch {
                if (!cancelled) setResult({ state: 'error', message: 'お支払い状況を確認できませんでした。再度のお支払いを行う前に、時間をおいて再確認するか、お問い合わせください。' });
            }
        };
        check();
        return () => { cancelled = true; clearTimeout(timer); };
    }, [sessionId, retry]);

    return (
        <div className="paws-completed">
            <PageSeo pageKey="petOrder" />
            <div className="paws-completed__inner" aria-live="polite">
                <h1 className="paws-completed__title">
                    {result.state === 'confirmed' ? 'ご注文ありがとうございました' : 'お支払い状況の確認'}
                </h1>
                <p className="paws-completed__text" role={result.state === 'error' ? 'alert' : 'status'}>
                    {result.state === 'checking' ? 'お支払い状況を確認しています…' : result.message}
                </p>
                <div className="paws-completed__nav">
                    {!['confirmed', 'refunded'].includes(result.state) && <button className="paws-form-btn paws-form-btn--primary" type="button" onClick={() => {
                        setResult({ state: 'checking', message: '' });
                        setRetry(value => value + 1);
                    }}>再確認する</button>}
                    <Link to="/pet/contact" className="paws-form-btn paws-form-btn--secondary">お問い合わせ</Link>
                    <Link to="/pet" className="paws-form-btn paws-form-btn--secondary">TOPに戻る</Link>
                </div>
            </div>
        </div>
    );
}
