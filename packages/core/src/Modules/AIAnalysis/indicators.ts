export type TSignal = 'BUY' | 'SELL' | 'NEUTRAL';
export type TRisk = 'LOW' | 'MEDIUM' | 'HIGH';

export type TAnalysis = {
    signal: TSignal;
    confidence: number;
    risk: TRisk;
    trend: string;
    momentum: string;
    volatility: string;
};

const FAST_PERIOD = 5;
const SLOW_PERIOD = 20;

/**
 * Simple Moving Average of the last `period` ticks.
 */
const sma = (prices: number[], period: number): number => {
    if (prices.length < period) return 0;
    const slice = prices.slice(-period);
    return slice.reduce((sum, p) => sum + p, 0) / period;
};

/**
 * Standard deviation of returns (as a % of mean).
 * Returns 0 if insufficient data.
 */
const stddev_pct = (prices: number[]): number => {
    if (prices.length < 2) return 0;
    const mean = prices.reduce((s, p) => s + p, 0) / prices.length;
    if (mean === 0) return 0;
    const variance = prices.reduce((s, p) => s + (p - mean) ** 2, 0) / prices.length;
    return (Math.sqrt(variance) / mean) * 100;
};

/**
 * Derive a BUY/SELL/NEUTRAL signal from the fast and slow SMAs.
 * - Fast > Slow + threshold => BUY
 * - Fast < Slow - threshold => SELL
 * - Otherwise => NEUTRAL
 */
const derive_signal = (fast: number, slow: number, threshold_pct: number): TSignal => {
    if (fast === 0 || slow === 0) return 'NEUTRAL';
    const diff_pct = ((fast - slow) / slow) * 100;
    if (diff_pct > threshold_pct) return 'BUY';
    if (diff_pct < -threshold_pct) return 'SELL';
    return 'NEUTRAL';
};

/**
 * Confidence is a 0-100 value derived from the gap between fast/slow SMAs
 * and the volatility. Larger gap + lower volatility => higher confidence.
 */
const derive_confidence = (fast: number, slow: number, volatility: number): number => {
    if (fast === 0 || slow === 0) return 0;
    const gap_pct = Math.abs(((fast - slow) / slow) * 100);
    // 1% gap => 60 base; scaled up to 95 max, dampened by volatility
    const base = Math.min(95, 40 + gap_pct * 30);
    const dampening = Math.min(1, 3 / Math.max(volatility, 0.5));
    return Math.round(Math.max(0, Math.min(100, base * dampening)));
};

/**
 * Risk is derived from volatility (as % stddev).
 * - < 0.05% => LOW
 * - 0.05% - 0.15% => MEDIUM
 * - > 0.15% => HIGH
 */
const derive_risk = (volatility: number): TRisk => {
    if (volatility < 0.05) return 'LOW';
    if (volatility < 0.15) return 'MEDIUM';
    return 'HIGH';
};

/**
 * Trend text based on fast vs slow SMAs.
 */
const derive_trend = (fast: number, slow: number): string => {
    if (fast === 0 || slow === 0) return 'Neutral';
    const diff_pct = ((fast - slow) / slow) * 100;
    if (diff_pct > 0.1) return 'Bullish';
    if (diff_pct < -0.1) return 'Bearish';
    return 'Sideways';
};

/**
 * Momentum text based on recent slope vs the slow SMA.
 */
const derive_momentum = (fast: number, slow: number, volatility: number): string => {
    if (fast === 0 || slow === 0) return 'Neutral';
    const diff_pct = ((fast - slow) / slow) * 100;
    if (diff_pct > 0.2) return 'Strong';
    if (diff_pct > 0.05) return 'Positive';
    if (diff_pct < -0.2) return 'Weak';
    if (diff_pct < -0.05) return 'Negative';
    return 'Flat';
};

/**
 * Volatility text based on the % stddev.
 */
const derive_volatility = (volatility: number): string => {
    if (volatility < 0.05) return 'Low';
    if (volatility < 0.15) return 'Moderate';
    return 'High';
};

/**
 * Analyze a stream of tick prices and return the derived signal analysis.
 * Returns null if insufficient data.
 */
export const analyze = (prices: number[]): TAnalysis | null => {
    if (prices.length < SLOW_PERIOD) return null;

    const fast = sma(prices, FAST_PERIOD);
    const slow = sma(prices, SLOW_PERIOD);
    const volatility = stddev_pct(prices.slice(-SLOW_PERIOD));

    const threshold_pct = Math.max(0.02, volatility * 0.3);
    const signal = derive_signal(fast, slow, threshold_pct);
    const confidence = derive_confidence(fast, slow, volatility);

    return {
        signal,
        confidence,
        risk: derive_risk(volatility),
        trend: derive_trend(fast, slow),
        momentum: derive_momentum(fast, slow, volatility),
        volatility: derive_volatility(volatility),
    };
};
