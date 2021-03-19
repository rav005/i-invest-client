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
