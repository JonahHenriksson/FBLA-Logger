@echo OFF
echo Running SASS
call sass ./style/sass:./style/css --style=compressed
echo Running Electron
call electron .