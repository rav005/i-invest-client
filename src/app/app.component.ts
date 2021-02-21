import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'I-Invest-Client';


  constructor(private auth: AuthService) { }

  logout() {
    this.auth.logout();
  }
}
