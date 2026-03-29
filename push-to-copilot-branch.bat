@echo off
echo ========================================
echo BHARAT LENS - Git Branch Creation
echo Creating "copilot" branch and pushing
echo ========================================
echo.

echo [Step 1/6] Checking current branch...
git branch --show-current
echo.

echo [Step 2/6] Creating new branch "copilot"...
git checkout -b copilot
if %errorlevel% neq 0 (
    echo ERROR: Failed to create branch
    echo Branch might already exist. Switching to it...
    git checkout copilot
)
echo.

echo [Step 3/6] Checking git status...
git status
echo.

echo [Step 4/6] Adding all modified files...
git add .
echo.

echo [Step 5/6] Committing changes...
git commit -m "feat: implement session 2 changes - district visibility, 10-stop heat spectrum, legend update, CM photos" -m "CHANGE 1: Smart District Border Visibility (Zoom-Aware Logic)" -m "- Added fullyVisibleStateCount to Zustand store" -m "- Implemented dual-condition visibility gate (state count + zoom fallback)" -m "- Districts show only when < 4 full states visible" -m "- Smooth fade transitions with opacity control" -m "- Console logging for development debugging" -m "" -m "CHANGE 2: Full Heat Color Spectrum (10-stop gradient system)" -m "- Created 10-stop perceptual gradient (ice blue -> crisis violet)" -m "- Replaced 3-bucket system with continuous 0-100 score mapping" -m "- Added special override colors (Election Blue, Disputed Purple)" -m "- Enhanced state border glow effects" -m "- Updated all color expressions to use new spectrum" -m "" -m "CHANGE 3: Legend Component Update" -m "- Redesigned legend with horizontal 10-stop gradient bar" -m "- Added key score threshold labels (0, 50, 100)" -m "- Created special states section for Election/Disputed colors" -m "- Implemented hover interactions on gradient stops" -m "" -m "CHANGE 4: Representative Photos in State Panel" -m "- Created RepresentativeAvatar component with photo/initials fallback" -m "- Implemented initials avatars with party-colored backgrounds" -m "- Added circle-cropped photo display with heat-colored borders" -m "- Implemented CM badge, shimmer loading, Hindi name support" -m "- Created representatives.json seed data" -m "" -m "Files Modified:" -m "- src/types/index.ts" -m "- src/store/useStore.ts" -m "- src/components/Map/BharatMap.tsx" -m "- src/components/Legend/Legend.tsx" -m "- src/components/Panels/StatePanel.tsx" -m "- src/utils/mapStyles.ts" -m "- src/styles/map.css" -m "- src/styles/panels.css" -m "- src/data/representatives.json (new)" -m "" -m "Dependencies Added:" -m "- @turf/bbox (required for district visibility logic)" -m "" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

if %errorlevel% neq 0 (
    echo ERROR: Commit failed
    pause
    exit /b 1
)
echo.

echo [Step 6/6] Pushing to remote "copilot" branch...
git push -u origin copilot
if %errorlevel% neq 0 (
    echo ERROR: Push failed
    echo Please check your git remote configuration
    pause
    exit /b 1
)
echo.

echo ========================================
echo SUCCESS!
echo ========================================
echo.
echo Branch "copilot" has been created and pushed to remote.
echo Your main branch remains unchanged.
echo.
echo To view your changes on GitHub:
echo 1. Go to your repository
echo 2. Switch to the "copilot" branch
echo 3. You can now create a Pull Request if desired
echo.

pause
