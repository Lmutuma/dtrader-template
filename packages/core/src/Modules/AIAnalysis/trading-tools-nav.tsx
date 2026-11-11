import React from 'react';
import ReactDOM from 'react-dom';
import { useHistory, useLocation } from 'react-router-dom';

import { Button } from '@deriv/components';
import {
    StandaloneChartLineUpDownRegularIcon,
    StandaloneChevronLeftRegularIcon,
    StandaloneChartCandlestickRegularIcon,
} from '@deriv/quill-icons';
import { routes } from '@deriv/shared';
import { localize } from '@deriv-com/translations';

const ANCHOR_ID = 'trading-tools-nav-anchor';
const STORAGE_KEY = 'ai_analysis_last_symbol';
const DEFAULT_SYMBOL = 'R_100';

const parse_symbol_from_url = (search: string): string | null => {
    const params = new URLSearchParams(search);
    return params.get('symbol');
};

const TradingToolsNav = () => {
    const history = useHistory();
    const location = useLocation();
    const is_on_ai_page = location.pathname === routes.ai_analysis;
    const is_on_auto_trader_page = location.pathname === routes.auto_trader;

    const [portal_target, setPortalTarget] = React.useState<HTMLElement | null>(null);

    const [current_symbol, setCurrentSymbol] = React.useState<string>(() => {
        const from_window = (window as any).__deriv_current_symbol;
        if (from_window) return from_window;
        const from_url = parse_symbol_from_url(location.search);
        if (from_url) return from_url;
        try {
            return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_SYMBOL;
        } catch {
            return DEFAULT_SYMBOL;
        }
    });

    // Poll window.__deriv_current_symbol for the current symbol
    React.useEffect(() => {
        const sync_symbol = () => {
            const symbol = (window as any).__deriv_current_symbol;
            if (!symbol) return;
            setCurrentSymbol(prev => {
                if (prev === symbol) return prev;
                try {
                    localStorage.setItem(STORAGE_KEY, symbol);
                } catch {
                    // ignore
                }
                return symbol;
            });
        };
        sync_symbol();
        const interval = setInterval(sync_symbol, 250);
        return () => clearInterval(interval);
    }, []);

    // Attach anchor to the trade panel
    React.useEffect(() => {
        if (is_on_ai_page || is_on_auto_trader_page) {
            const existing = document.getElementById(ANCHOR_ID);
            if (existing) existing.remove();
            setPortalTarget(null);
            return;
        }

        const is_on_trade_route = location.pathname === routes.index || location.pathname.startsWith('/contract');
        if (!is_on_trade_route) return;

        let cancelled = false;

        const attach_anchor = () => {
            if (cancelled) return false;
            const existing = document.getElementById(ANCHOR_ID);
            const purchase_wrapper = document.querySelector('.purchase-button__wrapper');
            if (!purchase_wrapper) return false;
            if (existing && existing.previousElementSibling === purchase_wrapper) return true;
            if (existing) existing.remove();

            const anchor = document.createElement('div');
            anchor.id = ANCHOR_ID;
            anchor.className = 'trading-tools-nav-anchor';
            purchase_wrapper.parentElement?.insertBefore(anchor, purchase_wrapper.nextSibling);
            setPortalTarget(anchor);
            return true;
        };

        attach_anchor();

        const observer = new MutationObserver(() => {
            if (!document.getElementById(ANCHOR_ID)) {
                attach_anchor();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            cancelled = true;
            observer.disconnect();
            const existing = document.getElementById(ANCHOR_ID);
            if (existing) existing.remove();
        };
    }, [location.pathname, location.search, is_on_ai_page, is_on_auto_trader_page]);

    const go_to_ai = () => history.push(`${routes.ai_analysis}?symbol=${encodeURIComponent(current_symbol)}`);
    const go_to_auto_trader = () => history.push(routes.auto_trader);
    const go_to_trade = () => history.push(routes.index);

    // Back-to-trade button on AI Analysis page
    if (is_on_ai_page) {
        return (
            <div className='trading-tools-nav-back'>
                <Button
                    className='trading-tools-nav-back__btn'
                    icon={<StandaloneChevronLeftRegularIcon />}
                    onClick={go_to_trade}
                    secondary
                    rounded
                    text={localize('Back to Trade')}
                />
            </div>
        );
    }

    // On the Auto-Trader page, the page has its own Back button, no need to render here
    if (is_on_auto_trader_page) return null;

    const is_on_trade_route = location.pathname === routes.index || location.pathname.startsWith('/contract');
    if (!is_on_trade_route || !portal_target) return null;

    return ReactDOM.createPortal(
        <div className='trading-tools-nav'>
            <Button
                className='trading-tools-nav__btn'
                icon={<StandaloneChartLineUpDownRegularIcon />}
                onClick={go_to_ai}
                primary
                rounded
                text={localize('AI Analysis')}
            />
            <Button
                className='trading-tools-nav__btn'
                icon={<StandaloneChartCandlestickRegularIcon />}
                onClick={go_to_auto_trader}
                primary
                rounded
                text={localize('Auto-Trader')}
            />
        </div>,
        portal_target
    );
};

export default TradingToolsNav;
