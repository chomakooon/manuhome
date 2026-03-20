import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import StickyCTA from './StickyCTA';
import AiAssistant from '../ui/AiAssistant';
import './Layout.css';

export default function Layout({ children, hideStickyCTA = false }) {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="layout">
            <Header />
            <main className="layout__main page-enter">
                {children}
            </main>
            <Footer />
            {!hideStickyCTA && <StickyCTA />}
            <AiAssistant />
        </div>
    );
}
