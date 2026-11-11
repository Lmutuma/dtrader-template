import React from 'react';

import { Input, Text } from '@deriv/components';
import { localize } from '@deriv-com/translations';

export type TAutoTraderConfig = {
    stake: number;
    max_trades: number;
    stop_after_loss: number;
    daily_loss_limit: number;
    contract_type: string;
    duration: number;
};

type TProps = {
    config: TAutoTraderConfig;
    disabled: boolean;
    on_change: (patch: Partial<TAutoTraderConfig>) => void;
};

const AutoTraderSettings = ({ config, disabled, on_change }: TProps) => {
    const handle_numeric = (key: keyof TAutoTraderConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (!isNaN(value) && value >= 0) {
            on_change({ [key]: value } as Partial<TAutoTraderConfig>);
        }
    };

    return (
        <div className='auto-trader-settings'>
            <div className='auto-trader-settings__field'>
                <Text as='label' size='xs' className='auto-trader-settings__label'>
                    {localize('Stake (USD)')}
                </Text>
                <Input
                    type='number'
                    value={String(config.stake)}
                    onChange={handle_numeric('stake')}
                    disabled={disabled}
                    min='0.35'
                    step='0.01'
                />
            </div>

            <div className='auto-trader-settings__field'>
                <Text as='label' size='xs' className='auto-trader-settings__label'>
                    {localize('Maximum Trades')}
                </Text>
                <Input
                    type='number'
                    value={String(config.max_trades)}
                    onChange={handle_numeric('max_trades')}
                    disabled={disabled}
                    min='1'
                    step='1'
                />
            </div>

            <div className='auto-trader-settings__field'>
                <Text as='label' size='xs' className='auto-trader-settings__label'>
                    {localize('Stop After Consecutive Losses')}
                </Text>
                <Input
                    type='number'
                    value={String(config.stop_after_loss)}
                    onChange={handle_numeric('stop_after_loss')}
                    disabled={disabled}
                    min='1'
                    step='1'
                />
            </div>

            <div className='auto-trader-settings__field'>
                <Text as='label' size='xs' className='auto-trader-settings__label'>
                    {localize('Daily Loss Limit (USD)')}
                </Text>
                <Input
                    type='number'
                    value={String(config.daily_loss_limit)}
                    onChange={handle_numeric('daily_loss_limit')}
                    disabled={disabled}
                    min='0'
                    step='1'
                />
            </div>

            <div className='auto-trader-settings__field'>
                <Text as='label' size='xs' className='auto-trader-settings__label'>
                    {localize('Contract Type')}
                </Text>
                <select
                    className='auto-trader-settings__select'
                    value={config.contract_type}
                    onChange={e => on_change({ contract_type: e.target.value })}
                    disabled={disabled}
                >
                    <option value='CALL'>{localize('Rise')}</option>
                    <option value='PUT'>{localize('Fall')}</option>
                    <option value='DIGITOVER'>{localize('Over')}</option>
                    <option value='DIGITUNDER'>{localize('Under')}</option>
                    <option value='DIGITEVEN'>{localize('Even')}</option>
                    <option value='DIGITODD'>{localize('Odd')}</option>
                </select>
            </div>

            <div className='auto-trader-settings__field'>
                <Text as='label' size='xs' className='auto-trader-settings__label'>
                    {localize('Duration (ticks)')}
                </Text>
                <Input
                    type='number'
                    value={String(config.duration)}
                    onChange={handle_numeric('duration')}
                    disabled={disabled}
                    min='1'
                    step='1'
                />
            </div>
        </div>
    );
};

export default AutoTraderSettings;
