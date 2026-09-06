import { HttpError } from './http.ts';

export const SUBMISSION_BUCKET = 'submission-files';
export type Upload = { name: string; type: string; bytes: Uint8Array };
export type StoredUpload = { path: string; name: string; type: string; size: number };
const MB = 1024 * 1024;

function detectImageType(bytes: Uint8Array): string | null {
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
    if ([137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b)) return 'image/png';
    const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
    if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
    if (ascii(4, 8) === 'ftyp') {
        const brands = ascii(8, Math.min(bytes.length, 40));
        if (/heic|heix|hevc|hevx/.test(brands)) return 'image/heic';
        if (/mif1|msf1/.test(brands)) return 'image/heif';
    }
    return null;
}

export function validateUploads(value: unknown, {
    maxFiles = 3, maxFileBytes = 10 * MB, maxTotalBytes = 20 * MB, required = false,
}: { maxFiles?: number; maxFileBytes?: number; maxTotalBytes?: number; required?: boolean } = {}): Upload[] {
    if (value == null && !required) return [];
    if (!Array.isArray(value) || value.length > maxFiles || (required && !value.length)) {
        throw new HttpError(400, `画像は${required ? '1〜' : ''}${maxFiles}枚までお送りください。`);
    }
    let total = 0;
    return value.map(file => {
        if (!file || typeof file.name !== 'string' || !file.name.trim() || file.name.length > 200 ||
            (file.type != null && typeof file.type !== 'string') ||
            typeof file.dataUrl !== 'string' || file.dataUrl.length > Math.ceil(maxFileBytes / 3) * 4 + 100) {
            throw new HttpError(400, '画像の名前・形式・サイズを確認してください。');
        }
        const match = /^data:([^;,]*);base64,([A-Za-z0-9+/]*={0,2})$/.exec(file.dataUrl);
        if (!match || match[2].length % 4 !== 0) throw new HttpError(400, '画像データの形式を確認してください。');
        let bytes: Uint8Array;
        try { bytes = Uint8Array.from(atob(match[2]), c => c.charCodeAt(0)); }
        catch { throw new HttpError(400, '画像データを読み込めません。'); }
        total += bytes.length;
        if (!bytes.length || bytes.length > maxFileBytes || total > maxTotalBytes) {
            throw new HttpError(413, '画像の合計サイズが大きすぎます。');
        }
        const type = detectImageType(bytes);
        const declared = (file.type || match[1] || '').toLowerCase().replace('image/jpg', 'image/jpeg');
        if (!type || (declared && declared !== 'application/octet-stream' && declared !== type &&
            !(['image/heic', 'image/heif'].includes(type) && ['image/heic', 'image/heif'].includes(declared)))) {
            throw new HttpError(400, 'JPG・PNG・WEBP・HEIC形式の画像をお送りください。');
        }
        if (file.size != null && file.size !== bytes.length) throw new HttpError(400, '画像サイズが一致しません。');
        return { name: file.name.replace(/[\u0000-\u001f\u007f/\\]/g, '_'), type, bytes };
    });
}

export async function cleanupUploads(supabase: any, files: StoredUpload[]): Promise<void> {
    if (!files.length) return;
    const { error } = await supabase.storage.from(SUBMISSION_BUCKET).remove(files.map(f => f.path));
    if (error) console.error('Submission attachment cleanup failed');
}

export async function saveUploads(supabase: any, folder: string, uploads: Upload[]): Promise<StoredUpload[]> {
    if (!/^(order|contact)\/[0-9a-f-]{36}(\/(photos|references))?$/.test(folder)) throw new Error('Invalid storage folder');
    const files: StoredUpload[] = [];
    try {
        for (const upload of uploads) {
            const suffix = upload.type.split('/')[1];
            const path = `${folder}/${crypto.randomUUID()}.${suffix}`;
            const { error } = await supabase.storage.from(SUBMISSION_BUCKET).upload(path, upload.bytes, {
                contentType: upload.type, upsert: false, cacheControl: '0',
            });
            if (error) throw new HttpError(503, '画像の保存に失敗しました。再度お試しください。');
            files.push({ path, name: upload.name, type: upload.type, size: upload.bytes.length });
        }
        return files;
    } catch (error) {
        await cleanupUploads(supabase, files);
        throw error;
    }
}
