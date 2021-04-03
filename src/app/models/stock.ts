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
