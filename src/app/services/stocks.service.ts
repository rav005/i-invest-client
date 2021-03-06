import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Metric, News, SearchStock, Stock, StockQuote } from "../models/stock";

@Injectable({
    providedIn: 'root'
})
export class StockService {
    private data: SearchStock[] = [];
    private watchList: Stock[] = [];
    
    constructor(private http: HttpClient) {
        let ld = localStorage.getItem('stocksData');
        if (ld) {
            this.data = JSON.parse(ld);
        }

        let watchlist = sessionStorage.getItem('watchlist');
        if (watchlist) {
            try {
                this.watchList = JSON.parse(watchlist);
            } catch (err) { }
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
        let regex = new RegExp(searchText, 'i');

        let tickerResults: SearchStock[] = [];
        let descResults: SearchStock[] = [];
        
        for(let x of this.data) {
            if (x.symbol.match(regex)) {
                tickerResults.push(x);
            } else if (x.description.match(regex)) {
                descResults.push(x);
            }

            if ((tickerResults.length + descResults.length) > 15) {
                break;
            }
        }

        return tickerResults.concat(descResults);
    }

    private reloadWatchList(): Observable<Stock[]> {
        return new Observable(o => {
        this.http.get('/stock/getWatchlist')
            .subscribe((resp: any) => {
            if (resp?.watchList) {
                this.watchList = resp.watchList;
                sessionStorage.setItem('watchlist', JSON.stringify(resp.watchList));

                o.next(this.watchList);
                o.complete();
            }
            }, err => {
                o.next(this.watchList);
                o.complete();
            });
        });
    }

    public getWatchList(reload: boolean): Observable<Stock[]> {
        if (this.watchList.length == 0 || reload) {
            return this.reloadWatchList();
        } else {
            return new Observable(o => {
                o.next(this.watchList);
                o.complete();
            });
        }
    }

    public getStock(symbol: String): Observable<StockQuote> {
        let req = { symbol: symbol };

        return this.http.post<StockQuote>('/stock/quote', req);
    }

    public getCompanyNews(symbol: String): Observable<News[]> {
        const s = symbol.split('.')[0];
        let req = { symbol: s };

        return this.http.post<News[]>('/stock/companyNews', req)
            .pipe(
                map((resp: News[]) => {
                    if (resp?.length > 0) {
                        resp.forEach(x => {
                            let time = x.datetime;
                            x.datetime = new Date(0).setSeconds(time as number);
                        })
                    }
                    return resp;
                })
            );
    }

    public getMarketNews(): Observable<News[]> {
        return this.http.get<News[]>('/main/marketNews')
            .pipe(
                map((resp: News[]) => {
                    if (resp?.length > 0) {
                        resp.forEach(x => {
                            let time = x.datetime;
                            x.datetime = new Date(0).setSeconds(time as number);
                        })
                    }
                    return resp;
                })
            );
    }

    public getBasicFinancials(symbol: String): Observable<Metric> {
        let req = { symbol: symbol };
        return this.http.post<Metric>('/stock/basicFinancials', req)
            .pipe(
                map((resp: any) => {
                    if (resp) {
                        let metric: Metric = <Metric>resp;
                        metric.YearHigh = resp["52WeekHigh"];
                        metric.YearHighDate = resp["52WeekHighDate"];
                        metric.YearLow = resp["52WeekLow"];
                        metric.YearLowDate = resp["52WeekLowDate"];

                        return metric;
                    }

                    throw new Error('Basic finanicals not available');
                })
            );
    }

    public getRecommendations(symbol: string): Observable<any> {
        let req = { symbol: symbol };
        return this.http.post('/stock/recommendationTrends', req);
    }

    public getHistoricalData(symbol: string): Observable<any> {
        const s = symbol.split('.')[0];
        let req = { symbol: s };
        return this.http.post('/stock/historical', req);
    }

    public toggleWatchlist(symbol: string, name: string, currency: string, add: boolean): Observable<boolean> {
        let req = { symbol: symbol, stockName: name, currency: currency };
        let url = '';
        if (add) {
            url = '/stock/addToWatchlist';
        } else {
            url = '/stock/removeFromWatchlist';
        }

        return this.http.post<boolean>(url, req)
            .pipe(map(resp => {
                if (add) {
                    this.reloadWatchList().toPromise();
                } else {
                    this.watchList = this.watchList.filter(w => w.symbol != symbol);
                    sessionStorage.setItem('watchlist', JSON.stringify(this.watchList));
                }
                return true;
            }));
    }

    public getCurrenyRates(): Observable<any>  {
        return this.http.get<any>('/main/forex');
    }

    public placeOrder(name: string, symbol: string, currency: string, quantity: number, price: number, 
        type: string, accountId: string): Observable<boolean> {
        let complete = true;
        if (type === 'Limit buy') {
            complete = false;
        }
        const req = {
            name: name,
            symbol: symbol,
            currency: currency,
            quantity: quantity,
            price: price,
            accountId: accountId,
            type: type,
            completed: complete
        }

        return this.http.post<any>('/stock/buyStock', req);
    }

    public cancelOrder(accId: string, transactionId: string) {
        return this.http.post<boolean>('/stock/cancelOrder', { accountId: accId, stockId: transactionId })
        .pipe(
            map((resp: any) => {
                return resp.success;
            })
        );
    }

    public sellStock(accountId: string, stockId: string, quantity: number, price: number, type: string) {
        let complete = true;
        if (type === 'Limit sell') {
            complete = false;
        }
        const req = {
            accountId: accountId,
            stockId: stockId,
            quantity: quantity,
            price: price,
            type: type,
            completed: complete
        };
        return this.http.post('/stock/sellStock', req)
        .pipe(
            map((resp: any) => {
                return resp.success;
            })
        );
    }

}