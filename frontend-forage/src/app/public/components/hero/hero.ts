import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero implements AfterViewInit, OnDestroy {
  private observer: IntersectionObserver | null = null;
  private cleanupFn: (() => void) | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {

    // ⛔ IMPORTANT : on sort immédiatement côté serveur
    if (!isPlatformBrowser(this.platformId)) return;

    // 👇 Ici window est garanti défini → plus d'erreur TS
    const els = Array.from(document.querySelectorAll<HTMLElement>('.fade-in'));

    // --- Avec IntersectionObserver ---
    if ('IntersectionObserver' in window) {

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('show');
            this.observer?.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      els.forEach(el => this.observer!.observe(el));
      return;
    }

    // --- Fallback sans IO ---
    const reveal = () => {
      els.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9) {
          el.classList.add('show');
        }
      });
    };

    reveal();

    // ⭐⭐⭐ Le fix : typer explicitement pour empêcher TS d'inférer "never"
    const scrollListener: () => void = () => reveal();
    const resizeListener: () => void = () => reveal();

    // if (window) {
    //   window.addEventListener('scroll', scrollListener);
    //   window.addEventListener('resize', resizeListener);
    // } else {
    //   console.error("L'élément n'a pas été trouvé.");
    // }

    this.cleanupFn = () => {
      window.removeEventListener('scroll', scrollListener);
      window.removeEventListener('resize', resizeListener);
    };
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.cleanupFn?.();
  }
}
