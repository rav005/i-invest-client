import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { News, SearchStock, StockQuote } from "../models/stock";

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
        let regex = new RegExp(searchText, 'i');

        tickers = this.data.filter(x => x.symbol.match(regex));
        description = this.data.filter(x => x.description.match(regex));
        
        return tickers.concat(description);
    }

    public getStock(symbol: String): Observable<StockQuote> {
        let req = { symbol: symbol };

        return this.http.post<StockQuote>('/stock/quote', req);
    }

    public getCompanyNews(symbol: String): Observable<News[]> {
        let req = { symbol: symbol };

        return this.http.post<News[]>('/stock/companyNews', req);
    }

    public getMarketNews(): Observable<News[]> {
        return this.http.get<News[]>('/main/marketNews')
        .pipe(
            map((resp: News[]) => {
                if (resp?.length > 0) {
                    resp.forEach(x => {
                        let time = x.datetime;
                        x.datetime =  new Date(0).setSeconds(time as number);
                    })
                }
                return resp;
            })
        )
    }

}