"""
ArchFlow Backend - FastAPI Server
Provides API endpoints for saving and loading graph state.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Any, Optional
import json
import subprocess
import platform
from pathlib import Path

app = FastAPI(
    title="ArchFlow API",
    description="Backend API for ArchFlow architecture planning tool",
    version="0.0.1",
)

# CORS configuration for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data directory for persistence
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)
GRAPH_FILE = DATA_DIR / "graph.json"


class NodeData(BaseModel):
    """Node data model."""
    label: str
    nodeType: str
    color: str
    category: str
    description: Optional[str] = None
    metadata: Optional[dict] = None
    borderColor: Optional[str] = None
    opacity: Optional[int] = 90
    fontSize: Optional[int] = 14


class GraphNode(BaseModel):
    """Graph node model."""
    id: str
    type: str
    position: dict
    data: dict


class GraphEdge(BaseModel):
    """Graph edge model."""
    id: str
    source: str
    target: str
    type: Optional[str] = "smoothstep"
    animated: Optional[bool] = False
    style: Optional[dict] = None


class Viewport(BaseModel):
    """Viewport model."""
    x: float
    y: float
    zoom: float


class GraphState(BaseModel):
    """Complete graph state model."""
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    viewport: Optional[Viewport] = None


class SaveResponse(BaseModel):
    """Save endpoint response."""
    status: str
    message: str
    nodeCount: int
    edgeCount: int


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "ArchFlow API"}


@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "version": "0.0.1",
        "storage": str(DATA_DIR),
    }


@app.post("/save", response_model=SaveResponse)
async def save_graph(state: GraphState):
    """
    Save graph state to file.
    
    Args:
        state: GraphState containing nodes, edges, and viewport
        
    Returns:
        SaveResponse with status and counts
    """
    try:
        graph_data = state.model_dump()
        with open(GRAPH_FILE, "w") as f:
            json.dump(graph_data, f, indent=2)
        
        return SaveResponse(
            status="success",
            message="Graph saved successfully",
            nodeCount=len(state.nodes),
            edgeCount=len(state.edges),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/load")
async def load_graph():
    """
    Load graph state from file.
    
    Returns:
        GraphState or empty state if no saved data
    """
    try:
        if GRAPH_FILE.exists():
            with open(GRAPH_FILE, "r") as f:
                data = json.load(f)
            return data
        else:
            return {
                "nodes": [],
                "edges": [],
                "viewport": {"x": 0, "y": 0, "zoom": 1},
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/clear")
async def clear_graph():
    """
    Clear saved graph state.
    
    Returns:
        Status message
    """
    try:
        if GRAPH_FILE.exists():
            GRAPH_FILE.unlink()
        return {"status": "success", "message": "Graph cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/export/mermaid")
async def export_mermaid(state: GraphState):
    """
    Generate Mermaid code from graph state.
    
    Args:
        state: GraphState containing nodes and edges
        
    Returns:
        Mermaid code and Python wrapper
    """
    try:
        # Generate Mermaid code
        lines = ["graph LR"]
        
        # Node shape mapping
        shape_map = {
            "PostgreSQL": "[({})]",
            "MySQL": "[({})]",
            "MongoDB": "[({})]",
            "Redis": "[({})]",
            "Snowflake": "[({})]",
            "LLM": "{{{{{}}}}}",
            "VectorDB": "{{{{{}}}}}",
            "ModelTraining": "{{{{{}}}}}",
            "Router": "{{{}}}",
            "Filter": "{{{}}}",
        }
        
        # Generate nodes
        for node in state.nodes:
            node_id = node.id.replace("-", "_").replace(" ", "_")
            label = node.data.get("label", node.data.get("nodeType", "Node"))
            node_type = node.data.get("nodeType", "default")
            
            shape = shape_map.get(node_type, "({})")
            lines.append(f"    {node_id}{shape.format(label)}")
        
        # Generate edges
        lines.append("")
        for edge in state.edges:
            source = edge.source.replace("-", "_").replace(" ", "_")
            target = edge.target.replace("-", "_").replace(" ", "_")
            lines.append(f"    {source} --> {target}")
        
        # Generate styles
        lines.append("")
        for node in state.nodes:
            if color := node.data.get("color"):
                node_id = node.id.replace("-", "_").replace(" ", "_")
                lines.append(f"    style {node_id} fill:{color}")
        
        mermaid_code = "\n".join(lines)
        
        # Generate Python wrapper
        python_code = f'''# Generated by ArchFlow
from IPython.display import display, Markdown

mermaid_code = """
{mermaid_code}
"""

display(Markdown(f"```mermaid\\n{{mermaid_code}}\\n```"))'''
        
        return {
            "mermaid": mermaid_code,
            "python": python_code,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class OpenUrlRequest(BaseModel):
    """Request model for opening URL in browser."""
    url: str


@app.post("/open-url")
async def open_url_in_chrome(request: OpenUrlRequest):
    """
    Open a URL in Chrome browser.
    
    This endpoint is used because Safari doesn't support the File System Access API
    for saving files to directories.
    
    Args:
        request: OpenUrlRequest containing the URL to open
        
    Returns:
        Status message
    """
    try:
        url = request.url
        system = platform.system()
        
        if system == "Darwin":  # macOS
            # Try Chrome first, fall back to default browser
            try:
                subprocess.run(
                    ["open", "-a", "Google Chrome", url],
                    check=True,
                    capture_output=True
                )
            except subprocess.CalledProcessError:
                # Chrome not found, try Chromium or fall back to default
                try:
                    subprocess.run(
                        ["open", "-a", "Chromium", url],
                        check=True,
                        capture_output=True
                    )
                except subprocess.CalledProcessError:
                    # Fall back to default browser
                    subprocess.run(["open", url], check=True)
        elif system == "Windows":
            # Try Chrome on Windows
            try:
                subprocess.run(
                    ["start", "chrome", url],
                    shell=True,
                    check=True,
                    capture_output=True
                )
            except subprocess.CalledProcessError:
                # Fall back to default browser
                subprocess.run(["start", url], shell=True, check=True)
        elif system == "Linux":
            # Try Chrome/Chromium on Linux
            for browser in ["google-chrome", "chromium-browser", "chromium"]:
                try:
                    subprocess.run([browser, url], check=True, capture_output=True)
                    break
                except (subprocess.CalledProcessError, FileNotFoundError):
                    continue
            else:
                # Fall back to xdg-open
                subprocess.run(["xdg-open", url], check=True)
        
        return {"status": "success", "message": f"Opened {url} in Chrome"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
