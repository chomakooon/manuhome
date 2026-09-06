import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function PrivateAttachments({ files = [] }) {
    const [error, setError] = useState('');
    const [opening, setOpening] = useState(null);
    const attachments = Array.isArray(files) ? files.filter(file => typeof file?.path === 'string') : [];
    const openFile = async (file) => {
        setError('');
        setOpening(file.path);
        try {
            const { data, error: linkError } = await supabase.storage.from('submission-files').createSignedUrl(file.path, 60);
            if (linkError || !data?.signedUrl) throw new Error('Attachment unavailable');
            window.location.assign(data.signedUrl);
        } catch {
            setError('画像を開けませんでした。アクセス権限と通信状況をご確認ください。');
        } finally { setOpening(null); }
    };
    if (!attachments.length) return null;
    return (
        <div>
            <ul>
                {attachments.map(file => (
                    <li key={file.path}>
                        <button type="button" onClick={() => openFile(file)} disabled={opening !== null}>
                            {opening === file.path ? '読み込み中…' : file.name || '添付画像を開く'}
                        </button>
                    </li>
                ))}
            </ul>
            {error && <p role="alert">{error}</p>}
        </div>
    );
}
