export interface StockQuote {
    o: number;
    h: number;
    l: number;
    c: number;
    pc: number;
}

export interface Stock {
    name: string;
    symbol: string;
    data: StockQuote;
}

export interface SearchStock {
    currency: string;
    description: string;
    displaySymbol: string;
    symbol: string;
}

export interface News {
    category: string;
    datetime: Date | number;
    headline: string;
    id: number;
    image: string;
    related: string;
    source: string;
    summary: string;
    url: string;
}

export interface Metric {
    YearHigh: number;
    YearHighDate: Date;
    YearLow: number;
    YearLowDate: Date;
    cashFlowPerShareAnnual: number;
    currentRatioAnnual: number;
    dividendPerShareAnnual: number;
    dividendPerShare5Y: number;
    dividendYield5Y: number;
    grossMarginAnnual: number;
    marketCapitalization: number;
    revenuePerShareAnnual: number;
    roiAnnual: number;
}

export interface Trend {
    buy: number;
    hold: number;
    period: Date;
    sell: number;
    strongBuy: number;
    strongSell: number;
}
