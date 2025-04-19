import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '', redirectTo: 'auth', pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then( m => m.AuthPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home-routing.module').then(m => m.HomePageRoutingModule)
  },
  {
    path: 'playlists',
    loadChildren: () => import('./pages/playlists/playlists.module').then( m => m.PlaylistsPageModule)
  },
  {
    path: 'playlist-detail',
    loadChildren: () => import('./pages/playlist-detail/playlist-detail.module').then( m => m.PlaylistDetailPageModule)
  },
  {
    path: 'playlist/:id',
    loadChildren: () => import('./pages/playlist-detail/playlist-detail.module').then(m => m.PlaylistDetailPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
