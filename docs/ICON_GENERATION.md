# Icon Generation for 1P Wallet Extension

This document explains how to update the extension icons when you change the logo.

## Quick Start

1. **Replace the logo**: Update `public/logo.png` with your new logo
2. **Generate icons**: Run `npm run generate-icons`
3. **Build extension**: Run `npm run build`

## Requirements

- Node.js
- Sharp package (installed automatically with `npm install`)

## Icon Sizes Generated

The script generates the following icon files from your `logo.png`:

- `public/icons/icon16.png` - 16x16 pixels (browser toolbar)
- `public/icons/icon48.png` - 48x48 pixels (extension management page)
- `public/icons/icon128.png` - 128x128 pixels (Chrome Web Store)
- `public/icons/icon.svg` - SVG version for scalable use

## Manual Process

If you prefer to generate icons manually:

1. **Install Sharp** (if not already installed):
   ```bash
   npm install --save-dev sharp
   ```

2. **Run the generator**:
   ```bash
   node scripts/generate-icons.js
   ```

## Icon Requirements

- **Format**: PNG with transparent background
- **Source**: High-resolution logo (recommended: 512x512 or larger)
- **Quality**: Sharp, clear design that works at small sizes
- **Style**: Consistent with your brand and pixel-art theme

## Troubleshooting

### "Sharp package not found"
```bash
npm install --save-dev sharp
```

### "logo.png not found"
Make sure your updated logo is saved as `public/logo.png`

### Icons look blurry
- Use a higher resolution source image
- Ensure your logo has crisp, clear edges
- Avoid gradients or fine details that don't scale well

## Chrome Extension Icon Guidelines

- **16x16**: Must be clear and recognizable at small sizes
- **48x48**: Used in extension management and settings
- **128x128**: Used in Chrome Web Store and installation dialogs
- **Background**: Should be transparent or solid color
- **Style**: Should match your app's visual identity

## File Structure

```
public/
├── logo.png          # Source logo (your updated file)
└── icons/
    ├── icon16.png     # Generated 16x16 icon
    ├── icon48.png     # Generated 48x48 icon
    ├── icon128.png    # Generated 128x128 icon
    └── icon.svg       # Generated SVG icon
```

## Integration

The generated icons are automatically referenced in:
- `manifest.json` - Extension configuration
- Chrome Web Store listing
- Browser toolbar and menus
- Extension management pages

Your new icons will be used throughout the Chrome extension ecosystem!
