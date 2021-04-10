import { PurchaseStock } from "./stock";

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

export interface Portfolio {
    account: Account;
    stocks: PurchaseStock[];
}

export interface Transaction {
    _id: string,
    transactionDate: Date,
    name: string,
    stockSymbol: string,
    quantity: number,
    type: string,
    amount: number,
    accountId: string
}
