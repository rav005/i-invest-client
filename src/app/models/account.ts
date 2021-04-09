
export interface Account {
    _id: string;
    name: string;
    balance: number;
    currency: string;
}

export interface Exchange {
    USD_CAD: number;
    CAD_USD: number;
}