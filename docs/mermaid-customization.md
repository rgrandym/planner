# Customizing Mermaid Export

This guide explains how to customize the Mermaid export functionality in ArchFlow.

## Overview

ArchFlow converts your visual diagrams into Mermaid.js syntax, which can be rendered in Jupyter notebooks, documentation tools, and the Mermaid Live Editor.

## Shape Mapping

### Default Shapes

| Node Category | Mermaid Shape | Syntax |
|--------------|---------------|--------|
| Databases | Cylinder | `[(label)]` |
| AI/ML | Hexagon | `{{label}}` |
| Logic/Flow | Diamond | `{label}` |
| Storage | Rectangle | `[label]` |
| Data Types | Stadium | `([label])` |
| Infrastructure | Parallelogram | `[/label/]` |
| Default | Rounded | `(label)` |

### Modifying Shape Mappings

Edit `src/frontend/src/utils/mermaidExport.ts`:

```typescript
const MERMAID_SHAPES: Record<string, MermaidShapeFunction> = {
  // Change an existing shape
  PostgreSQL: (id, label) => `${id}[["${label}"]]`, // Double brackets

  // Add a new shape
  CustomNode: (id, label) => `${id}>${label}]`, // Flag shape
};
```

### Available Mermaid Shapes

```
[label]         Rectangle
(label)         Rounded rectangle
([label])       Stadium/pill
[[label]]       Subroutine
[(label)]       Cylinder (database)
((label))       Circle
>label]         Flag/asymmetric
{label}         Rhombus (diamond)
{{label}}       Hexagon
[/label/]       Parallelogram
[\label\]       Parallelogram alt
[/label\]       Trapezoid
[\label/]       Trapezoid alt
```

## Graph Direction

Change the default graph direction in `generateMermaidCode`:

```typescript
// Options: LR (left-right), TB (top-bottom), RL (right-left), BT (bottom-top)
export function generateMermaidCode(
  nodes: Node<ArchNodeData>[],
  edges: Edge[],
  options: MermaidExportOptions = {}
): string {
  const { direction = 'TB' } = options; // Change default here
  // ...
}
```

## Edge Styles

### Default Edge

Standard arrow:
```mermaid
A --> B
```

### Custom Edge Labels

To add edge labels, modify the export function:

```typescript
const edgeLines = edges.map((edge) => {
  const source = sanitizeId(edge.source);
  const target = sanitizeId(edge.target);
  const label = edge.label ? `|${edge.label}|` : '';
  return `    ${source} -->${label} ${target}`;
});
```

### Edge Types

```
A --> B     Arrow
A --- B     Line
A -.-> B    Dotted arrow
A ==> B     Thick arrow
A --o B     Circle end
A --x B     Cross end
```

## Subgraphs

To group nodes into subgraphs, you could extend the export:

```typescript
function generateSubgraphs(nodes: Node<ArchNodeData>[]): string[] {
  const byCategory = groupBy(nodes, n => n.data.category);
  
  return Object.entries(byCategory).map(([category, categoryNodes]) => {
    const nodeIds = categoryNodes.map(n => sanitizeId(n.id)).join('\n        ');
    return `    subgraph ${category}
        ${nodeIds}
    end`;
  });
}
```

## Styling

### Node Colors

The export automatically includes style definitions based on node colors:

```mermaid
style NodeId fill:#3b82f6
```

### Custom Class Definitions

Add class definitions for reusable styles:

```typescript
const classDefs = [
  'classDef database fill:#3b82f6,stroke:#1d4ed8',
  'classDef aiml fill:#8b5cf6,stroke:#6d28d9',
];

const classAssignments = nodes.map(node => {
  const cleanId = sanitizeId(node.id);
  return `class ${cleanId} ${node.data.category}`;
});
```

## Python Wrapper

The default Python wrapper uses IPython's Markdown display:

```python
from IPython.display import display, Markdown

display(Markdown(f"```mermaid\n{mermaid_code}\n```"))
```

### Alternative: Base64 Image

For environments that don't support Mermaid rendering:

```python
import base64
import requests

def render_mermaid_to_image(code):
    encoded = base64.b64encode(code.encode()).decode()
    url = f"https://mermaid.ink/img/{encoded}"
    return url
```

### Alternative: Mermaid CLI

```python
import subprocess

def render_mermaid_cli(code, output_path):
    with open('temp.mmd', 'w') as f:
        f.write(code)
    subprocess.run(['mmdc', '-i', 'temp.mmd', '-o', output_path])
```

## Validation

The export includes basic syntax validation:

```typescript
export function validateMermaidSyntax(code: string): {
  isValid: boolean;
  error?: string;
} {
  // Checks for:
  // - Empty diagram
  // - Missing graph declaration
  // - Unbalanced brackets
}
```

## Testing

Test your exports at [mermaid.live](https://mermaid.live) before using in production.
