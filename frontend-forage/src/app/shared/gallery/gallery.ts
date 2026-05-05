import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class Gallery {
@Input() photos: any[] = [];
  @Input() index: number = 0;

  @Output() close = new EventEmitter<void>();

  next() {
    if (this.index < this.photos.length - 1) this.index++;
  }

  prev() {
    if (this.index > 0) this.index--;
  }

  closeGallery() {
    this.close.emit();
  }
}
