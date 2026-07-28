import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    @if (authService.isLoggedIn()) {
      <app-navbar></app-navbar>
    }
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    main {
      background-color: #f8fafc;
      min-height: calc(100vh - 64px);
    }
  `]
})
export class App {
  authService = inject(AuthService);
  title = 'laddukadai-frontend';
}
