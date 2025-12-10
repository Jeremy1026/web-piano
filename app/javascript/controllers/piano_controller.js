import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["keyboard", "key", "recordBtn", "recordLabel", "saveBtn", "status", "nameInput"]

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
    this.activeOscillators = new Map()
    this.keyMap = new Map()

    // Recording state
    this.isRecording = false
    this.recordingStartTime = null
    this.recordedNotes = []

    // Build key mapping from data attributes
    this.keyTargets.forEach(keyElement => {
      const keyBinding = keyElement.dataset.key
      if (keyBinding) {
        this.keyMap.set(keyBinding.toLowerCase(), keyElement)
      }
    })

    // Bind keyboard events
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('keyup', this.handleKeyUp)
  }

  disconnect() {
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('keyup', this.handleKeyUp)

    // Clean up audio
    if (this.audioContext) {
      this.audioContext.close()
    }
  }

  initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
    // Resume if suspended (browsers require user interaction)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
  }

  playNote(event) {
    event.preventDefault()
    const keyElement = event.currentTarget
    const note = keyElement.dataset.note

    if (!note || this.activeOscillators.has(note)) return

    this.initAudioContext()
    this.startNote(note, keyElement)
  }

  stopNote(event) {
    const keyElement = event.currentTarget
    const note = keyElement.dataset.note

    if (!note) return

    this.endNote(note, keyElement)
  }

  startNote(note, keyElement) {
    const frequency = this.constructor.noteFrequencies[note]
    if (!frequency || this.activeOscillators.has(note)) return

    // Record the note if recording
    if (this.isRecording) {
      const ms = Date.now() - this.recordingStartTime
      this.recordedNotes.push({ note, ms })
    }

    // Create oscillator for piano-like sound
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    // Use triangle wave for a softer piano-like tone
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)

    // Add a second oscillator slightly detuned for richness
    const oscillator2 = this.audioContext.createOscillator()
    const gainNode2 = this.audioContext.createGain()
    oscillator2.type = 'sine'
    oscillator2.frequency.setValueAtTime(frequency * 2, this.audioContext.currentTime) // Octave higher
    oscillator2.detune.setValueAtTime(5, this.audioContext.currentTime)

    // Piano-like envelope: quick attack, gradual decay
    const now = this.audioContext.currentTime
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.01) // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.3) // Decay to sustain

    gainNode2.gain.setValueAtTime(0, now)
    gainNode2.gain.linearRampToValueAtTime(0.1, now + 0.01)
    gainNode2.gain.exponentialRampToValueAtTime(0.05, now + 0.3)

    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    oscillator2.connect(gainNode2)
    gainNode2.connect(this.audioContext.destination)

    oscillator.start()
    oscillator2.start()

    // Store oscillators for later stopping
    this.activeOscillators.set(note, {
      oscillators: [oscillator, oscillator2],
      gainNodes: [gainNode, gainNode2]
    })

    // Visual feedback
    keyElement.classList.add('active')
  }

  endNote(note, keyElement) {
    const noteData = this.activeOscillators.get(note)
    if (!noteData) return

    const { oscillators, gainNodes } = noteData
    const now = this.audioContext.currentTime

    // Smooth release
    gainNodes.forEach(gainNode => {
      gainNode.gain.cancelScheduledValues(now)
      gainNode.gain.setValueAtTime(gainNode.gain.value, now)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    })

    // Stop oscillators after release
    setTimeout(() => {
      oscillators.forEach(osc => osc.stop())
    }, 300)

    this.activeOscillators.delete(note)

    // Remove visual feedback
    keyElement.classList.remove('active')
  }

  handleKeyDown(event) {
    // Ignore if user is typing in an input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return
    // Ignore repeated keydown events (key held down)
    if (event.repeat) return

    const key = event.key.toLowerCase()
    const keyElement = this.keyMap.get(key)

    if (keyElement) {
      event.preventDefault()
      const note = keyElement.dataset.note
      this.initAudioContext()
      this.startNote(note, keyElement)
    }
  }

  handleKeyUp(event) {
    const key = event.key.toLowerCase()
    const keyElement = this.keyMap.get(key)

    if (keyElement) {
      const note = keyElement.dataset.note
      this.endNote(note, keyElement)
    }
  }

  // Recording methods
  toggleRecording() {
    if (this.isRecording) {
      this.stopRecording()
    } else {
      this.startRecording()
    }
  }

  startRecording() {
    this.isRecording = true
    this.recordingStartTime = Date.now()
    this.recordedNotes = []

    this.recordBtnTarget.classList.add('recording')
    this.recordLabelTarget.textContent = 'Stop'
    this.saveBtnTarget.disabled = true
    this.nameInputTarget.classList.add('hidden')
    this.statusTarget.textContent = 'Recording...'
  }

  stopRecording() {
    this.isRecording = false
    this.recordBtnTarget.classList.remove('recording')
    this.recordLabelTarget.textContent = 'Record'

    if (this.recordedNotes.length > 0) {
      this.saveBtnTarget.disabled = false
      this.nameInputTarget.classList.remove('hidden')
      this.statusTarget.textContent = `Recorded ${this.recordedNotes.length} notes. Name it and save!`
    } else {
      this.statusTarget.textContent = 'No notes recorded. Try again!'
    }
  }

  async saveRecording() {
    if (this.recordedNotes.length === 0) return

    this.saveBtnTarget.disabled = true
    this.statusTarget.textContent = 'Saving...'

    const name = this.nameInputTarget.value.trim()

    try {
      const response = await fetch('/recordings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: this.recordedNotes, name: name })
      })

      const data = await response.json()

      if (data.token) {
        const displayName = data.name || 'your recording'
        this.statusTarget.innerHTML = `Saved! <a href="/play/${data.token}">Play "${displayName}"</a>`
        this.recordedNotes = []
        this.nameInputTarget.value = ''
        this.nameInputTarget.classList.add('hidden')
      }
    } catch (error) {
      this.statusTarget.textContent = 'Error saving recording. Please try again.'
      this.saveBtnTarget.disabled = false
    }
  }
}
