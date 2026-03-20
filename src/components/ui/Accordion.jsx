import { useState } from 'react';
import './Accordion.css';

export default function Accordion({ items }) {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (i) => {
        setOpenIndex(openIndex === i ? null : i);
    };

    return (
        <div className="accordion">
            {items.map((item, i) => (
                <div className={`accordion__item ${openIndex === i ? 'accordion__item--open' : ''}`} key={i}>
                    <button className="accordion__trigger" onClick={() => toggle(i)}>
                        <span className="accordion__question">{item.question}</span>
                        <span className="accordion__icon">{openIndex === i ? '−' : '+'}</span>
                    </button>
                    <div className="accordion__content">
                        <div className="accordion__answer">{item.answer}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
