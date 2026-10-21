import React from 'react';
import { observer } from 'mobx-react-lite';

import { Text } from '@deriv/components';
import { localize } from '@deriv-com/translations';

import { analyze, TAnalysis } from './indicators';
import { useTicks } from './use-ticks';

// Default symbol. In a future iteration, this can be read from the current trade symbol.
const DEFAULT_SYMBOL = 'R_100'; // Volatility 100 Index

const AIAnalysis = observer(() => {
    const { prices, tick_count, error, loading } = useTicks(DEFAULT_SYMBOL);
    const analysis: TAnalysis | null = analyze(prices);

    if (loading && tick_count === 0) {
        return (
            <div className='ai-analysis'>
                <div className='ai-analysis__header'>
                    <Text as='h1' weight='bold' size='m'>
                        {localize('AI Analysis')}
                    </Text>
                    <Text as='p' size='xs' className='ai-analysis__subtitle'>
                        {localize('Loading live market data...')}
                    </Text>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='ai-analysis'>
                <div className='ai-analysis__header'>
                    <Text as='h1' weight='bold' size='m'>
                        {localize('AI Analysis')}
                    </Text>
                    <Text as='p' size='xs' style={{ color: 'var(--color-status-danger)' }}>
                        {error}
                    </Text>
                </div>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className='ai-analysis'>
                <div className='ai-analysis__header'>
                    <Text as='h1' weight='bold' size='m'>
                        {localize('AI Analysis')}
                    </Text>
                    <Text as='p' size='xs' className='ai-analysis__subtitle'>
                        {localize(`Collecting data... ${tick_count} / 20 ticks`)}
                    </Text>
                </div>
            </div>
        );
    }

    const signal_class = `ai-analysis__signal ai-analysis__signal--${analysis.signal.toLowerCase()}`;
    const risk_class = `ai-analysis__risk ai-analysis__risk--${analysis.risk.toLowerCase()}`;

    return (
        <div className='ai-analysis'>
            <div className='ai-analysis__header'>
                <Text as='h1' weight='bold' size='m' className='ai-analysis__title'>
                    {localize('AI Analysis')} — {DEFAULT_SYMBOL}
                </Text>
                <Text as='p' size='xs' className='ai-analysis__subtitle'>
                    {localize('Live indicator-based market signals. Not financial advice.')}{' '}
                    <span className='ai-analysis__tick_count'>({tick_count} ticks)</span>
                </Text>
            </div>

            <div className='ai-analysis__grid'>
                <div className='ai-analysis__card ai-analysis__card--primary'>
                    <Text as='p' size='xs' className='ai-analysis__label'>
                        {localize('SIGNAL')}
                    </Text>
                    <div className={signal_class}>{analysis.signal}</div>
                </div>

                <div className='ai-analysis__card'>
                    <Text as='p' size='xs' className='ai-analysis__label'>
                        {localize('CONFIDENCE')}
                    </Text>
                    <div className='ai-analysis__value'>{analysis.confidence}%</div>
                    <div className='ai-analysis__bar'>
                        <div className='ai-analysis__bar-fill' style={{ width: `${analysis.confidence}%` }} />
                    </div>
                </div>

                <div className='ai-analysis__card'>
                    <Text as='p' size='xs' className='ai-analysis__label'>
                        {localize('RISK')}
                    </Text>
                    <div className={risk_class}>{analysis.risk}</div>
                </div>
            </div>

            <div className='ai-analysis__metrics'>
                <div className='ai-analysis__metric'>
                    <Text as='p' size='xs' className='ai-analysis__label'>
                        {localize('Trend')}
                    </Text>
                    <Text as='p' size='s' weight='bold'>
                        {analysis.trend}
                    </Text>
                </div>
                <div className='ai-analysis__metric'>
                    <Text as='p' size='xs' className='ai-analysis__label'>
                        {localize('Momentum')}
                    </Text>
                    <Text as='p' size='s' weight='bold'>
                        {analysis.momentum}
                    </Text>
                </div>
                <div className='ai-analysis__metric'>
                    <Text as='p' size='xs' className='ai-analysis__label'>
                        {localize('Volatility')}
                    </Text>
                    <Text as='p' size='s' weight='bold'>
                        {analysis.volatility}
                    </Text>
                </div>
            </div>

            <div className='ai-analysis__disclaimer'>
                <Text as='p' size='xxs'>
                    {localize(
                        'Signals are generated from simple technical indicators (moving averages and volatility). They are for informational purposes only.'
                    )}
                </Text>
            </div>
        </div>
    );
});

export default AIAnalysis;
