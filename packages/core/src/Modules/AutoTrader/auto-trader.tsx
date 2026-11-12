import React from 'react';
import { useHistory } from 'react-router-dom';

import { Button, Text } from '@deriv/components';
import { StandaloneChevronLeftRegularIcon } from '@deriv/quill-icons';
import { routes } from '@deriv/shared';
import { localize } from '@deriv-com/translations';

import AutoTraderSettings from './auto-trader-settings';
import AutoTraderStatus from './auto-trader-status';
import { useAutoTraderEngine } from './auto-trader-engine';

const AutoTrader = () => {
    const history = useHistory();
    const { state, start, stop } = useAutoTraderEngine();

    const is_running = state.status === 'running';

    return (
        <div className='auto-trader'>
            <div className='auto-trader__back'>
                <Button
                    icon={<StandaloneChevronLeftRegularIcon />}
                    onClick={() => history.push(routes.index)}
                    secondary
                    small
                    text={localize('Back to Trade')}
                />
            </div>

            <div className='auto-trader__header'>
                <div className='auto-trader__title-row'>
                    <Text as='h1' weight='bold' size='m'>
                        {localize('Auto-Trader')}
                    </Text>
                    <button
                        className='auto-trader__cross-link'
                        onClick={() => history.push(routes.ai_analysis)}
                        type='button'
                    >
                        {localize('← AI Analysis')}
                    </button>
                </div>
                <Text as='p' size='xs' className='auto-trader__subtitle'>
                    {localize(
                        'Configure and run automated trades. All limits are enforced — trading stops automatically when any limit is reached.'
                    )}
                </Text>
            </div>

            <div className='auto-trader__grid'>
                <div className='auto-trader__card'>
                    <Text as='h2' weight='bold' size='s' className='auto-trader__card-title'>
                        {localize('Configuration')}
                    </Text>
                    <AutoTraderSettings disabled={is_running} on_change={state.set_config} config={state.config} />
                </div>

                <div className='auto-trader__card'>
                    <Text as='h2' weight='bold' size='s' className='auto-trader__card-title'>
                        {localize('Status')}
                    </Text>
                    <AutoTraderStatus state={state} />
                </div>
            </div>

            <div className='auto-trader__actions'>
                {is_running ? (
                    <Button onClick={stop} primary large wide text={localize('STOP AUTO-TRADING')} />
                ) : (
                    <Button onClick={start} primary large wide text={localize('START AUTO-TRADING')} />
                )}
                {state.status === 'stopped' && state.stop_reason && (
                    <Text as='p' size='xs' className='auto-trader__stop-reason'>
                        {localize('Stopped:')} {state.stop_reason}
                    </Text>
                )}
            </div>
        </div>
    );
};

export default AutoTrader;
