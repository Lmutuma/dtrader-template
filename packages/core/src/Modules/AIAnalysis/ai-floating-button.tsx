import React from 'react';
import ReactDOM from 'react-dom';
import { useHistory, useLocation } from 'react-router-dom';

import { Button } from '@deriv/components';
import { StandaloneChartLineUpDownRegularIcon, StandaloneChevronLeftRegularIcon } from '@deriv/quill-icons';
import { routes } from '@deriv/shared';
import { localize } from '@deriv-com/translations';

const ANCHOR_ID = 'ai-analysis-button-anchor';

const AIFloatingButton = () => {
    const history = useHistory();
    const location = useLocation();
    const is_on_ai_page = location.pathname === routes.ai_analysis;

    const [portal_target, setPortalTarget] = React.useState<HTMLElement | null>(null);

    // Find the purchase button wrapper and attach our anchor next to it.
    // Re-runs whenever the route changes (to handle back navigation).
    React.useEffect(() => {
        if (is_on_ai_page) {
            // On the AI page, no need to hunt for the trade panel
            const existing = document.getElementById(ANCHOR_ID);
            if (existing) existing.remove();
            setPortalTarget(null);
            return;
        }

        let cancelled = false;

        const try_attach = () => {
            if (cancelled) return true;

            const purchase_wrapper = document.querySelector('.purchase-button__wrapper');
            if (!purchase_wrapper) return false;

            // Remove stale anchor from a previous mount
            const existing = document.getElementById(ANCHOR_ID);
            if (existing) existing.remove();

            const anchor = document.createElement('div');
            anchor.id = ANCHOR_ID;
            anchor.className = 'ai-analysis-button-anchor';
            purchase_wrapper.parentElement?.insertBefore(anchor, purchase_wrapper.nextSibling);

            setPortalTarget(anchor);
            return true;
        };

        // Try immediately
        if (try_attach()) {
            return () => {
                cancelled = true;
                const existing = document.getElementById(ANCHOR_ID);
                if (existing) existing.remove();
            };
        }

        // Fallback: observe the DOM until the trade panel appears
        const observer = new MutationObserver(() => {
            if (try_attach()) observer.disconnect();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            cancelled = true;
            observer.disconnect();
            const existing = document.getElementById(ANCHOR_ID);
            if (existing) existing.remove();
        };
    }, [location.pathname, is_on_ai_page]);

    const go_to_ai = () => history.push(routes.ai_analysis);
    const go_to_trade = () => history.push(routes.index);

    // On the AI analysis page: render a Back to Trade button at bottom-left
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

    // On trade routes: render inside the trade panel via portal
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
