import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class StockService {

    constructor(private http: HttpClient) { 
    }

    public getStock(symbol: String) {

    }

}