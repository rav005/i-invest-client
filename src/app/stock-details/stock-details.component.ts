import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Metric, News, StockQuote, Trend } from '../models/stock';
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
  
  filterMarketNews: News[] = [];
  marketNews: News[] = [];
  hasMoreNews: boolean = false;
  metric: Metric | null = null;
  showTrendGraph: boolean = false;

  loading: boolean = false;
  errorMsg: string = '';

  chart: any = {
    title: 'Check Chart',
    type: 'BarChart',
    columns: ['Genre', 'Fantasy & Sci Fi', 'Romance', 'Mystery/Crime', 'General',
    'Western', 'Literature' ],
    data: [
      ['2010', 10, 24, 20, 32, 18, 5],
      ['2020', 16, 22, 23, 30, 16, 9],
      ['2030', 28, 19, 29, 30, 12, 13]
    ],
    options: {
      width: 600,
      height: 400,
      legend: { position: 'top', maxLines: 3 },
      bar: { groupWidth: '75%' },
      isStacked: true
    }
  };

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
        this.getBasicFinancials();
        this.getRecommendations();
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
    if (fl + 5 >= max){
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
      this.drawChart(resp);
    }, err => {})
  }



  private drawChart(chartData: any) {
    google.charts.load('current', {'packages': ['bar']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
      // https://developers.google.com/chart/interactive/docs/gallery/barchart#stacked-bar-charts
      var data = google.visualization.arrayToDataTable(chartData);

      const options = {
        height: 200,
        width: 400,
        isStacked: true,
        vAxis: {format: 'decimal'},
        hAxis: {format: ''},
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

}
