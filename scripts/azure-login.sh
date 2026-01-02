#!/bin/bash

# Script para autenticarse en Azure CLI y configurar la suscripción
# Uso: ./scripts/azure-login.sh

set -e

echo "🔐 Azure CLI Login Helper"
echo "=========================="
echo ""

# Verificar si Azure CLI está instalado
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI no está instalado."
    echo "📥 Instálalo con: brew install azure-cli (macOS) o visita: https://aka.ms/InstallAzureCLI"
    exit 1
fi

echo "✅ Azure CLI encontrado: $(az --version | head -n 1)"
echo ""

# Intentar login
echo "🔑 Iniciando sesión en Azure..."
echo "   Se abrirá una ventana del navegador para autenticarte."
echo ""

az login

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Login exitoso!"
    echo ""
    
    # Listar suscripciones disponibles
    echo "📋 Suscripciones disponibles:"
    echo ""
    az account list --output table
    
    echo ""
    echo "💡 Para seleccionar una suscripción específica, usa:"
    echo "   az account set --subscription \"<subscription-id>\""
    echo ""
    
    # Mostrar suscripción actual
    echo "📌 Suscripción actual:"
    az account show --output table
    
    echo ""
    echo "✅ Configuración completada!"
    echo ""
    echo "📊 Próximos pasos:"
    echo "   1. Ejecuta: ./scripts/azure-audit.sh para revisar recursos y costos"
    echo "   2. Revisa: docs/AZURE_COST_OPTIMIZATION.md para recomendaciones"
    
else
    echo "❌ Error al iniciar sesión. Intenta nuevamente."
    exit 1
fi

