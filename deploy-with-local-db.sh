#!/bin/bash

# Script todo-en-uno para limpiar, preparar y desplegar la aplicación 
# usando la base de datos local

# Verificar si se proporcionó un usuario
if [ -z "$1" ]; then
  echo "Por favor, proporciona el nombre de usuario para SSH."
  echo "Uso: ./deploy-with-local-db.sh <usuario>"
  exit 1
fi

SSH_USER="$1"
DROPLET_IP="67.205.150.107"

# 1. Exportar la base de datos local
echo "==== PASO 1: Exportando la base de datos local ===="
./export-local-db.sh

if [ $? -ne 0 ]; then
  echo "Error al exportar la base de datos local. Abortando."
  exit 1
fi

# Obtener la ruta del backup local más reciente
LATEST_BACKUP=$(find ./db_backup -name "mongodb_backup_*" -type d | sort -r | head -n 1)

if [ -z "$LATEST_BACKUP" ]; then
  echo "No se encontró el respaldo de la base de datos. Abortando."
  exit 1
fi

echo "Se utilizará el respaldo local: $LATEST_BACKUP"

# Verificar si el respaldo tiene la colección de usuarios
if [ ! -d "$LATEST_BACKUP/gestionador/users" ]; then
  echo "Advertencia: No se encontró la colección 'users' en el respaldo."
  echo "¿Deseas continuar de todos modos? (s/n)"
  read respuesta
  
  if [ "$respuesta" != "s" ] && [ "$respuesta" != "S" ]; then
    echo "Despliegue cancelado."
    exit 1
  fi
  
  echo "Continuando con el despliegue sin la colección de usuarios..."
fi

# 2. Copiar scripts al droplet
echo "==== PASO 2: Copiando scripts al droplet ===="
scp clean-droplet.sh prepare-droplet.sh ${SSH_USER}@${DROPLET_IP}:/tmp/

# 3. Limpiar el droplet
echo "==== PASO 3: Limpiando el droplet ===="
ssh ${SSH_USER}@${DROPLET_IP} "chmod +x /tmp/clean-droplet.sh && sudo /tmp/clean-droplet.sh"

# 4. Preparar el droplet
echo "==== PASO 4: Preparando el droplet ===="
ssh ${SSH_USER}@${DROPLET_IP} "chmod +x /tmp/prepare-droplet.sh && sudo /tmp/prepare-droplet.sh"

# 5. Copiar el respaldo de la base de datos al droplet
echo "==== PASO 5: Copiando respaldo de la base de datos al droplet ===="
ssh ${SSH_USER}@${DROPLET_IP} "sudo mkdir -p /root/backups/local_backup"
echo "Copiando archivos de respaldo..."
scp -r $LATEST_BACKUP/gestionador/* ${SSH_USER}@${DROPLET_IP}:/tmp/local_backup
ssh ${SSH_USER}@${DROPLET_IP} "sudo cp -r /tmp/local_backup /root/backups/"

# 6. Restaurar la base de datos local en el droplet
echo "==== PASO 6: Restaurando la base de datos local en el droplet ===="

# Crear script de restauración mejorado
scp restore-local-db.sh ${SSH_USER}@${DROPLET_IP}:/tmp/

# Ejecutar el script de restauración
ssh ${SSH_USER}@${DROPLET_IP} "chmod +x /tmp/restore-local-db.sh && sudo /tmp/restore-local-db.sh"

# Comprobar si la restauración fue exitosa
RESTORE_RESULT=$?
if [ $RESTORE_RESULT -ne 0 ]; then
  echo "Error al restaurar la base de datos. ¿Deseas continuar con el despliegue? (s/n)"
  read respuesta
  
  if [ "$respuesta" != "s" ] && [ "$respuesta" != "S" ]; then
    echo "Despliegue cancelado."
    exit 1
  fi
  
  echo "Continuando con el despliegue a pesar del error de restauración..."
fi

# 7. Copiar los archivos de la aplicación
echo "==== PASO 7: Copiando archivos de la aplicación ===="
echo "Copiando archivos del frontend..."
rsync -avz --progress frontend/ ${SSH_USER}@${DROPLET_IP}:/var/www/gestionador/frontend/

echo "Copiando archivos del backend..."
rsync -avz --progress backend/ ${SSH_USER}@${DROPLET_IP}:/var/www/gestionador/backend/

# 8. Desplegar la aplicación
echo "==== PASO 8: Desplegando la aplicación ===="
scp deploy-app-with-users.sh ${SSH_USER}@${DROPLET_IP}:/tmp/
ssh ${SSH_USER}@${DROPLET_IP} "chmod +x /tmp/deploy-app-with-users.sh && cd /var/www/gestionador && sudo /tmp/deploy-app-with-users.sh"

# Comprobar si el despliegue fue exitoso
DEPLOY_RESULT=$?
if [ $DEPLOY_RESULT -ne 0 ]; then
  echo "Se encontraron errores durante el despliegue de la aplicación."
  echo "Revisa los logs para más detalles."
else
  echo "Aplicación desplegada correctamente."
fi

# 9. Configurar Nginx
echo "==== PASO 9: Configurando Nginx ===="
scp nginx-config.conf ${SSH_USER}@${DROPLET_IP}:/tmp/
ssh ${SSH_USER}@${DROPLET_IP} "sudo cp /tmp/nginx-config.conf /etc/nginx/sites-available/gestionador && sudo ln -sf /etc/nginx/sites-available/gestionador /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl restart nginx"

echo "==== DESPLIEGUE COMPLETADO ===="
echo "La aplicación está disponible en http://dngbds.online/login"
echo "Los usuarios de tu base de datos local han sido restaurados en el droplet."

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