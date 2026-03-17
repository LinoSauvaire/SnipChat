fx_version "cerulean"
game "gta5"
lua54 "yes"

title "LB Phone - App Template | React TS"
description "A template for creating apps for the LB Phone."
author "Breze & Loaf"

shared_script "config.lua"
client_script "client/**.lua"
server_script "server/**.lua"

file "ui/dist/**/*"

-- ui_page "ui/dist/index.html"
ui_page "http://localhost:3000/"
