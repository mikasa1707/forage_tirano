import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { Hero } from '../../components/hero/hero';
import { Services } from '../../components/services/services';
import { Travaux } from '../../components/travaux/travaux';
import { Equipes } from '../../components/equipes/equipes';
import { Contact } from '../../components/contact/contact';

@Component({
  selector: 'app-home',
  imports: [Header, Hero, Services, Travaux, Equipes, Contact, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  circleX = 0;
  circleY = 0;
  circleVisible = false;

  onMouseMove(event: MouseEvent) {
    this.circleX = event.clientX;
    this.circleY = event.clientY;
    this.circleVisible = true;
  }
}
