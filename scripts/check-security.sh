#!/bin/bash

# Script de verificación de seguridad
# Verifica que no haya información sensible en el repositorio

echo "🔒 Verificación de Seguridad del Repositorio"
echo "============================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

# 1. Verificar archivos .env en el repositorio
echo "1. Verificando archivos .env..."
ENV_FILES=$(find . -name ".env*" -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null)
if [ -n "$ENV_FILES" ]; then
    echo -e "${RED}❌ ERROR:${NC} Se encontraron archivos .env en el repositorio:"
    echo "$ENV_FILES"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅${NC} No se encontraron archivos .env"
fi
echo ""

# 2. Verificar archivos con información sensible en el historial
echo "2. Verificando historial de Git..."
SENSITIVE_IN_HISTORY=$(git log --all --full-history --source -- "*secret*" "*password*" "*key*" "*credential*" "*token*" 2>/dev/null | head -20)
if [ -n "$SENSITIVE_IN_HISTORY" ]; then
    echo -e "${YELLOW}⚠️  ADVERTENCIA:${NC} Posible información sensible en el historial de Git"
    echo "Considera usar git-filter-repo para limpiar el historial si es necesario"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅${NC} Historial de Git parece limpio"
fi
echo ""

# 3. Verificar archivos con extensiones de secrets
echo "3. Verificando archivos de credenciales..."
SECRET_FILES=$(find . -type f \( -name "*.pem" -o -name "*.key" -o -name "*.cert" -o -name "*secret*" -o -name "*credential*" \) -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null)
if [ -n "$SECRET_FILES" ]; then
    echo -e "${RED}❌ ERROR:${NC} Se encontraron archivos de credenciales:"
    echo "$SECRET_FILES"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅${NC} No se encontraron archivos de credenciales"
fi
echo ""

# 4. Verificar .gitignore
echo "4. Verificando .gitignore..."
if grep -q "\.env" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✅${NC} .gitignore incluye .env"
else
    echo -e "${RED}❌ ERROR:${NC} .gitignore NO incluye .env"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 5. Verificar headers de copyright en archivos críticos
echo "5. Verificando headers de copyright..."
CRITICAL_FILES=(
    "backend/src/server.ts"
    "backend/src/functions/AnalyticsFunctions.ts"
    "src/services/api.service.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        if head -5 "$file" | grep -q "Copyright\|copyright" 2>/dev/null; then
            echo -e "${GREEN}✅${NC} $file tiene header de copyright"
        else
            echo -e "${YELLOW}⚠️  ADVERTENCIA:${NC} $file no tiene header de copyright"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
done
echo ""

# Resumen
echo "============================================"
echo "Resumen:"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Todo parece estar seguro${NC}"
    exit 0
else
    echo -e "${RED}❌ Errores encontrados: $ERRORS${NC}"
    echo -e "${YELLOW}⚠️  Advertencias: $WARNINGS${NC}"
    exit 1
fi

