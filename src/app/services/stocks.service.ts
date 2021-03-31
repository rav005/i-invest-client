import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SearchStock } from "../models/stock";

@Injectable({
    providedIn: 'root'
})
export class StockService {
    private data: SearchStock[] = [];

    constructor(private http: HttpClient) {
        let ld = localStorage.getItem('stocksData');
        if (ld) {
            this.data = JSON.parse(ld);
        }
    }

    public init() {
        if (this.data.length == 0) {
            this.http.get('/main/getStocksfile')
            .subscribe(resp => {
                this.data = <any[]>resp;
                localStorage.setItem('stocksData', JSON.stringify(resp));
            }, err => {
                console.log('failed to load file: ', err);
            });
        }
    }

    public search(searchText: string) {
        let tickers: SearchStock[] = [];
        let description: SearchStock[] = [];
        let re = new RegExp(searchText, 'i');
        console.log('reg: ', re);
        tickers = this.data.filter(x => x.symbol.match(re));
        description = this.data.filter(x => x.description.match(re));
        console.log('tickers: ', tickers, 'desc: ', description);
        return tickers.concat(description);
    }

    public getStock(symbol: String) {

    }

}