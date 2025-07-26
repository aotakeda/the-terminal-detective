# The Terminal Detective

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white)](https://bun.sh/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://docker.com/)

> **A terminal-based detective game that teaches essential command-line skills through missions.**

Learn real-world command-line skills by navigating file systems, analyzing evidence, hunting for clues, and solving puzzles.

## Game Features

### **Mission-Based Learning**

- **10 Progressive Missions** from basic file navigation to advanced system investigation
- **Difficulty Scaling** from beginner-friendly to intermediate challenges
- **Real-World Scenarios** based on actual cybersecurity investigations
- **Interactive Storytelling** with typewriter effects and immersive narratives

### **Progress & Achievement System**

- **Persistent Progress** - Resume your investigation anytime
- **Mission Unlocking** - Complete missions to unlock new challenges
- **Skill Tracking** - See which commands you've mastered
- **Completion Statistics** - Track your detective journey

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone and run with Docker Compose
git clone https://github.com/aotakeda/the-terminal-detective.git
cd the-terminal-detective
docker-compose up --build

# Your progress will be automatically saved between sessions!
```

### Option 2: Local Development

```bash
# Prerequisites: Bun installed
git clone https://github.com/aotakeda/the-terminal-detective.git
cd the-terminal-detective
bun install
bun run dev
```

### Option 3: NPX (Coming Soon)

```bash
# Run directly without installation
npx the-terminal-detective
```

## How to Play

### **Getting Started**

1. **Launch the game** using your preferred method above
2. **Select Mission 1** - "The Missing Files" to begin your training
3. **Read the briefing** to understand your investigation objectives
4. **Use terminal commands** to navigate and investigate
5. **Complete objectives** to progress through the story

### **Mission Structure**

Each mission includes:

- **Story Briefing**: Context and background for your investigation
- **Objectives**: Specific tasks to complete using terminal commands
- **Hints**: Helpful guidance when you're stuck
- **Completion**: Unlock new missions and skills

## Learning Progression

### **Level 1: File Detective** (Missions 1-4)

Learn essential file operations and navigation:

- File system navigation (`ls`, `cd`, `pwd`)
- Reading and examining files (`cat`, `head`, `tail`)
- Searching and filtering (`grep`, `find`)
- File analysis (`wc`, `file`, `sort`)

### **Level 2: System Investigator** (Missions 5-7)

Master file management and permissions:

- File permissions and security (`chmod`, `ls -l`)
- Directory operations (`mkdir`, `cp`, `mv`)
- Archive handling (`tar`, `gzip`)

### **Level 3: Cyber Detective** (Missions 8-10)

Advanced system administration and monitoring:

- Process management (`ps`, `kill`, `top`)
- System monitoring (`df`, `du`)
- Network diagnostics (`ping`, `netstat`, `curl`)

## Technical Architecture

### **Built With Modern Technologies**

- **[Bun](https://bun.sh/)** - JavaScript runtime and package manager
- **[React](https://reactjs.org/) + [Ink](https://github.com/vadimdemedes/ink)** - Terminal user interfaces with React
- **[TypeScript](https://typescriptlang.org/)** - Type-safe development
- **[Vitest](https://vitest.dev/)** - Fast unit testing framework
- **[Docker](https://docker.com/)** - Containerized deployment

### **Project Structure**

```
src/
├── components/          # React components for terminal UI
│   ├── GameScreen.tsx   # Main game orchestration
│   ├── MissionSelect.tsx # Mission selection interface
│   ├── MissionGame.tsx  # Individual mission gameplay
│   └── Terminal.tsx     # Terminal input/output handling
├── commands/            # Command system implementation
│   ├── handlers.ts      # Individual command implementations
│   ├── registry.ts      # Command registration and execution
│   └── types.ts        # Command system type definitions
├── data/               # Mission definitions and content
│   ├── missions-level1.ts # Beginner missions
│   └── missions.ts      # Mission aggregation
├── utils/              # Utility functions
│   ├── filesystem.ts   # Virtual filesystem implementation
│   ├── progress.ts     # Progress persistence
│   └── objectives.ts   # Mission objective validation
└── types/              # TypeScript type definitions
    └── mission.ts      # Mission and game state types
```
