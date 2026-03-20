import { PROJECT_STATUS_ORDER, PROJECT_STATUS_LABELS } from '../../lib/constants';
import { Check } from 'lucide-react';
import './StatusTimeline.css';

export default function StatusTimeline({ currentStatus }) {
    const currentIndex = PROJECT_STATUS_ORDER.indexOf(currentStatus);

    return (
        <div className="status-timeline">
            {PROJECT_STATUS_ORDER.map((status, i) => {
                const isDone = i < currentIndex;
                const isCurrent = i === currentIndex;
                return (
                    <div
                        key={status}
                        className={`status-timeline__item ${isDone ? 'status-timeline__item--done' : ''} ${isCurrent ? 'status-timeline__item--current' : ''}`}
                    >
                        <div className="status-timeline__dot">
                            {isDone ? <Check size={12} /> : <span>{i + 1}</span>}
                        </div>
                        {i < PROJECT_STATUS_ORDER.length - 1 && (
                            <div className={`status-timeline__connector ${isDone ? 'status-timeline__connector--done' : ''}`} />
                        )}
                        <span className="status-timeline__label">
                            {PROJECT_STATUS_LABELS[status]}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
