#!/bin/bash

# Script para desplegar la aplicación desde un repositorio Git

# Verificar si se proporcionaron los parámetros necesarios
if [ $# -lt 1 ]; then
  echo "Uso: $0 <usuario_ssh> [url_repositorio]"
  echo "Ejemplo: $0 root https://github.com/usuario/gestionador.git"
  exit 1
fi

SSH_USER="$1"
DROPLET_IP="67.205.150.107"
GIT_REPO="${2:-https://github.com/tu-usuario/gestionador.git}"
BRANCH="${3:-main}"

echo "Se usará el repositorio: $GIT_REPO (rama: $BRANCH)"

# 1. Preparar scripts para enviar al servidor
echo "==== PASO 1: Preparando scripts de despliegue ===="

# Crear script para clonar y configurar el repositorio en el servidor
cat > git-deploy-server.sh << 'EOF'
#!/bin/bash

# Este script se ejecutará en el servidor para clonar y configurar la aplicación

GIT_REPO="$1"
BRANCH="$2"
APP_DIR="/var/www/gestionador"

echo "Clonando repositorio $GIT_REPO (rama: $BRANCH) en $APP_DIR..."

# Verificar si el directorio existe y eliminarlo
if [ -d "$APP_DIR" ]; then
  echo "Eliminando instalación anterior..."
  sudo rm -rf $APP_DIR
fi

# Clonar el repositorio en el directorio de la aplicación
sudo mkdir -p $APP_DIR
sudo git clone -b $BRANCH $GIT_REPO $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Configurar variables de entorno para el backend
cat > $APP_DIR/backend/.env << EOT
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://localhost:27017/gestionador
JWT_SECRET=your_secret_key_change_in_production
JWT_EXPIRATION=1d
FILE_STORAGE_PATH=uploads/
EOT

# Instalar dependencias y construir el backend
cd $APP_DIR/backend
npm install

# Intentar construir el backend
if grep -q "\"build\"" package.json; then
  echo "Ejecutando build del backend..."
  npm run build
fi

# Determinar el archivo principal para el backend
if [ -f "dist/index.js" ]; then
  MAIN_FILE="dist/index.js"
elif grep -q "\"main\"" package.json; then
  MAIN_FILE=$(grep -o '"main":\s*"[^"]*"' package.json | cut -d'"' -f4)
elif [ -f "index.js" ]; then
  MAIN_FILE="index.js"
else
  echo "No se pudo determinar el archivo principal del backend"
  exit 1
fi

# Iniciar el backend con PM2
echo "Iniciando backend con PM2 usando el archivo: $MAIN_FILE"
pm2 delete gestionador-backend 2>/dev/null || true
pm2 start $MAIN_FILE --name gestionador-backend

# Instalar dependencias y construir el frontend
cd $APP_DIR/frontend
npm install
npm run build

# Guardar configuración de PM2
pm2 save

echo "Aplicación desplegada desde Git exitosamente"
EOF

# Crear script para instalar dependencias si no están presentes
cat > install-dependencies.sh << 'EOF'
#!/bin/bash

# Actualizar el sistema
echo "Actualizando el sistema..."
sudo apt update
sudo apt upgrade -y

# Instalar Node.js y npm (versión 18)
if ! command -v node &> /dev/null; then
  echo "Instalando Node.js 18 y npm..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt install -y nodejs
else
  echo "Node.js ya está instalado:"
  node -v
fi

# Instalar MongoDB si no está instalado
if ! command -v mongod &> /dev/null; then
  echo "Instalando MongoDB..."
  wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
  echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
  sudo apt update
  sudo apt install -y mongodb-org mongodb-clients
  sudo systemctl start mongod
  sudo systemctl enable mongod
else
  echo "MongoDB ya está instalado"
fi

# Instalar Nginx si no está instalado
if ! command -v nginx &> /dev/null; then
  echo "Instalando Nginx..."
  sudo apt install -y nginx
  sudo systemctl start nginx
  sudo systemctl enable nginx
else
  echo "Nginx ya está instalado"
fi

# Instalar PM2 si no está instalado
if ! command -v pm2 &> /dev/null; then
  echo "Instalando PM2..."
  sudo npm install -g pm2
else
  echo "PM2 ya está instalado"
fi

# Configurar firewall
echo "Configurando firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Instalar Git si no está instalado
if ! command -v git &> /dev/null; then
  echo "Instalando Git..."
  sudo apt install -y git
else
  echo "Git ya está instalado"
fi

echo "Todas las dependencias han sido instaladas"
EOF

# Crear configuración de Nginx
cat > nginx-config.conf << 'EOF'
server {
    listen 80;
    server_name 67.205.150.107 dngbds.online www.dngbds.online;

    # Frontend
    location / {
        root /var/www/gestionador/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 2. Copiar scripts al servidor
echo "==== PASO 2: Copiando scripts al servidor ===="
scp git-deploy-server.sh install-dependencies.sh nginx-config.conf ${SSH_USER}@${DROPLET_IP}:/tmp/

# 3. Instalar dependencias en el servidor
echo "==== PASO 3: Instalando dependencias en el servidor ===="
ssh ${SSH_USER}@${DROPLET_IP} "chmod +x /tmp/install-dependencies.sh && sudo /tmp/install-dependencies.sh"

# 4. Desplegar desde Git
echo "==== PASO 4: Desplegando aplicación desde Git ===="
ssh ${SSH_USER}@${DROPLET_IP} "chmod +x /tmp/git-deploy-server.sh && /tmp/git-deploy-server.sh '$GIT_REPO' '$BRANCH'"

# 5. Configurar Nginx
echo "==== PASO 5: Configurando Nginx ===="
ssh ${SSH_USER}@${DROPLET_IP} "sudo cp /tmp/nginx-config.conf /etc/nginx/sites-available/gestionador && sudo ln -sf /etc/nginx/sites-available/gestionador /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl restart nginx"

echo "==== DESPLIEGUE DESDE GIT COMPLETADO ===="
echo "La aplicación está disponible en http://dngbds.online/login"

# Sugerir verificación manual
echo ""
echo "Sugerencias para verificar la instalación:"
echo "1. Accede a http://dngbds.online/login para verificar que la aplicación está funcionando."
echo "2. Si tienes problemas, conecta al droplet con: ssh ${SSH_USER}@${DROPLET_IP}"
echo "3. Verifica el estado de los servicios con:"
echo "   - sudo systemctl status nginx"
echo "   - sudo systemctl status mongod"
echo "   - pm2 status"
echo "4. Revisa los logs de la aplicación con: pm2 logs" 