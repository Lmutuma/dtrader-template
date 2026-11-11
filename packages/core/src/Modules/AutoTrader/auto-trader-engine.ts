import React from 'react';

import type { TAutoTraderConfig } from './auto-trader-settings';

export type TAutoTraderStatus = 'idle' | 'running' | 'stopped';
export type TTradeResult = 'win' | 'loss' | null;

export type TAutoTraderState = {
    status: TAutoTraderStatus;
    config: TAutoTraderConfig;
    set_config: (patch: Partial<TAutoTraderConfig>) => void;
    trades_executed: number;
    consecutive_losses: number;
    session_pnl: number;
    daily_loss: number;
    last_trade_result: TTradeResult;
    stop_reason: string | null;
};

const DEFAULT_CONFIG: TAutoTraderConfig = {
    stake: 10,
    max_trades: 10,
    stop_after_loss: 3,
    daily_loss_limit: 50,
    contract_type: 'CALL',
    duration: 5,
};

// Placeholder engine — will call real buy() once OAuth is unblocked.
// Right now, it simulates trades with a random result to prove the loop works.

const placeholder_trade = async (): Promise<'win' | 'loss'> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return Math.random() < 0.5 ? 'win' : 'loss';
};

export const useAutoTraderEngine = () => {
    const [config, set_config_state] = React.useState<TAutoTraderConfig>(DEFAULT_CONFIG);
    const [status, set_status] = React.useState<TAutoTraderStatus>('idle');
    const [trades_executed, set_trades_executed] = React.useState(0);
    const [consecutive_losses, set_consecutive_losses] = React.useState(0);
    const [session_pnl, set_session_pnl] = React.useState(0);
    const [daily_loss, set_daily_loss] = React.useState(0);
    const [last_trade_result, set_last_trade_result] = React.useState<TTradeResult>(null);
    const [stop_reason, set_stop_reason] = React.useState<string | null>(null);

    const running_ref = React.useRef(false);

    const set_config = (patch: Partial<TAutoTraderConfig>) => {
        set_config_state(prev => ({ ...prev, ...patch }));
    };

    const reset_counters = () => {
        set_trades_executed(0);
        set_consecutive_losses(0);
        set_session_pnl(0);
        set_daily_loss(0);
        set_last_trade_result(null);
        set_stop_reason(null);
    };

    const stop_with_reason = (reason: string) => {
        running_ref.current = false;
        set_status('stopped');
        set_stop_reason(reason);
    };

    const start = async () => {
        if (status === 'running') return;
        reset_counters();
        set_status('running');
        running_ref.current = true;

        let trades = 0;
        let losses = 0;
        let pnl = 0;
        let daily = 0;

        while (running_ref.current) {
            // Check stop conditions before next trade
            if (trades >= config.max_trades) {
                stop_with_reason(`Max trades reached (${config.max_trades})`);
                return;
            }
            if (losses >= config.stop_after_loss) {
                stop_with_reason(`Stop after ${config.stop_after_loss} consecutive losses`);
                return;
            }
            if (daily >= config.daily_loss_limit) {
                stop_with_reason(`Daily loss limit reached ($${config.daily_loss_limit})`);
                return;
            }

            // Simulate trade (replace with real BinarySocket buy() when auth is ready)
            // Sequential trades are intentional: one must complete before the next starts
            // eslint-disable-next-line no-await-in-loop
            const result = await placeholder_trade();
            if (!running_ref.current) return; // user stopped mid-trade

            trades += 1;
            set_trades_executed(trades);
            set_last_trade_result(result);

            if (result === 'win') {
                pnl += config.stake * 0.9; // ~90% payout on Deriv
                set_session_pnl(pnl);
                losses = 0;
                set_consecutive_losses(0);
            } else {
                pnl -= config.stake;
                daily += config.stake;
                losses += 1;
                set_session_pnl(pnl);
                set_daily_loss(daily);
                set_consecutive_losses(losses);
            }
        }
    };

    const stop = () => {
        stop_with_reason('Stopped by user');
    };

    const state: TAutoTraderState = {
        status,
        config,
        set_config,
        trades_executed,
        consecutive_losses,
        session_pnl,
        daily_loss,
        last_trade_result,
        stop_reason,
    };

    return { state, start, stop };
};
