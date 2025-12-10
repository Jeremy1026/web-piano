import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["keyboard", "key", "playBtn", "pauseBtn", "stopBtn", "status"]
  static values = { notes: Array }

  // Note frequencies (A4 = 440Hz standard tuning)
  static noteFrequencies = {
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56,
    'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00,
    'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
    'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
    'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25
  }

  connect() {
    this.audioContext = null
    this.isPlaying = false
    this.isPaused = false
    this.currentNoteIndex = 0
    this.playbackStartTime = null
    this.pausedAt = 0
    this.scheduledTimeouts = []

    // Build note to key element mapping
    this.noteToKey = new Map()
    this.keyTargets.forEach(keyElement => {
      const note = keyElement.dataset.note
      if (note) {
        this.noteToKey.set(note, keyElement)
      }
    })
  }

  disconnect() {
    this.stop()
    if (this.audioContext) {
      this.audioContext.close()
    }
  }

  initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
  }

  play() {
    if (this.notesValue.length === 0) {
      this.statusTarget.textContent = 'No notes to play!'
      return
    }

    // Initialize audio context synchronously on user gesture (critical for mobile)
    this.initAudioContext()

    // Handle mobile browsers that require async resume
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        this.startPlayback()
      })
    } else {
      this.startPlayback()
    }
  }

  startPlayback() {
    this.isPlaying = true
    this.isPaused = false

    this.playBtnTarget.disabled = true
    this.pauseBtnTarget.disabled = false
    this.stopBtnTarget.disabled = false

    // If resuming from pause, adjust timing
    if (this.pausedAt > 0) {
      this.playbackStartTime = Date.now() - this.pausedAt
      this.statusTarget.textContent = 'Playing...'
    } else {
      this.playbackStartTime = Date.now()
      this.currentNoteIndex = 0
      this.statusTarget.textContent = 'Playing...'
    }

    this.scheduleNotes()
  }

  pause() {
    if (!this.isPlaying) return

    this.isPlaying = false
    this.isPaused = true
    this.pausedAt = Date.now() - this.playbackStartTime

    // Clear all scheduled timeouts
    this.scheduledTimeouts.forEach(timeout => clearTimeout(timeout))
    this.scheduledTimeouts = []

    this.playBtnTarget.disabled = false
    this.pauseBtnTarget.disabled = true
    this.statusTarget.textContent = 'Paused'
  }

  stop() {
    this.isPlaying = false
    this.isPaused = false
    this.currentNoteIndex = 0
    this.pausedAt = 0

    // Clear all scheduled timeouts
    this.scheduledTimeouts.forEach(timeout => clearTimeout(timeout))
    this.scheduledTimeouts = []

    // Remove active class from all keys
    this.keyTargets.forEach(key => key.classList.remove('active'))

    this.playBtnTarget.disabled = false
    this.pauseBtnTarget.disabled = true
    this.stopBtnTarget.disabled = true
    this.statusTarget.textContent = `${this.notesValue.length} notes recorded`
  }

  scheduleNotes() {
    const notes = this.notesValue
    const startOffset = this.pausedAt

    for (let i = 0; i < notes.length; i++) {
      const noteData = notes[i]

      // Skip notes that were already played before pause
      if (noteData.ms < startOffset) continue

      const delay = noteData.ms - startOffset
      const duration = noteData.duration || 200
      const timeout = setTimeout(() => {
        if (this.isPlaying) {
          this.playNoteSound(noteData.note, duration)
          this.currentNoteIndex = i + 1

          // Check if this is the last note
          if (i === notes.length - 1) {
            setTimeout(() => {
              if (this.isPlaying) {
                this.statusTarget.textContent = 'Finished!'
                this.stop()
              }
            }, duration + 300)
          }
        }
      }, delay)

      this.scheduledTimeouts.push(timeout)
    }
  }

  playNoteSound(note, duration) {
    const frequency = this.constructor.noteFrequencies[note]
    if (!frequency) return

    const keyElement = this.noteToKey.get(note)

    // Convert duration from ms to seconds
    const durationSec = duration / 1000
    const releaseTime = 0.3 // Release envelope time in seconds

    // Create oscillators
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)

    const oscillator2 = this.audioContext.createOscillator()
    const gainNode2 = this.audioContext.createGain()
    oscillator2.type = 'sine'
    oscillator2.frequency.setValueAtTime(frequency * 2, this.audioContext.currentTime)
    oscillator2.detune.setValueAtTime(5, this.audioContext.currentTime)

    // Envelope with duration-based sustain and release
    const now = this.audioContext.currentTime
    const sustainEnd = now + durationSec

    // Attack and sustain
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.01)
    gainNode.gain.setValueAtTime(0.2, now + 0.3) // Sustain level
    gainNode.gain.setValueAtTime(0.2, sustainEnd) // Hold sustain until release
    gainNode.gain.exponentialRampToValueAtTime(0.001, sustainEnd + releaseTime)

    gainNode2.gain.setValueAtTime(0, now)
    gainNode2.gain.linearRampToValueAtTime(0.1, now + 0.01)
    gainNode2.gain.setValueAtTime(0.05, now + 0.3)
    gainNode2.gain.setValueAtTime(0.05, sustainEnd)
    gainNode2.gain.exponentialRampToValueAtTime(0.001, sustainEnd + releaseTime)

    // Connect
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    oscillator2.connect(gainNode2)
    gainNode2.connect(this.audioContext.destination)

    oscillator.start()
    oscillator2.start()

    // Stop after duration + release
    oscillator.stop(sustainEnd + releaseTime + 0.1)
    oscillator2.stop(sustainEnd + releaseTime + 0.1)

    // Visual feedback matches the note duration
    if (keyElement) {
      keyElement.classList.add('active')
      setTimeout(() => {
        keyElement.classList.remove('active')
      }, duration)
    }
  }
}
