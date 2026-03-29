@echo off
cd /d "c:\Users\achyu\OneDrive\Desktop\Projects\India_geopolitical"

echo Creating copilot branch...
git checkout -b copilot 2>nul || git checkout copilot

echo Adding files...
git add .

echo Committing...
git commit -m "feat: implement session 2 changes - district visibility, 10-stop heat spectrum, legend update, CM photos" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

echo Pushing to origin/copilot...
git push -u origin copilot

echo Done!
pause
