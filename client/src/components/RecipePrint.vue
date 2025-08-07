<template>
  <div class="print-layout" :id="printId">
    <div class="print-header">
      <div class="print-logo">
        <v-icon icon="mdi-chef-hat" size="32" />
        <h1>ChefiBook</h1>
      </div>
      <div class="print-date">{{ new Date().toLocaleDateString('pt-BR') }}</div>
    </div>
    
    <div class="print-recipe-content" v-if="recipe">
      <h2 class="print-recipe-title">{{ recipe.nome }}</h2>
      
      <div class="print-meta">
        <span><strong>Categoria:</strong> {{ recipe.categoria_nome }}</span>
        <span><strong>Tempo:</strong> {{ recipe.tempo_preparo_minutos }} minutos</span>
        <span><strong>Porções:</strong> {{ recipe.porcoes }}</span>
        <span><strong>Chef:</strong> {{ recipe.usuario_nome }}</span>
      </div>

      <div class="print-section">
        <h3>Ingredientes</h3>
        <div v-html="formatIngredients(recipe.ingredientes)"></div>
      </div>

      <div class="print-section">
        <h3>Modo de Preparo</h3>
        <div v-html="formatInstructions(recipe.modo_preparo)"></div>
      </div>
    </div>
    
    <div class="print-footer">
      <p>Receita criada com ❤️ no ChefiBook - Seu livro de receitas digital</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Recipe } from '@/types'

interface Props {
  recipe: Recipe | null
  printId?: string
}

const props = withDefaults(defineProps<Props>(), {
  printId: 'printable-recipe'
})

const formatIngredients = (ingredients: string) => {
  if (!ingredients) return ''
  
  // Converte quebras de linha em lista HTML
  const lines = ingredients.split('\n').filter(line => line.trim())
  return '<ul class="ingredient-list">' + 
    lines.map(line => `<li>${line.trim()}</li>`).join('') + 
    '</ul>'
}

const formatInstructions = (instructions: string) => {
  if (!instructions) return ''
  
  // Converte quebras de linha em parágrafos numerados
  const lines = instructions.split('\n').filter(line => line.trim())
  return '<ol class="instruction-list">' + 
    lines.map(line => `<li>${line.trim()}</li>`).join('') + 
    '</ol>'
}

const getPrintStyles = () => `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .print-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 3px solid #4caf50;
    padding-bottom: 20px;
    margin-bottom: 30px;
  }
  
  .print-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #4caf50;
    font-weight: bold;
    font-size: 24px;
  }
  
  .print-date {
    color: #666;
    font-size: 14px;
  }
  
  .print-recipe-title {
    font-size: 28px;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 20px;
    text-align: center;
  }
  
  .print-meta {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 30px;
  }
  
  .print-meta span {
    font-size: 14px;
  }
  
  .print-section {
    margin-bottom: 30px;
    break-inside: avoid;
  }
  
  .print-section h3 {
    color: #4caf50;
    font-size: 20px;
    margin-bottom: 15px;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 5px;
  }
  
  .ingredient-list,
  .instruction-list {
    padding-left: 20px;
  }
  
  .ingredient-list li,
  .instruction-list li {
    margin-bottom: 8px;
    line-height: 1.5;
  }
  
  .print-footer {
    text-align: center;
    margin-top: 50px;
    padding-top: 20px;
    border-top: 1px solid #e0e0e0;
    color: #666;
    font-size: 12px;
  }
  
  @media print {
    .print-header {
      background: #4caf50 !important;
      color: white !important;
      -webkit-print-color-adjust: exact;
    }
    
    .print-logo {
      color: white !important;
    }
  }
`

const printRecipe = () => {
  const printContent = document.getElementById(props.printId)
  if (!printContent || !props.recipe) return

  const printWindow = window.open('', '_blank')
  
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receita - ${props.recipe.nome}</title>
          <style>
            ${getPrintStyles()}
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }
}

// Expor a função de print para o componente pai
defineExpose({
  printRecipe
})
</script>

<style lang="scss" scoped>
/* Print Layout (Hidden by default) */
.print-layout {
  display: none;
  visibility: hidden;
  position: absolute;
  left: -9999px;
  top: -9999px;
}
</style>
