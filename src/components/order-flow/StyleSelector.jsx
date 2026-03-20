import { ILLUSTRATION_STYLES } from '../../lib/constants';
import { Palette } from 'lucide-react';
import './StyleSelector.css';

export default function StyleSelector({ selected, onSelect }) {
    return (
        <div className="style-selector">
            <div className="style-selector__grid">
                {ILLUSTRATION_STYLES.map((style) => (
                    <button
                        key={style.id}
                        type="button"
                        className={`style-selector__card ${selected === style.id ? 'style-selector__card--selected' : ''}`}
                        onClick={() => onSelect(style.id)}
                        style={{ '--style-color': style.color }}
                    >
                        <div className="style-selector__swatch">
                            <Palette size={28} strokeWidth={1.5} />
                        </div>
                        <h4 className="style-selector__name">{style.name}</h4>
                        <p className="style-selector__desc">{style.description}</p>
                        {selected === style.id && (
                            <span className="style-selector__check">✓</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
