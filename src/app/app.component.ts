import { Component } from '@angular/core';
import { SearchStock } from './models/stock';
import { AuthService } from './services/auth.service';
import { StockService } from './services/stocks.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'I-Invest-Client';
  
  searchText: string = '';
  searchResult: SearchStock[] = [];

  constructor(private auth: AuthService, private stockService: StockService) { }

  logout() {
    this.auth.logout();
  }

  search() {
    if (this.searchText.length > 2) {
      this.searchResult = this.stockService.search(this.searchText);
    }
  }
}
