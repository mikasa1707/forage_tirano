import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  @Output() toggleMenu = new EventEmitter<void>();
  @Output() toggleTheme = new EventEmitter<void>();
}
