import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlaylistDetailPageRoutingModule } from './playlist-detail-routing.module';

import { PlaylistDetailPage } from './playlist-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlaylistDetailPageRoutingModule,
    PlaylistDetailPage
  ],
})
export class PlaylistDetailPageModule {}
