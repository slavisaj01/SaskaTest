import { Routes } from '@angular/router';
import { TransactionListComponent } from './components/transactions/transaction-list/transaction-list.component';
import { HomeComponent } from './components/home/home.component';


export const routes: Routes = [
    {
        path:'',
        component:HomeComponent,
        pathMatch:'full'
    },
    {
        path:'transactions',
        component:TransactionListComponent
    }

];
