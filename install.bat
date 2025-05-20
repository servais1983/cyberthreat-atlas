@echo off
setlocal enabledelayedexpansion

echo ===================================================================
echo      Installation et demarrage de CyberThreat Atlas
echo ===================================================================

rem Vérifier si Node.js est installé
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js n'est pas installe. Veuillez installer Node.js v18 ou superieur.
    exit /b 1
)

rem Vérification MongoDB
echo.
echo Verification de MongoDB...
echo Note: Assurez-vous que MongoDB est installe et en cours d'execution.
echo.

rem Installation du backend
echo Installation des dependances backend...
cd backend || exit /b 1
call npm install

rem Création du fichier .env
if not exist .env (
    echo Creation du fichier .env a partir du modele...
    copy .env.example .env
    echo Veuillez modifier le fichier .env selon vos besoins avant de lancer l'application.
)

rem Revenir au répertoire racine
cd ..

rem Installation du frontend
echo.
echo Installation des dependances frontend...
cd frontend || exit /b 1
call npm install
cd ..

echo.
echo ===================================================================
echo               Installation terminee avec succes !
echo ===================================================================
echo.
echo Pour demarrer l'application, executez les commandes suivantes dans deux fenetres CMD differentes :
echo.
echo Fenetre 1 (backend) :
echo cd backend ^&^& npm run dev
echo.
echo Fenetre 2 (frontend) :
echo cd frontend ^&^& npm start
echo.
echo L'application sera accessible a l'adresse : http://localhost:3000
echo.
echo ===================================================================

rem Proposer de lancer l'application
set /p choice=Voulez-vous lancer l'application maintenant ? (o/n) : 
if /i "%choice%"=="o" goto startApp
if /i "%choice%"=="oui" goto startApp
goto end

:startApp
echo Lancement du backend...
start cmd /k "cd backend && npm run dev"

echo Lancement du frontend...
start cmd /k "cd frontend && npm start"

echo L'application est en cours de demarrage...
echo Les fenetres de commande vont s'ouvrir pour le backend et le frontend.

:end
echo.
echo Installation terminee.
exit /b 0