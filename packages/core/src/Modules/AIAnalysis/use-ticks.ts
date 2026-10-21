import React from 'react';
import BinarySocket from '_common/base/socket_base';

const MAX_TICKS = 50;

type TTickData = {
    epoch: number;
    quote: number;
};

type TState = {
    prices: number[];
    tick_count: number;
    error: string | null;
    loading: boolean;
};

/**
 * Subscribe to ticks for a symbol and maintain a rolling buffer.
 * Also fetches the historical ticks on mount so the buffer is populated immediately.
 */
export const useTicks = (symbol: string): TState => {
    const [state, setState] = React.useState<TState>({
        prices: [],
        tick_count: 0,
        error: null,
        loading: true,
    });

    const subscription_ref = React.useRef<{ unsubscribe: () => void } | null>(null);

    React.useEffect(() => {
        let cancelled = false;

        // Reset state on symbol change
        setState({ prices: [], tick_count: 0, error: null, loading: true });

        const append_tick = (tick: TTickData) => {
            if (cancelled) return;
            setState(prev => {
                const next_prices = [...prev.prices, tick.quote];
                if (next_prices.length > MAX_TICKS) {
                    next_prices.splice(0, next_prices.length - MAX_TICKS);
                }
                return {
                    prices: next_prices,
                    tick_count: prev.tick_count + 1,
                    error: null,
                    loading: false,
                };
            });
        };

        // 1. Fetch historical ticks to prefill the buffer
        BinarySocket.getTicksHistory({
            ticks_history: symbol,
            adjust_start_time: 1,
            count: MAX_TICKS,
            end: 'latest',
            start: 1,
            style: 'ticks',
        })
            .then(response => {
                if (cancelled) return;
                const { history } = response;
                if (!history || !history.prices) return;

                setState({
                    prices: history.prices.slice(-MAX_TICKS),
                    tick_count: history.prices.length,
                    error: null,
                    loading: false,
                });
            })
            .catch(err => {
                if (cancelled) return;
                setState(prev => ({
                    ...prev,
                    error: err?.error?.message || 'Failed to load ticks history',
                    loading: false,
                }));
            });

        // 2. Subscribe to live ticks
        try {
            const subscriber = BinarySocket.subscribeTicks(symbol, response => {
                if (cancelled) return;
                if (response.error) {
                    setState(prev => ({
                        ...prev,
                        error: response.error.message || 'Tick subscription error',
                        loading: false,
                    }));
                    return;
                }
                if (response.tick) {
                    append_tick(response.tick);
                }
            });
            subscription_ref.current = subscriber;
        } catch (err: any) {
            if (cancelled) return;
            setState(prev => ({
                ...prev,
                error: err?.message || 'Failed to subscribe to ticks',
                loading: false,
            }));
        }

        return () => {
            cancelled = true;
            if (subscription_ref.current) {
                try {
                    subscription_ref.current.unsubscribe();
                } catch {
                    // ignore — socket may already be closed
                }
                subscription_ref.current = null;
            }
        };
    }, [symbol]);

    return state;
};
