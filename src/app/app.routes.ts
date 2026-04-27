import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard-home/dashboard-home.component').then(
        (m) => m.DashboardHomeComponent
      ),
  },
  {
    path: 'articles',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./articles/articles.component').then((m) => m.ArticlesComponent),
  },
  {
    path: 'reactor',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./mini-reactor/mini-reactor-page.component').then(
        (m) => m.MiniReactorPageComponent
      ),
  },
  {
    path: 'quiz',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./quiz/quiz-game.component').then(
        (m) => m.QuizGameComponent
      ),
  },
  {
    path: 'leaderboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/leaderboard/leaderboard.component').then(
        (m) => m.LeaderboardComponent
      ),
  },
  {
    path: 'game',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./mini-game/radiation-runner.component').then(
        (m) => m.RadiationRunnerComponent
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
