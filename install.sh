#!/bin/bash

# Script d'installation et lancement rapide pour CyberThreat Atlas
echo "==================================================================="
echo "      Installation et démarrage de CyberThreat Atlas               "
echo "==================================================================="

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "Node.js n'est pas installé. Veuillez installer Node.js v18 ou supérieur."
    exit 1
fi

# Vérifier si MongoDB est installé et lancé
echo "Vérification de MongoDB..."
if ! command -v mongod &> /dev/null; then
    echo "MongoDB n'est pas installé ou n'est pas dans le PATH."
    echo "Veuillez installer MongoDB ou vérifier son installation."
    echo "Puis relancer ce script."
    exit 1
fi

# Installation du backend
echo ""
echo "Installation des dépendances backend..."
cd backend || exit 1
npm install

# Création du fichier .env
if [ ! -f .env ]; then
    echo "Création du fichier .env à partir du modèle..."
    cp .env.example .env
    echo "Veuillez modifier le fichier .env selon vos besoins avant de lancer l'application."
fi

# Revenir au répertoire racine
cd ..

# Installation du frontend
echo ""
echo "Installation des dépendances frontend..."
cd frontend || exit 1
npm install
cd ..

echo ""
echo "==================================================================="
echo "               Installation terminée avec succès !                 "
echo "==================================================================="
echo ""
echo "Pour démarrer l'application, exécutez les commandes suivantes dans deux terminaux différents :"
echo ""
echo "Terminal 1 (backend) :"
echo "cd backend && npm run dev"
echo ""
echo "Terminal 2 (frontend) :"
echo "cd frontend && npm start"
echo ""
echo "L'application sera accessible à l'adresse : http://localhost:3000"
echo ""
echo "==================================================================="

# Proposer de lancer l'application
read -p "Voulez-vous lancer l'application maintenant ? (o/n) : " choice
if [ "$choice" = "o" ] || [ "$choice" = "O" ] || [ "$choice" = "oui" ] || [ "$choice" = "Oui" ]; then
    echo "Lancement du backend..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    echo "Lancement du frontend..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    
    echo "L'application est en cours de démarrage..."
    echo "Pour arrêter, appuyez sur Ctrl+C"
    
    # Attendre l'arrêt
    trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
    wait
fi

exit 0