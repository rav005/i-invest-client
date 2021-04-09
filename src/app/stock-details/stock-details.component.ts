import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, Exchange } from '../models/account';
import { Metric, News, StockQuote, Trend } from '../models/stock';
import { AccountService } from '../services/account.service';
import { StockService } from '../services/stocks.service';

declare let google: any;
// https://developers.google.com/chart/interactive/docs/gallery/barchart#stacked-bar-charts

@Component({
  selector: 'app-stock-details',
  templateUrl: './stock-details.component.html',
  styleUrls: ['./stock-details.component.scss']
})
export class StockDetailsComponent implements OnInit {

  stockQuote: StockQuote | null = null;
  symbol: string | null = null;
  name: string | null = null;
  currency: string | null = null;
  
  filterMarketNews: News[] = [];
  marketNews: News[] = [];
  hasMoreNews: boolean = false;
  metric: Metric | null = null;
  showRecommendationGraph: boolean = false;
  showTrendGraph: boolean = true;

  watchlisted: boolean = false;

  private exchange: Exchange | null = null; 

  buyForm: FormGroup;
  accounts: Account[] = [];

  loading: boolean = false;
  errorMsg: string = '';
  successMsg: string = '';

  constructor(private activatedroute: ActivatedRoute, private router: Router, 
    private stockService: StockService, private accountServ: AccountService) {
      this.buyForm = new FormGroup({
        type: new FormControl('', [Validators.required]),
        account: new FormControl('', [Validators.required]),
        quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
        price: new FormControl(0, [Validators.required, Validators.min(0)])
      });
  }

  ngOnInit(): void {
    this.symbol = this.activatedroute.snapshot.paramMap.get('symbol');
    this.name = this.activatedroute.snapshot.paramMap.get('name');
    this.currency = this.activatedroute.snapshot.paramMap.get('currency');

    if (this.symbol) {
      this.loading = true;
      this.stockService.getStock(this.symbol)
      .subscribe(resp => {
        this.stockQuote = resp;
        this.loading = false;

        this.accountServ.getAccounts()
        .subscribe(resp => {
          this.accounts = resp;
          this.buyForm.patchValue({
            account: this.accounts[0]._id,
            type: "Market buy"
          });
        }, err => {});

        this.getCurrencyRates();
        this.getCompanyNews();
        this.getBasicFinancials();
        this.getRecommendations();
        this.getHistoricalData();
      }, err => {
        this.errorMsg = 'Failed to fetch stock details';
        this.loading = false;
      });

      this.stockService.getWatchList(false).toPromise()
      .then(w => {
        let s = w.find(x => x.symbol === this.symbol);
        if(s) {
          this.watchlisted = true;
        } else {
          this.watchlisted = false;
        }
      }).catch(e => {})
    } else {
      this.router.navigate(['']);
    }
  }

  private getCurrencyRates() {
    this.stockService.getCurrenyRates()
    .subscribe(
      resp => {
        if (resp) {
          this.exchange = resp;
        }
      }, err => {}
    );
  }

  public getPrice() {
    let accId = this.buyForm.value.account;
    let account = this.accounts.find(x => x._id == accId);
    let type = this.buyForm.value.type;
    let limitBuy = this.buyForm.value.price;
    let quantity = this.buyForm.value.quantity;

    let price = this.stockQuote!.c;

    if (type === 'Limit buy') {
      price = limitBuy;
    }

    if (!this.stockQuote || !account) {
      return 0;
    }

    if (!this.exchange) {
      return quantity * price; 
    }

    let exchangeRate = 1;
    if (this.currency == 'USD' && account!.currency != 'USD') {
      exchangeRate = this.exchange!.USD_CAD;
    } else if (this.currency == 'CAD' && account!.currency != 'CAD') {
      exchangeRate = this.exchange!.CAD_USD;
    }

    let totalPrice = quantity * price;
    return totalPrice * exchangeRate;
  }

  private getCompanyNews() {
    this.stockService.getCompanyNews(this.symbol!)
      .subscribe(
        (resp: News[]) => {
          this.marketNews =  resp;
          if (this.marketNews.length > 0) {
            this.filterMarketNews = this.marketNews.slice(0, 5);
            if (this.marketNews.length > 5) {
              this.hasMoreNews = true;
            }
          }
        }, err => {
        }
      );
  }

  getMoreNews() {
    let fl = this.filterMarketNews.length;
    let max = this.marketNews.length;
    this.filterMarketNews = this.marketNews.slice(0, fl + 5);
    if (fl + 5 >= max) {
      this.hasMoreNews = false;
    }
  }

  private getBasicFinancials() {
    this.stockService.getBasicFinancials(this.symbol!)
      .subscribe((resp: Metric) => {
        this.metric = resp;
      }, err => {})
  }

  private getRecommendations() {
    this.stockService.getRecommendations(this.symbol!)
    .subscribe((resp: Trend[]) => {
      this.drawRecommendationChart(resp);
    }, err => {})
  }

  private getHistoricalData() {
    this.stockService.getHistoricalData(this.symbol!).toPromise()
    .then(data => {
      if (data.length == 0) {
        this.showTrendGraph = false;
      }
      this.drawHistGraph(data)
    })
    .catch(err => { this.showTrendGraph = false; });
  }

  private drawHistGraph(chartData: any) {
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    var lineChartCols: any[] = [];
    var dataColors: any[] = [
      { color: '#306EFF', disableColor: '#82CAFF'},
      { color: '#348017', disableColor: '#99C68E'},
      { color: '#C68E17', disableColor: '#ECE5B6'},
      { color: '#F62217', disableColor: '#F75D59'},
      { color: '#7F38EC', disableColor: '#E0B0FF'},
      { color: '#E4287C', disableColor: '#F778A1'},
      { color: '#7E3517', disableColor: '#C5908E'},
      { color: '#827839', disableColor: '#C8B560'}
    ];
    if (chartData[0]) {
      chartData[0].forEach((x: string) => {
        lineChartCols.push({
          name: x,
          visible: true
        });
      });
    }
    var data, dataView;
    function drawChart() {
      data = google.visualization.arrayToDataTable(chartData, false);
      dataView = new google.visualization.DataView(data);

      var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

      // Toggle visibility of data series on click of legend.
      google.visualization.events.addListener(chart, 'click', function (target: any) {
        if (target.targetID.match(/^legendentry#\d+$/)) {    
          var index = parseInt(target.targetID.slice(12)) + 1;
          lineChartCols[index].visible = !lineChartCols[index].visible;
          drawChart();
        }
      });
      
      let visibleColumnIndexes = <any>[0];
      let colors: string[] = [];
      for (var i = 1; i < lineChartCols.length; i++) {
        if (lineChartCols[i].visible) {
          visibleColumnIndexes.push(i);
          colors.push(dataColors[i-1].color);
        } else {
          visibleColumnIndexes.push({
            calc: () => null,
            type: 'number',
            label: lineChartCols[i].name
          });
          colors.push(dataColors[i-1].disableColor);
        }
      }
      dataView.setColumns(visibleColumnIndexes);

      var options = {
        colors: colors
      };
      chart.draw(dataView, options);
    }
  }

  // https://codepen.io/gapple/details/nluHK
  private drawRecommendationChart(chartData: any) {
    google.charts.load('current', {'packages': ['bar']});
    google.charts.setOnLoadCallback(drawChart);
    this.showRecommendationGraph = true;

    function drawChart() {
      // https://developers.google.com/chart/interactive/docs/gallery/barchart#stacked-bar-charts
      var data = google.visualization.arrayToDataTable(chartData);

      const options = {
        isStacked: true,
        vAxis: {format: 'decimal'},
        hAxis: {format: '', title: ''},
        series: {
          0: {color: '#ff6347'},
          1: {color: '#3cb371'},
          2: {color: '#ee82ee'},
          3: {color: '#ffa500'},
          4: {color: '#6a5acd'},
        }
      };

      const chart = new google.charts.Bar(document.querySelector('#recommendations_chart'));

      chart.draw(data, google.charts.Bar.convertOptions(options));
    }
  }

  toggleWatchlist() {
    this.stockService.toggleWatchlist(this.symbol!, this.name!, this.currency!, !this.watchlisted)
    .subscribe(resp => {
      this.watchlisted = !this.watchlisted;
    }, err => { });
  }

  buy() {

  }

}
