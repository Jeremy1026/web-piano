# Piano Web App

A web-based piano application built with Ruby on Rails. Play piano using your mouse, touchscreen, or computer keyboard, and record your performances to play back later.

## Features

- **Interactive Piano Keyboard**: 17 keys spanning C3 to E4 with realistic styling
- **Multiple Input Methods**:
  - Click or tap keys with mouse/touchscreen
  - Use computer keyboard (A-L row for white keys, W-P row for black keys)
- **Recording & Playback**:
  - Record your performances with precise timing
  - Name your recordings (optional)
  - Play back recordings with Play/Pause/Stop controls
  - Visual feedback shows keys being played during playback
- **Web Audio API**: Synthesized piano sounds with realistic attack/decay envelope

## Tech Stack

- Ruby 3.2.2
- Rails 7.0.10
- PostgreSQL
- Hotwire (Turbo + Stimulus)
- Web Audio API

## Getting Started

### Prerequisites

- Ruby 3.2.2
- PostgreSQL
- Bundler

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd PianoWebApp
   ```

2. Install dependencies:
   ```bash
   bundle install
   ```

3. Create and migrate the database:
   ```bash
   rails db:create
   rails db:migrate
   ```

4. Start the server:
   ```bash
   rails server
   ```

5. Open http://localhost:3000 in your browser

## Keyboard Mapping

| Key | Note |
|-----|------|
| A | C3 |
| W | C#3 |
| S | D3 |
| E | D#3 |
| D | E3 |
| F | F3 |
| T | F#3 |
| G | G3 |
| Y | G#3 |
| H | A3 |
| U | A#3 |
| J | B3 |
| K | C4 |
| O | C#4 |
| L | D4 |
| P | D#4 |
| ; | E4 |

## Usage

1. **Play**: Click keys or use your keyboard to play notes
2. **Record**: Click the Record button, play your song, then click Stop
3. **Save**: Enter a name (optional) and click Save Recording
4. **Playback**: Visit the recording URL to play it back with full controls
