import { Link } from 'react-router-dom';
import Icon from '../common/Icon';
import './StickyCTA.css';

export default function StickyCTA() {
    return (
        <div className="sticky-cta">
            <div className="sticky-cta__inner container">
                <Link to="/intake" className="sticky-cta__button btn btn-primary btn-lg">
                    <Icon name="Mail" color="white" size={20} style={{marginRight: '8px'}} />
                    無料相談・お見積り
                </Link>
            </div>
        </div>
    );
}
