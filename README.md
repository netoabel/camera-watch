# camera-watch

A Node.js module that monitors webcam usage state on Linux and macOS systems.

## Installation

```bash
npm install camera-watch
```

## Usage

```typescript
import { watch } from "camera-watch";

watch({
  device: "video0", // optional, defaults to 'video0' on Linux; not required on macOS.
  onChange: (state) => {
    console.log("Camera state:", state);
    // On Linux: 'On' or 'Off'
    // On macOS: Power state from VDCAssistant
  },
  onError: (error) => {
    console.error("Error:", error);
  },
});
```

## Platform Support

- **Linux**: Monitors camera usage by watching device access using `lsof`
- **macOS**: Monitors camera state by watching VDCAssistant power state logs

## License

MIT
