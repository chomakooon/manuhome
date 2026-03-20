import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import './FileUpload.css';

export default function FileUpload({ files, onChange, maxFiles = 5, accept = 'image/*' }) {
    const [dragOver, setDragOver] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        addFiles(dropped);
    };

    const handleFileSelect = (e) => {
        const selected = Array.from(e.target.files);
        addFiles(selected);
        e.target.value = '';
    };

    const addFiles = (newFiles) => {
        const remaining = maxFiles - files.length;
        const toAdd = newFiles.slice(0, remaining).map(file => ({
            file,
            preview: URL.createObjectURL(file),
            id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        }));
        onChange([...files, ...toAdd]);
    };

    const removeFile = (id) => {
        const updated = files.filter(f => f.id !== id);
        const removed = files.find(f => f.id === id);
        if (removed?.preview) URL.revokeObjectURL(removed.preview);
        onChange(updated);
    };

    return (
        <div className="file-upload">
            <div
                className={`file-upload__zone ${dragOver ? 'file-upload__zone--drag' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                <Upload size={32} strokeWidth={1.5} className="file-upload__icon" />
                <p className="file-upload__text">
                    写真をドラッグ＆ドロップ
                </p>
                <p className="file-upload__subtext">
                    または
                </p>
                <label className="btn btn-outline file-upload__btn">
                    ファイルを選択
                    <input
                        type="file"
                        accept={accept}
                        multiple
                        onChange={handleFileSelect}
                        hidden
                    />
                </label>
                <p className="file-upload__hint">
                    最大{maxFiles}枚まで（JPG, PNG, HEIC）
                </p>
            </div>

            {files.length > 0 && (
                <div className="file-upload__previews">
                    {files.map((f) => (
                        <div className="file-upload__preview" key={f.id}>
                            <img src={f.preview} alt={f.file.name} />
                            <button
                                className="file-upload__remove"
                                onClick={() => removeFile(f.id)}
                                type="button"
                            >
                                <X size={14} />
                            </button>
                            <span className="file-upload__name">{f.file.name}</span>
                        </div>
                    ))}
                    {files.length < maxFiles && (
                        <label className="file-upload__add-more">
                            <ImageIcon size={20} strokeWidth={1.5} />
                            <span>追加</span>
                            <input
                                type="file"
                                accept={accept}
                                multiple
                                onChange={handleFileSelect}
                                hidden
                            />
                        </label>
                    )}
                </div>
            )}
        </div>
    );
}
