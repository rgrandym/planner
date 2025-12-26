# Adding New Node Types

This guide explains how to add custom node types to ArchFlow.

## Step 1: Define the Node Type

Add your new node type to the node configuration in `src/frontend/src/config/nodes.ts`:

```typescript
import { YourIcon } from 'lucide-react';

// Add to the appropriate category
{
  id: 'your-category',
  label: 'Your Category',
  color: '#hexcolor',
  nodes: [
    // Add your new node here
    {
      type: 'YourNodeType',
      label: 'Your Node',
      icon: YourIcon,
      category: 'your-category',
      color: '#hexcolor',
    },
  ],
}
```

## Step 2: Add Mermaid Shape Mapping

If your node type needs a custom Mermaid shape, add it to `src/frontend/src/utils/mermaidExport.ts`:

```typescript
const MERMAID_SHAPES: Record<string, MermaidShapeFunction> = {
  // Add your mapping
  YourNodeType: (id, label) => `${id}[(${label})]`,
  
  // Existing mappings...
};
```

### Available Mermaid Shapes

| Shape | Syntax | Visual |
|-------|--------|--------|
| Rectangle | `[label]` | Standard box |
| Rounded | `(label)` | Rounded corners |
| Stadium | `([label])` | Pill shape |
| Cylinder | `[(label)]` | Database style |
| Diamond | `{label}` | Decision/logic |
| Hexagon | `{{label}}` | AI/ML nodes |
| Parallelogram | `[/label/]` | Input/output |

## Step 3: Add Property Panel Metadata (Optional)

If your node type needs custom configuration fields, update `src/frontend/src/components/PropertyPanel.tsx`:

```typescript
function getMetadataFields(category: NodeCategory) {
  switch (category) {
    case 'your-category':
      return [
        {
          key: 'customField',
          label: 'Custom Field',
          placeholder: 'Enter value...',
        },
      ];
    // ...
  }
}
```

## Step 4: Add Category Color (If New Category)

If you're adding a new category, update `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      'cat-yourcategory': '#hexcolor',
    },
  },
}
```

And add to `CATEGORY_COLORS` in `nodes.ts`:

```typescript
export const CATEGORY_COLORS: Record<NodeCategory, string> = {
  'your-category': '#hexcolor',
};
```

## Example: Adding a "Kubernetes" Node

### 1. Add the node type:

```typescript
// In nodes.ts
{
  type: 'Kubernetes',
  label: 'Kubernetes',
  icon: Server, // or custom icon
  category: 'infrastructure',
  color: CATEGORY_COLORS['infrastructure'],
}
```

### 2. Add Mermaid shape:

```typescript
// In mermaidExport.ts
Kubernetes: (id, label) => `${id}[/${label}/]`,
```

### 3. Add metadata fields:

```typescript
// In PropertyPanel.tsx
case 'infrastructure':
  return [
    { key: 'cluster', label: 'Cluster Name', placeholder: 'my-cluster' },
    { key: 'namespace', label: 'Namespace', placeholder: 'default' },
  ];
```

## Testing Your Node

1. Run the development server: `npm run dev`
2. Find your node in the sidebar under its category
3. Drag it onto the canvas
4. Connect it to other nodes
5. Export and verify the Mermaid syntax at [mermaid.live](https://mermaid.live)

## Icons

We use [Lucide React](https://lucide.dev/icons/) for icons. Browse available icons at lucide.dev and import them as needed.

```typescript
import { Cloud, Database, Server } from 'lucide-react';
```
