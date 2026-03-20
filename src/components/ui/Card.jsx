import { Link } from 'react-router-dom';
import './Card.css';

export default function Card({
    icon,
    title,
    description,
    to,
    href,
    color,
    variant = 'default',
    className = '',
    children,
    onClick,
}) {
    const style = color ? { '--card-accent': color } : {};

    const content = (
        <>
            {icon && <div className="card__icon">{icon}</div>}
            <div className="card__body">
                {title && <h3 className="card__title">{title}</h3>}
                {description && <p className="card__description">{description}</p>}
                {children}
            </div>
            {(to || href) && (
                <div className="card__arrow">→</div>
            )}
        </>
    );

    const classes = `card card--${variant} ${className}`.trim();

    if (to) {
        return (
            <Link to={to} className={classes} style={style}>
                {content}
            </Link>
        );
    }

    if (href) {
        return (
            <a href={href} className={classes} style={style} target="_blank" rel="noopener noreferrer">
                {content}
            </a>
        );
    }

    return (
        <div className={classes} style={style} onClick={onClick}>
            {content}
        </div>
    );
}
