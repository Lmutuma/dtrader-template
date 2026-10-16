import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import classNames from 'classnames';

import { Button } from '@deriv/components';
import { StandaloneChartLineUpDownRegularIcon } from '@deriv/quill-icons';
import { routes } from '@deriv/shared';
import { localize } from '@deriv-com/translations';

import './ai-floating-button.scss';

const AIFloatingButton = () => {
    const history = useHistory();
    const location = useLocation();
    const is_on_ai_page = location.pathname === routes.ai_analysis;

    const handleClick = () => {
        if (is_on_ai_page) {
            history.push(routes.index);
        } else {
            history.push(routes.ai_analysis);
        }
    };

    return (
        <div className='ai-floating-button'>
            <Button
                className='ai-floating-button__btn'
                classNameSpan='ai-floating-button__label'
                icon={<StandaloneChartLineUpDownRegularIcon />}
                onClick={handleClick}
                primary
                rounded
                text={is_on_ai_page ? localize('Back to Trade') : localize('AI Analysis')}
            />
        </div>
    );
};

export default AIFloatingButton;
