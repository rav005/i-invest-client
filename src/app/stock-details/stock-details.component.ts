import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { News, StockQuote } from '../models/stock';
import { StockService } from '../services/stocks.service';

@Component({
  selector: 'app-stock-details',
  templateUrl: './stock-details.component.html',
  styleUrls: ['./stock-details.component.scss']
})
export class StockDetailsComponent implements OnInit {

  stockQuote: StockQuote | null = null;
  symbol: string | null = null;
  name: string | null = null;
  marketNews: News[] = [];

  loading: boolean = false;
  errorMsg: string = '';

  constructor(private activatedroute: ActivatedRoute, private router: Router, 
    private stockService: StockService) { }

  ngOnInit(): void {
    this.symbol = this.activatedroute.snapshot.paramMap.get('symbol');
    this.name = this.activatedroute.snapshot.paramMap.get('name');

    if (this.symbol) {
      this.loading = true;
      this.stockService.getStock(this.symbol)
      .subscribe(resp => {
        this.stockQuote = resp;
        this.loading = false;
        this.getCompanyNews();
      }, err => {
        this.errorMsg = 'Failed to fetch stock details';
        this.loading = false;
      });
    } else {
      this.router.navigate(['']);
    }
  }

  private getCompanyNews() {
    this.stockService.getCompanyNews(this.symbol!)
      .subscribe(
        (resp: News[]) => {
          this.marketNews =  resp;
        }, err => {
        }
      );
  }

}
