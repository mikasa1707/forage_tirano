import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Equipe } from '../../../models/equipe.model';
import { EquipesService } from '../../../services/equipes.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-equipes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './equipes.html',
  styleUrls: ['./equipes.scss'],
})
export class Equipes implements OnInit {
  equipes: Equipe[] = [];
  apiUrl = environment.api;

  constructor(
    private equipesService: EquipesService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.equipesService.list().subscribe((data: Equipe[]) => {
      this.equipes = data;
      this.cdr.detectChanges();
    });
  }
}
