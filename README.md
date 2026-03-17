# SnipChat - Installation rapide (FiveM)

Guide court pour lancer la ressource sur un serveur FiveM avec lb-phone.

## 1) Prerequis

- lb-phone installé
- oxmysql recommander
- Node.js installé (pour build l'UI)

## 2) Build de l'UI
cd ./ui/
Depuis le dossier ui:

npm install
npm run build

## 3) Base de donnees

Importe le fichier server/schema.sql dans ta base SQL.

## 4) Passer en mode production

Dans fxmanifest.lua, utilise la ligne:

ui_page "ui/dist/index.html"

Et commente la ligne localhost si presente:

-- ui_page "http://localhost:3000/"

## 5) server.cfg

Ordre conseille:

ensure oxmysql
ensure lb-phone
ensure SnipChat

## 6) Test rapide

- Redemarre la ressource
- Ouvre le telephone en jeu
- Ouvre SnipChat
- Cree un compte, puis verifie chats/amis

Si tout est bon, build ui, importer le SQL et ensure la ressource.
