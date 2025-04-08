import { CommonModule } from "@angular/common"
import { Component, Input, Output, EventEmitter, type OnInit, type OnChanges, type SimpleChanges } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { IonicModule } from "@ionic/angular"

@Component({
  selector: "app-music-player",
  templateUrl: "./music-player.component.html",
  styleUrls: ["./music-player.component.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class MusicPlayerComponent implements OnInit, OnChanges {
  @Input() song: any
  @Input() isPlaying = false
  @Output() playPauseToggle = new EventEmitter<boolean>()
  @Output() nextSongEvent = new EventEmitter<void>()
  @Output() prevSongEvent = new EventEmitter<void>()

  currentTime = 0
  duration = 0
  volume = 0.8
  isMuted = false
  isShuffle = false
  loopMode: "none" | "one" | "all" = "none"
  isExpanded = false
  audioInterval: any

  ngOnInit() {
    if (this.song) {
      this.duration = this.song.duration || 180 // Default duration if not provided
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["song"] && changes["song"].currentValue) {
      this.currentTime = 0
      this.duration = changes["song"].currentValue.duration || 180
    }

    if (changes["isPlaying"]) {
      if (this.isPlaying) {
        this.startTimeUpdate()
      } else {
        this.stopTimeUpdate()
      }
    }
  }

  togglePlayPause(event?: Event) {

    if (event) {
      event.stopPropagation();
    }
    console.log('Toggle play/pause, current state:', this.isPlaying);
    this.playPauseToggle.emit(!this.isPlaying);
  
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded
  }

  toggleShuffle() {
    this.isShuffle = !this.isShuffle
  }

  toggleLoop() {
    const modes: ("none" | "one" | "all")[] = ["none", "one", "all"]
    const currentIndex = modes.indexOf(this.loopMode)
    const nextIndex = (currentIndex + 1) % modes.length
    this.loopMode = modes[nextIndex]
  }

  toggleMute() {
    this.isMuted = !this.isMuted
  }

  seekAudio() {
    // En una implementación real, aquí controlarías el audio HTML5
    console.log("Seeking to:", this.currentTime)
  }

  setVolume() {
    // En una implementación real, aquí controlarías el volumen del audio
    if (this.volume > 0 && this.isMuted) {
      this.isMuted = false
    }
    console.log("Setting volume to:", this.isMuted ? 0 : this.volume)
  }

  prevSong() {
    this.prevSongEvent.emit()
  }

  nextSong() {
    this.nextSongEvent.emit()
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  private startTimeUpdate() {
    this.stopTimeUpdate()
    this.audioInterval = setInterval(() => {
      this.currentTime += 1
      if (this.currentTime >= this.duration) {
        this.currentTime = 0

        if (this.loopMode === "one") {
          // Continuar reproduciendo la misma canción
          this.playPauseToggle.emit(true)
        } else if (this.loopMode === "all") {
          // Pasar a la siguiente canción
          this.nextSong()
        } else {
          // Detener la reproducción
          this.playPauseToggle.emit(false)
        }
      }
    }, 1000)
  }

  private stopTimeUpdate() {
    if (this.audioInterval) {
      clearInterval(this.audioInterval)
    }
  }

  ngOnDestroy() {
    this.stopTimeUpdate()
  }
}

