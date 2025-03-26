# Extract Color Script

This script leverages the `@byted-tiktok/fly-color-wasm-lib` for efficient color processing to find dominant colors.

Fly-Color(FC) is a palette extraction algorithm written by duanhaohao@bytedance.com, which is also used in TUX framework. [More on this algorithm](https://bytedance.feishu.cn/docx/doxcnrNE4xQok9DV4L0E2T8BUJc)

## Environment

- must use node version >= 18
- pnpm: >=8 <9

## Installation

Ensure you have the following dependencies installed:

```bash
pnpm install -D @byted-tiktok/fly-color-wasm-lib sharp canvas
```

Run the script with tsx (must be on node >= 18):

```bash
npx tsx index.ts
or
pnpm i -g tsx
tsx index.ts
```

## Usage

The script provides several ways to extract colors:

1. **From URL**:

```typescript
import { extractFromUrl } from "./index";

const primaryColor = await extractFromUrl("https://example.com/image.jpg");
```

2. **From Local File**:

```typescript
import { extractFromFile } from "./index";

const colors = await extractFromFile("./path/to/image.jpg");
```

3. **With Custom Options**:

```typescript
import { ColorExtractor } from "./index";

const result = await ColorExtractor.extractColors("./image.jpg", {
  mergingTolerance: 0.2,
  cLeft: 0.1,
  cRight: 0.5,
});
```

## Configuration Options

The color extraction can be customized with the following options:

| Option            | Default | Description                                |
| ----------------- | ------- | ------------------------------------------ |
| mergingTolerance  | 0       | Tolerance level for merging similar colors |
| lightnessAddition | 0       | Adjustment for color lightness             |
| cLeft             | 0       | Left boundary for color space              |
| cRight            | 0.4     | Right boundary for color space             |
| iLeft             | 0       | Left intensity boundary                    |
| iRight            | 1       | Right intensity boundary                   |
| strategyThreshold | 0       | Threshold for color extraction strategy    |

## Return Value

The color extraction functions return an object with two arrays:

- `colors`: Array of hexadecimal color values
- `frequencies`: Array of corresponding frequency values for each color
