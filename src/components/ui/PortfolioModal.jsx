import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import PictureWebp from '../PictureWebp';
import './PortfolioModal.css';

export default function PortfolioModal({ item, isOpen, onClose, onNext, onPrev, hasNext, hasPrev }) {

    const handleKeyDown = useCallback((e) => {
        if (!isOpen) return;

        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight' && hasNext) onNext();
        if (e.key === 'ArrowLeft' && hasPrev) onPrev();
    }, [isOpen, onClose, onNext, onPrev, hasNext, hasPrev]);

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    if (!isOpen || !item) return null;

    // Phase 21: 背景クリックで閉じる動作は専用の <button> に分離。
    // dialog 要素自体に onClick を持たせると jsx-a11y/no-noninteractive-element-interactions に違反するため、
    // 背景は背面に置いた <button>、コンテンツは前面に配置する z-index 戦略で対応する。

    return (
        <div className="portfolio-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <button
                type="button"
                className="portfolio-modal-backdrop-btn"
                onClick={onClose}
                aria-label="モーダルを閉じる"
            />
            <div className="portfolio-modal-content">
                <button
                    className="portfolio-modal-close"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <X size={24} strokeWidth={2} />
                </button>

                <div className="portfolio-modal-image-container">
                    <PictureWebp
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        onError={(e) => console.warn(`[portfolio] image failed to load (id=${item.id}): ${e.currentTarget.src}`)}
                    />

                    {hasPrev && (
                        <button
                            className="portfolio-modal-nav-btn prev"
                            onClick={onPrev}
                            aria-label="Previous image"
                        >
                            <ChevronLeft size={28} strokeWidth={2} />
                        </button>
                    )}

                    {hasNext && (
                        <button
                            className="portfolio-modal-nav-btn next"
                            onClick={onNext}
                            aria-label="Next image"
                        >
                            <ChevronRight size={28} strokeWidth={2} />
                        </button>
                    )}
                </div>

                <div className="portfolio-modal-body">
                    <div className="portfolio-modal-header">
                        <span className="portfolio-modal-badge">{item.categoryName}</span>
                    </div>
                    <h2 id="modal-title" className="portfolio-modal-title">{item.title}</h2>
                    <p className="portfolio-modal-desc">{item.description}</p>
                </div>
            </div>
        </div>
    );
}
