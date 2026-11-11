import React from 'react';

import { Text } from '@deriv/components';
import { localize } from '@deriv-com/translations';

import type { TAutoTraderState } from './auto-trader-engine';

type TProps = {
    state: TAutoTraderState;
};

const AutoTraderStatus = ({ state }: TProps) => {
    const format_money = (n: number) => `$${n.toFixed(2)}`;

    return (
        <div className='auto-trader-status'>
            <div className='auto-trader-status__row'>
                <Text as='span' size='xs' className='auto-trader-status__label'>
                    {localize('Status')}
                </Text>
                <Text
                    as='span'
                    size='s'
                    weight='bold'
                    className={`auto-trader-status__value auto-trader-status__value--${state.status}`}
                >
                    {state.status.toUpperCase()}
                </Text>
            </div>

            <div className='auto-trader-status__row'>
                <Text as='span' size='xs' className='auto-trader-status__label'>
                    {localize('Trades executed')}
                </Text>
                <Text as='span' size='s' weight='bold'>
                    {state.trades_executed} / {state.config.max_trades}
                </Text>
            </div>

            <div className='auto-trader-status__row'>
                <Text as='span' size='xs' className='auto-trader-status__label'>
                    {localize('Consecutive losses')}
                </Text>
                <Text as='span' size='s' weight='bold'>
                    {state.consecutive_losses} / {state.config.stop_after_loss}
                </Text>
            </div>

            <div className='auto-trader-status__row'>
                <Text as='span' size='xs' className='auto-trader-status__label'>
                    {localize('Session P&L')}
                </Text>
                <Text
                    as='span'
                    size='s'
                    weight='bold'
                    className={state.session_pnl >= 0 ? 'auto-trader-status__profit' : 'auto-trader-status__loss'}
                >
                    {format_money(state.session_pnl)}
                </Text>
            </div>

            <div className='auto-trader-status__row'>
                <Text as='span' size='xs' className='auto-trader-status__label'>
                    {localize('Daily loss')}
                </Text>
                <Text
                    as='span'
                    size='s'
                    weight='bold'
                    className={state.daily_loss >= state.config.daily_loss_limit ? 'auto-trader-status__loss' : ''}
                >
                    {format_money(state.daily_loss)} / {format_money(state.config.daily_loss_limit)}
                </Text>
            </div>

            {state.last_trade_result && (
                <div className='auto-trader-status__row'>
                    <Text as='span' size='xs' className='auto-trader-status__label'>
                        {localize('Last trade')}
                    </Text>
                    <Text
                        as='span'
                        size='s'
                        weight='bold'
                        className={
                            state.last_trade_result === 'win'
                                ? 'auto-trader-status__profit'
                                : 'auto-trader-status__loss'
                        }
                    >
                        {state.last_trade_result.toUpperCase()}
                    </Text>
                </div>
            )}
        </div>
    );
};

export default AutoTraderStatus;
