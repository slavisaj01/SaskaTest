import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private showCardsSubject = new BehaviorSubject<boolean>(false);
  showCards$ = this.showCardsSubject.asObservable();

  setShowCards(value: boolean) {
    this.showCardsSubject.next(value);
  }

  toggleCards() {
    this.showCardsSubject.next(!this.showCardsSubject.value);
  }
}
