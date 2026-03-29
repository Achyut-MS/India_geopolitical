# INSTALLATION REQUIRED

Before running the app, you must install the @turf/bbox dependency.

## Quick Install

Open Command Prompt or PowerShell in the project directory and run:

```bash
npm install @turf/bbox
```

## Why is this needed?

The district visibility logic (CHANGE 1) uses @turf/bbox to calculate bounding boxes of state polygons. This determines how many states are fully visible in the viewport, which controls when districts should appear/disappear.

## After Installation

Run the development server:

```bash
npm run dev
```

Then open: http://localhost:5173

## Alternative: Use the Batch Script

Simply double-click `setup-and-test.bat` which will:
1. Install @turf/bbox automatically
2. Build the project
3. Start the dev server

---

## Verification

After installing, you should NOT see any errors like:
- "Cannot find module '@turf/bbox'"
- "Module not found: Error: Can't resolve '@turf/bbox'"

If you see these errors, the installation failed. Try:
```bash
npm cache clean --force
npm install @turf/bbox --save
```
