import React from 'react';
import ReactDOM from 'react-dom';
import { useHistory, useLocation } from 'react-router-dom';

import { Button } from '@deriv/components';
import { StandaloneChartLineUpDownRegularIcon, StandaloneChevronLeftRegularIcon } from '@deriv/quill-icons';
import { routes } from '@deriv/shared';
import { localize } from '@deriv-com/translations';

const ANCHOR_ID = 'ai-analysis-button-anchor';
const STORAGE_KEY = 'ai_analysis_last_symbol';
const DEFAULT_SYMBOL = 'R_100';

const parse_symbol_from_url = (search: string): string | null => {
    const params = new URLSearchParams(search);
    return params.get('symbol');
};

const AIFloatingButton = () => {
    const history = useHistory();
    const location = useLocation();
    const is_on_ai_page = location.pathname === routes.ai_analysis;

    const [portal_target, setPortalTarget] = React.useState<HTMLElement | null>(null);

    const [current_symbol, setCurrentSymbol] = React.useState<string>(() => {
        // Priority: window store > URL param > localStorage > default
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

    // Poll window.__deriv_current_symbol — updated by the trader package's
    // MobX reaction whenever the user changes the active symbol.
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

        // Initial sync
        sync_symbol();

        // Poll — cheap (a single property read) and reliable
        const interval = setInterval(sync_symbol, 250);

        return () => clearInterval(interval);
    }, []);

    // Main effect: attach anchor to the trade panel; re-attach whenever it disappears.
    React.useEffect(() => {
        if (is_on_ai_page) {
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

            // Already attached?
            const existing = document.getElementById(ANCHOR_ID);
            const purchase_wrapper = document.querySelector('.purchase-button__wrapper');

            if (!purchase_wrapper) return false;

            // If anchor exists and is still a sibling of the wrapper — leave it alone.
            if (existing && existing.previousElementSibling === purchase_wrapper) {
                return true;
            }

            // Otherwise (re)create it.
            if (existing) existing.remove();

            const anchor = document.createElement('div');
            anchor.id = ANCHOR_ID;
            anchor.className = 'ai-analysis-button-anchor';
            purchase_wrapper.parentElement?.insertBefore(anchor, purchase_wrapper.nextSibling);
            setPortalTarget(anchor);
            return true;
        };

        // Initial attach attempt
        attach_anchor();

        // Watch for the anchor being removed (e.g., symbol change re-renders the panel)
        const observer = new MutationObserver(() => {
            // Debounce: only re-attach if our anchor is no longer in the DOM
            if (!document.getElementById(ANCHOR_ID)) {
                attach_anchor();
            }
        });

        // Observe the whole body for subtree changes — the trade panel may be
        // replaced at any depth when the symbol or contract type changes.
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            cancelled = true;
            observer.disconnect();
            const existing = document.getElementById(ANCHOR_ID);
            if (existing) existing.remove();
        };
    }, [location.pathname, location.search, is_on_ai_page]);

    const go_to_ai = () => history.push(`${routes.ai_analysis}?symbol=${encodeURIComponent(current_symbol)}`);
    const go_to_trade = () => history.push(routes.index);

    if (is_on_ai_page) {
        return (
            <div className='ai-analysis-back-button'>
                <Button
                    className='ai-analysis-back-button__btn'
                    classNameSpan='ai-analysis-back-button__label'
                    icon={<StandaloneChevronLeftRegularIcon />}
                    onClick={go_to_trade}
                    secondary
                    rounded
                    text={localize('Back to Trade')}
                />
            </div>
        );
    }

    const is_on_trade_route = location.pathname === routes.index || location.pathname.startsWith('/contract');
    if (!is_on_trade_route || !portal_target) return null;

    return ReactDOM.createPortal(
        <div className='ai-analysis-button-inline'>
            <Button
                className='ai-analysis-button-inline__btn'
                classNameSpan='ai-analysis-button-inline__label'
                icon={<StandaloneChartLineUpDownRegularIcon />}
                onClick={go_to_ai}
                primary
                rounded
                text={localize('AI Analysis')}
            />
        </div>,
        portal_target
    );
};

export default AIFloatingButton;
