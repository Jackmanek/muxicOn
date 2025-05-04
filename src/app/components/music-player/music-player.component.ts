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
  private audio = new Audio();


  ngOnInit() {
    if (this.song) {
      this.duration = this.song.duration || 180 // Default duration if not provided
    }
    if (this.song?.url) {
      this.setupAudio();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["song"] && changes["song"].currentValue) {
      this.currentTime = 0
      this.setupAudio();
    }

    if (changes["isPlaying"]) {
      if (this.isPlaying) {
        this.audio.play();
        this.startTimeUpdate()
      } else {
        this.audio.pause();
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
    if (this.audio) {
      this.audio.currentTime = this.currentTime;
    }
  }

  setVolume() {
    if (this.audio) {
      this.audio.volume = this.isMuted ? 0 : this.volume;
    }
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
  private setupAudio() {
    this.audio.src = this.song.file;
    this.audio.load();
  
    this.audio.onloadedmetadata = () => {
      this.duration = this.audio.duration;
    };
  
    this.audio.ontimeupdate = () => {
      this.currentTime = this.audio.currentTime;
    };
  
    this.audio.onended = () => {
      if (this.loopMode === "one") {
        this.audio.currentTime = 0;
        this.audio.play();
      } else if (this.loopMode === "all") {
        this.nextSong();
      } else {
        this.playPauseToggle.emit(false);
      }
    };
  
    this.setVolume(); // Inicializa el volumen
  }
}

