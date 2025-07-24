import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { ChartService } from './services/chart.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  imports: [
  RouterOutlet,
  RouterModule,
  MatSidenavModule,
  MatListModule,
  MatIconModule,
  MatToolbarModule,
  MatButtonModule,
  CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  
})
export class AppComponent {
  title = 'pfm-frontend';
  isExpanded = false;

  menuItems = [
    { icon: 'home', label: 'Home', route: '/' },
    { icon: 'account_balance_wallet', label: 'My Accounts', route: '/accounts' },
    { icon: 'payments', label: 'Payments', route: '/payments' },
    { icon: 'credit_card',
      label: 'Cards',
      route: null, 
      action: () => this.toggleCardsInCharts() },
    { icon: 'currency_exchange', label: 'Currency Exchange', route: '/exchange' },
    { icon: 'description', label: 'Product Catalogue', route: '/catalogue' },
    { icon: 'insights', label: 'PFM', route: '/transactions' },
    { icon: 'settings', label: 'Self Care', route: '/settings' },
    { icon: 'support_agent', label: 'Support', route: '/support' },
  ];

  constructor(private chartsService: ChartService) {}

  toggleCardsInCharts() {
    this.chartsService.toggleCards(); 
  }
}
