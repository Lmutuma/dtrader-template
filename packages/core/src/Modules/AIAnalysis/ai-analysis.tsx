import React from 'react';
import { observer } from 'mobx-react-lite';

import { Text } from '@deriv/components';
import { localize } from '@deriv-com/translations';

import './ai-analysis.scss';

type TSignal = 'BUY' | 'SELL' | 'NEUTRAL';
type TRisk = 'LOW' | 'MEDIUM' | 'HIGH';

type TAnalysis = {
    signal: TSignal;
    confidence: number;
    risk: TRisk;
    trend: string;
    momentum: string;
    volatility: string;
};

const MOCK_ANALYSIS: TAnalysis = {
    signal: 'BUY',
    confidence: 74,
    risk: 'MEDIUM',
    trend: 'Bullish',
    momentum: 'Positive',
    volatility: 'Moderate',
};

const AIAnalysis = observer(() => {
    const analysis = MOCK_ANALYSIS;

    const signalClass = `ai-analysis__signal ai-analysis__signal--${analysis.signal.toLowerCase()}`;
    const riskClass = `ai-analysis__risk ai-analysis__risk--${analysis.risk.toLowerCase()}`;

    return (
        <div className='ai-analysis'>
            <div className='ai-analysis__header'>
                <Text as='h1' weight='bold' size='m' className='ai-analysis__title'>
                    {localize('AI Analysis')}
                </Text>
                <Text as='p' size='xs' className='ai-analysis__subtitle'>
                    {localize('Indicator-based market signals. Not financial advice.')}
                </Text>
            </div>

            <div className='ai-analysis__grid'>
                <div className='ai-analysis__card ai-analysis__card--primary'>
                    <Text as='p' size='xs' className='ai-analysis__label'>
                        {localize('SIGNAL')}
                    </Text>
                    <div className={signalClass}>{analysis.signal}</div>
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
                    <div className={riskClass}>{analysis.risk}</div>
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
