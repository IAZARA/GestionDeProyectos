#!/bin/bash

# Script para exportar la BD local y enviarla al servidor durante el despliegue desde Git

# Verificar si se proporcionó un usuario
if [ -z "$1" ]; then
  echo "Por favor, proporciona el nombre de usuario para SSH."
  echo "Uso: ./db-restore-with-git.sh <usuario>"
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

# 2. Copiar el respaldo de la base de datos al droplet
echo "==== PASO 2: Copiando respaldo de la base de datos al droplet ===="
ssh ${SSH_USER}@${DROPLET_IP} "sudo mkdir -p /root/backups/local_backup"
echo "Copiando archivos de respaldo..."
scp -r $LATEST_BACKUP/gestionador/* ${SSH_USER}@${DROPLET_IP}:/tmp/local_backup
ssh ${SSH_USER}@${DROPLET_IP} "sudo cp -r /tmp/local_backup /root/backups/"

# 3. Crear script de restauración 
cat > restore-db.sh << 'EOF'
#!/bin/bash

# Verificar que MongoDB está instalado e iniciado
if ! systemctl is-active --quiet mongod; then
  echo "MongoDB no está activo. Intentando iniciarlo..."
  sudo systemctl start mongod
  sleep 5
  
  if ! systemctl is-active --quiet mongod; then
    echo "Error: No se pudo iniciar MongoDB. Verifica la instalación."
    exit 1
  fi
  
  echo "MongoDB iniciado correctamente."
fi

BACKUP_PATH="/root/backups/local_backup"

echo "Restaurando la base de datos desde el respaldo..."
sudo mongorestore --db gestionador --drop $BACKUP_PATH

# Verificar el resultado de la restauración
if [ $? -eq 0 ]; then
  echo "Base de datos restaurada exitosamente."
else
  echo "Error al restaurar la base de datos."
  echo "Verifica que los archivos de respaldo son válidos y que MongoDB tiene permisos adecuados."
  exit 1
fi
EOF

# 4. Copiar y ejecutar el script de restauración 
echo "==== PASO 3: Restaurando la base de datos ===="
scp restore-db.sh ${SSH_USER}@${DROPLET_IP}:/tmp/
ssh ${SSH_USER}@${DROPLET_IP} "chmod +x /tmp/restore-db.sh && sudo /tmp/restore-db.sh"

echo "==== PROCESO COMPLETADO ===="
echo "La base de datos local ha sido restaurada en el servidor."
echo "Ahora puedes desplegar la aplicación desde Git utilizando deploy-from-git.sh" 