import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  loading = signal(false);
  private count = 0;

  show() {
    this.count++;
    this.loading.set(true);
  }

  hide() {
    this.count--;
    if (this.count <= 0) {
      this.count = 0;
      this.loading.set(false);
    }
  }
}