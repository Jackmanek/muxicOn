import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlaylistDetailPageRoutingModule } from './playlist-detail-routing.module';

import { PlaylistDetailPage } from './playlist-detail.page';
import { MusicPlayerComponent } from 'src/app/components/music-player/music-player.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlaylistDetailPageRoutingModule,
    PlaylistDetailPage,
    MusicPlayerComponent,
  ],
})
export class PlaylistDetailPageModule {}
