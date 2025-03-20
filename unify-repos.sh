#!/bin/bash

# Script para unificar los repositorios de git en uno solo

# Crear un directorio temporal
TEMP_DIR="temp_unificacion"
mkdir -p $TEMP_DIR

# Clonar el repositorio principal en el directorio temporal
echo "Creando un nuevo repositorio unificado..."
cd $TEMP_DIR
git init

# Crear estructura de directorios
mkdir -p frontend backend

# Copiar archivos del frontend 
echo "Copiando archivos del frontend..."
cp -r ../frontend/* frontend/

# Copiar archivos del backend/gestionador
echo "Copiando archivos del backend/gestionador..."
cp -r ../backend/* backend/
# Si el repositorio gestionador contiene archivos en la raíz que quieras preservar
# puedes copiarlos a la raíz del nuevo repositorio
cp -r ../*.sh ./

# Copiar archivos de configuración
cp ../nginx-config.conf ./

# Crear .gitignore global
cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log
yarn-error.log
.pnp
.pnp.js

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build directories
build/
dist/
coverage/

# IDEs and editors
.idea/
.vscode/
*.swp
*.swo
.DS_Store
EOF

# Crear README para el repositorio unificado
cat > README.md << EOF
# Gestionador - Aplicación Unificada

Este repositorio contiene tanto el frontend como el backend de la aplicación Gestionador.

## Estructura del repositorio

- \`/frontend\`: Código del frontend
- \`/backend\`: Código del backend
- \`/*.sh\`: Scripts de despliegue

## Despliegue

Para desplegar la aplicación en un servidor:

1. Clona este repositorio en tu máquina local
2. Ejecuta \`./deploy-from-git.sh <usuario>\` donde \`<usuario>\` es tu nombre de usuario SSH en el servidor

## Configuración

La aplicación está configurada para funcionar con:
- MongoDB como base de datos
- Node.js para el backend
- React para el frontend
EOF

# Agregar y hacer commit de todos los archivos
git add .
git commit -m "Unificación inicial de los repositorios frontend y backend"

echo "Repositorio unificado creado en el directorio '$TEMP_DIR'."
echo "Para completar el proceso:"
echo "1. Crea un nuevo repositorio remoto en GitHub, GitLab, etc."
echo "2. Ejecuta los siguientes comandos:"
echo "   cd $TEMP_DIR"
echo "   git remote add origin <URL_DEL_NUEVO_REPOSITORIO>"
echo "   git push -u origin main"
echo ""
echo "Luego podrás usar el repositorio unificado para despliegues y cambios futuros." 