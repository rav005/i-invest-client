import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import axios from "axios";
import { map } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class StockService {
    private keys: string[] = [];

    constructor(private http: HttpClient) { 
        let res = sessionStorage.getItem('keys');
        console.log('keys: ', res);
        if (res) {
            this.keys = JSON.parse(res);
        }
    }

    private formApiUrl(restOfApiUrl: string) {
        let key = this.keys[0];
        return 'https://finnhub.io/api/v1' + restOfApiUrl + "&token=" + key;
    }

    async getStock(symbol: String) {
        const url = this.formApiUrl("/quote?symbol=" + symbol.toUpperCase());
        console.log('url: ', url);
        // return this.http.get(url).pipe(
        //     map(resp => {
        //         console.log(`GET ${symbol}, response`, resp);
        //     })
        // );

        try {
            let resp = await axios.get(url);
            return resp.data;
        } catch(err) {
            console.log(`GET ${symbol}, response`, err);
            return null;
        }
    }

}