#!/bin/bash

# Script para identificar y eliminar recursos no utilizados
# Uso: ./scripts/azure-cleanup.sh [--dry-run] [--force]
# 
# --dry-run: Solo muestra qué se eliminaría sin hacerlo
# --force: Elimina sin confirmación (¡CUIDADO!)

set -e

DRY_RUN=false
FORCE=false

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        *)
            echo "Uso: $0 [--dry-run] [--force]"
            exit 1
            ;;
    esac
done

echo "🧹 Azure Resource Cleanup"
echo "========================="
echo ""

if [ "$DRY_RUN" = true ]; then
    echo "🔍 MODO DRY-RUN: Solo mostrando recursos (no se eliminará nada)"
    echo ""
fi

# Verificar autenticación
if ! az account show &> /dev/null; then
    echo "❌ No estás autenticado en Azure."
    echo "🔐 Ejecuta primero: ./scripts/azure-login.sh"
    exit 1
fi

SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
echo "📌 Suscripción: $SUBSCRIPTION_NAME"
echo ""

# Listar grupos de recursos
RESOURCE_GROUPS=$(az group list --query "[].name" -o tsv)

echo "📦 Grupos de recursos encontrados:"
for RG in $RESOURCE_GROUPS; do
    RESOURCE_COUNT=$(az resource list --resource-group "$RG" --query "length(@)" -o tsv)
    echo "   - $RG ($RESOURCE_COUNT recursos)"
done
echo ""

# Identificar recursos potencialmente no utilizados
echo "🔍 Buscando recursos potencialmente no utilizados..."
echo ""

CLEANUP_CANDIDATES=()

# 1. Container Apps detenidas
echo "📦 Container Apps:"
for RG in $RESOURCE_GROUPS; do
    STOPPED_APPS=$(az containerapp list --resource-group "$RG" --query "[?properties.runningStatus!='Running'].name" -o tsv 2>/dev/null || echo "")
    if [ ! -z "$STOPPED_APPS" ]; then
        for APP in $STOPPED_APPS; do
            echo "   ⚠️  Container App detenida: $APP (en $RG)"
            CLEANUP_CANDIDATES+=("containerapp:$RG:$APP")
        done
    fi
done
echo ""

# 2. Storage Accounts vacíos o sin uso
echo "💾 Storage Accounts:"
for RG in $RESOURCE_GROUPS; do
    STORAGE_ACCOUNTS=$(az storage account list --resource-group "$RG" --query "[].name" -o tsv 2>/dev/null || echo "")
    if [ ! -z "$STORAGE_ACCOUNTS" ]; then
        for SA in $STORAGE_ACCOUNTS; do
            # Verificar si tiene contenedores
            CONTAINER_COUNT=$(az storage container list --account-name "$SA" --auth-mode login --query "length(@)" -o tsv 2>/dev/null || echo "0")
            if [ "$CONTAINER_COUNT" = "0" ]; then
                echo "   ⚠️  Storage Account vacío: $SA (en $RG)"
                CLEANUP_CANDIDATES+=("storage:$RG:$SA")
            fi
        done
    fi
done
echo ""

# 3. Resource Groups vacíos
echo "📁 Resource Groups vacíos:"
for RG in $RESOURCE_GROUPS; do
    RESOURCE_COUNT=$(az resource list --resource-group "$RG" --query "length(@)" -o tsv)
    if [ "$RESOURCE_COUNT" = "0" ]; then
        echo "   ⚠️  Resource Group vacío: $RG"
        CLEANUP_CANDIDATES+=("resourcegroup:$RG:")
    fi
done
echo ""

# 4. Container Registries sin imágenes recientes
echo "🐳 Container Registries:"
for RG in $RESOURCE_GROUPS; do
    REGISTRIES=$(az acr list --resource-group "$RG" --query "[].name" -o tsv 2>/dev/null || echo "")
    if [ ! -z "$REGISTRIES" ]; then
        for REG in $REGISTRIES; do
            REPO_COUNT=$(az acr repository list --name "$REG" --query "length(@)" -o tsv 2>/dev/null || echo "0")
            if [ "$REPO_COUNT" = "0" ]; then
                echo "   ⚠️  Container Registry sin repositorios: $REG (en $RG)"
                CLEANUP_CANDIDATES+=("acr:$RG:$REG")
            fi
        done
    fi
done
echo ""

# Resumen
if [ ${#CLEANUP_CANDIDATES[@]} -eq 0 ]; then
    echo "✅ No se encontraron recursos obviamente no utilizados."
    echo "   Revisa manualmente en el portal de Azure."
else
    echo "📋 RESUMEN DE RECURSOS PARA ELIMINAR"
    echo "===================================="
    echo ""
    echo "Se encontraron ${#CLEANUP_CANDIDATES[@]} recursos candidatos para eliminación:"
    echo ""
    
    for CANDIDATE in "${CLEANUP_CANDIDATES[@]}"; do
        IFS=':' read -r TYPE RG NAME <<< "$CANDIDATE"
        echo "   - [$TYPE] $NAME (en $RG)"
    done
    echo ""
    
    if [ "$DRY_RUN" = true ]; then
        echo "🔍 DRY-RUN: No se eliminó nada."
        echo "   Para eliminar estos recursos, ejecuta sin --dry-run"
    else
        if [ "$FORCE" = false ]; then
            echo "⚠️  ¿Deseas eliminar estos recursos? (s/N)"
            read -r CONFIRM
            if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
                echo "❌ Operación cancelada."
                exit 0
            fi
        fi
        
        echo "🗑️  Eliminando recursos..."
        echo ""
        
        for CANDIDATE in "${CLEANUP_CANDIDATES[@]}"; do
            IFS=':' read -r TYPE RG NAME <<< "$CANDIDATE"
            
            case $TYPE in
                containerapp)
                    echo "   Eliminando Container App: $NAME..."
                    az containerapp delete --name "$NAME" --resource-group "$RG" --yes 2>/dev/null || echo "     ⚠️  Error al eliminar $NAME"
                    ;;
                storage)
                    echo "   Eliminando Storage Account: $NAME..."
                    az storage account delete --name "$NAME" --resource-group "$RG" --yes 2>/dev/null || echo "     ⚠️  Error al eliminar $NAME"
                    ;;
                acr)
                    echo "   Eliminando Container Registry: $NAME..."
                    az acr delete --name "$NAME" --resource-group "$RG" --yes 2>/dev/null || echo "     ⚠️  Error al eliminar $NAME"
                    ;;
                resourcegroup)
                    echo "   Eliminando Resource Group: $RG..."
                    az group delete --name "$RG" --yes --no-wait 2>/dev/null || echo "     ⚠️  Error al eliminar $RG"
                    ;;
            esac
        done
        
        echo ""
        echo "✅ Limpieza completada!"
    fi
fi

echo ""
echo "💡 Consejos:"
echo "   - Revisa siempre los recursos antes de eliminarlos"
echo "   - Usa --dry-run primero para ver qué se eliminaría"
echo "   - Algunos recursos pueden tener dependencias que impidan su eliminación"
echo ""

