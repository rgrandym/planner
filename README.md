# ArchFlow

A local web application for software architecture planning with a dark-themed, node-based canvas editor. Drag architecture components onto a canvas, connect them, and export diagrams as Mermaid code for Jupyter notebooks.

## Features

- 🎨 **Dark-themed Canvas Editor** - Beautiful node-based interface similar to n8n or LangFlow
- 📦 **Component Library** - Pre-built nodes for AI/ML, Databases, Storage, Logic, and Infrastructure
- 🔗 **Visual Connections** - Connect components with animated edges
- 📋 **Property Panel** - Configure node properties with intuitive controls
- 🐍 **Mermaid Export** - Export diagrams as Python code for Jupyter notebooks
- 💾 **Auto-save** - Automatic persistence to localStorage

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) + TypeScript |
| Styling | Tailwind CSS |
| Canvas | React Flow |
| Icons | Lucide-React |
| State | Zustand |
| Backend | FastAPI (Python) |
| Export | Mermaid.js syntax |

## Quick Start

### Frontend

```bash
cd src/frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend (Optional)

```bash
cd src/backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## Project Structure

```
planner/
├── src/
│   ├── frontend/           # React + Vite application
│   │   ├── src/
│   │   │   ├── components/ # UI components
│   │   │   ├── nodes/      # Custom React Flow nodes
│   │   │   ├── store/      # Zustand state management
│   │   │   ├── utils/      # Helper functions & Mermaid export
│   │   │   └── types/      # TypeScript interfaces
│   │   └── ...
│   └── backend/            # FastAPI server
│       ├── main.py
│       └── requirements.txt
├── config/                 # Configuration files
├── docs/                   # Documentation
└── README.md
```

## Usage

1. **Drag nodes** from the sidebar onto the canvas
2. **Connect nodes** by dragging from output handles to input handles
3. **Select a node** to view/edit its properties in the right panel
4. **Right-click** for context menu options
5. **Export** your diagram using `Cmd/Ctrl + E` or the Export button

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + C` | Copy selected node |
| `Cmd/Ctrl + V` | Paste node |
| `Delete/Backspace` | Delete selected |
| `Cmd/Ctrl + E` | Open export modal |

## Adding Custom Nodes

See [docs/adding-nodes.md](docs/adding-nodes.md) for instructions on creating custom node types.

## License

MIT
