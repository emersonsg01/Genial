#!/bin/bash
# Script de setup completo para Genial Calculator

set -e

echo "🔧 Genial Calculator - Setup Completo"
echo "====================================="
echo ""

echo "1️⃣  Instalando dependências..."
npm install

echo ""
echo "2️⃣  Executando testes..."
npm run test -- --run

echo ""
echo "✅ Setup completo!"
echo ""
echo "Próximos passos:"
echo "  • Rodar servidor: npm run dev"
echo "  • Acessar: http://localhost:5173/"
echo "  • Ver mais: cat SETUP.md"
