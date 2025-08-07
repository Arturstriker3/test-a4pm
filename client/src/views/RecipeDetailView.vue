<template>
  <div class="recipe-detail-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <v-container>
        <div class="text-center py-12">
          <v-progress-circular indeterminate color="primary" size="64" />
          <p class="text-h6 mt-4">Carregando receita...</p>
        </div>
      </v-container>
    </div>

    <!-- Recipe Content -->
    <div v-else-if="recipe" class="recipe-content">
      <!-- Hero Section -->
      <div class="recipe-hero">
        <v-container>
          <v-row>
            <v-col cols="12">
              <div class="recipe-hero-content">
                <div class="recipe-breadcrumb mb-4">
                  <v-breadcrumbs
                    :items="breadcrumbItems"
                    class="pa-0"
                  >
                    <template v-slot:divider>
                      <v-icon icon="mdi-chevron-right" size="16" />
                    </template>
                  </v-breadcrumbs>
                </div>

                <h1 class="recipe-title">{{ recipe.nome }}</h1>
                
                <div class="recipe-hero-meta">
                  <v-chip 
                    color="primary" 
                    variant="flat"
                    size="large"
                    class="recipe-category-chip"
                  >
                    <v-icon icon="mdi-tag" start />
                    {{ recipe.categoria_nome }}
                  </v-chip>
                  
                  <div class="recipe-stats">
                    <div class="recipe-stat">
                      <v-icon icon="mdi-clock-outline" color="primary" />
                      <span>{{ recipe.tempo_preparo_minutos }} min</span>
                    </div>
                    <div class="recipe-stat">
                      <v-icon icon="mdi-account-group" color="primary" />
                      <span>{{ recipe.porcoes }} porções</span>
                    </div>
                    <div class="recipe-stat">
                      <v-icon icon="mdi-calendar" color="primary" />
                      <span>{{ formatDate(recipe.criado_em) }}</span>
                    </div>
                  </div>
                </div>

                <div class="recipe-author-info">
                  <v-avatar size="48" color="primary">
                    <v-icon icon="mdi-chef-hat" color="white" />
                  </v-avatar>
                  <div class="author-details">
                    <p class="author-name">Chef {{ recipe.usuario_nome }}</p>
                    <p class="author-subtitle">Criador da receita</p>
                  </div>
                </div>

                <!-- Recipe Actions in Header -->
                <div class="recipe-header-actions">
                  <div class="primary-actions">
                    <v-btn
                      v-if="canEdit"
                      :to="`/recipes/${recipe.id}/edit`"
                      color="white"
                      variant="flat"
                      prepend-icon="mdi-pencil"
                      size="large"
                      class="header-action-btn"
                    >
                      Editar Receita
                    </v-btn>
                    
                    <v-btn
                      @click="printRecipe"
                      color="white"
                      variant="outlined"
                      prepend-icon="mdi-printer"
                      size="large"
                      class="header-action-btn outlined"
                    >
                      Imprimir
                    </v-btn>
                  </div>

                  <div class="secondary-actions">
                    <v-btn
                      @click="toggleFavorite"
                      :color="isFavorite ? 'error' : 'white'"
                      variant="text"
                      :icon="isFavorite ? 'mdi-heart' : 'mdi-heart-outline'"
                      size="large"
                      class="favorite-btn"
                    />
                    
                    <v-btn
                      @click="shareRecipe"
                      color="white"
                      variant="text"
                      icon="mdi-share-variant"
                      size="large"
                    />
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <!-- Recipe Content -->
      <v-container class="recipe-main-content">
        <v-row>
          <!-- Ingredients Section -->
          <v-col cols="12" md="4">
            <div class="ingredients-section">
              <div class="section-header">
                <v-icon icon="mdi-format-list-bulleted" color="primary" size="28" />
                <h2 class="section-title">Ingredientes</h2>
              </div>
              
              <v-card class="ingredients-card" elevation="4">
                <v-card-text class="pa-6">
                  <div class="ingredients-content" v-html="formatIngredients(recipe.ingredientes)"></div>
                </v-card-text>
              </v-card>
            </div>
          </v-col>

          <!-- Instructions Section -->
          <v-col cols="12" md="8">
            <div class="instructions-section">
              <div class="section-header">
                <v-icon icon="mdi-chef-hat" color="primary" size="28" />
                <h2 class="section-title">Modo de Preparo</h2>
              </div>
              
              <v-card class="instructions-card" elevation="4">
                <v-card-text class="pa-6">
                  <div class="instructions-content" v-html="formatInstructions(recipe.modo_preparo)"></div>
                </v-card-text>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Error State -->
    <div v-else class="error-container">
      <v-container>
        <div class="text-center py-12">
          <v-icon icon="mdi-alert-circle" size="96" color="error" class="mb-6" />
          <h2 class="text-h4 font-weight-bold mb-4">Receita não encontrada</h2>
          <p class="text-h6 text-medium-emphasis mb-6">
            A receita que você procura não existe ou foi removida.
          </p>
          <v-btn
            :to="'/recipes'"
            color="primary"
            size="large"
            prepend-icon="mdi-arrow-left"
          >
            Voltar para Receitas
          </v-btn>
        </div>
      </v-container>
    </div>

    <!-- Print Component -->
    <RecipePrint 
      ref="recipePrintRef"
      :recipe="recipe" 
      print-id="printable-recipe"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecipesStore } from '@/stores/recipes'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'
import RecipePrint from '@/components/RecipePrint.vue'

const route = useRoute()
const router = useRouter()
const recipesStore = useRecipesStore()
const { user } = useAuth()
const { success, error } = useNotifications()

const isLoading = ref(true)
const isFavorite = ref(false)
const recipePrintRef = ref<InstanceType<typeof RecipePrint>>()

const recipe = computed(() => recipesStore.currentRecipe)

const canEdit = computed(() => {
  if (!recipe.value || !user.value) return false
  return user.value.nivel_acesso === 'ADMIN' || recipe.value.id_usuarios === user.value.id
})

const breadcrumbItems = computed(() => [
  { title: 'Receitas', to: '/recipes' },
  { title: recipe.value?.nome || 'Receita', disabled: true }
])

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

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

const loadRecipe = async () => {
  isLoading.value = true
  const recipeId = route.params.id as string
  
  try {
    const result = await recipesStore.fetchRecipeById(recipeId)
    if (!result.success) {
      error('Erro', 'Não foi possível carregar a receita')
      router.push('/recipes')
    }
  } catch (err) {
    error('Erro', 'Não foi possível carregar a receita')
    router.push('/recipes')
  } finally {
    isLoading.value = false
  }
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  const message = isFavorite.value ? 'Receita adicionada aos favoritos' : 'Receita removida dos favoritos'
  success('Favoritos', message)
}

const shareRecipe = () => {
  if (navigator.share && recipe.value) {
    navigator.share({
      title: recipe.value.nome,
      text: `Confira esta receita incrível: ${recipe.value.nome}`,
      url: window.location.href,
    })
  } else {
    // Fallback: copiar URL
    navigator.clipboard.writeText(window.location.href)
    success('Link copiado', 'Link da receita copiado para a área de transferência')
  }
}

const printRecipe = () => {
  if (recipePrintRef.value) {
    recipePrintRef.value.printRecipe()
  }
}

onMounted(() => {
  loadRecipe()
})
</script>

<style lang="scss" scoped>
.recipe-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafb 0%, #ffffff 100%);
}

/* Loading & Error States */
.loading-container,
.error-container {
  min-height: 70vh;
  display: flex;
  align-items: center;
}

/* Hero Section */
.recipe-hero {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  color: white;
  padding: 40px 0 60px 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
  }

  .recipe-hero-content {
    position: relative;
    z-index: 1;
  }
}

.recipe-breadcrumb {
  :deep(.v-breadcrumbs) {
    padding: 0;
    
    .v-breadcrumbs__item {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.875rem;
      
      &:last-child {
        color: white;
        font-weight: 500;
      }
    }
    
    .v-breadcrumbs__divider {
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

.recipe-title {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 24px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 960px) {
    font-size: 2.5rem;
  }

  @media (max-width: 600px) {
    font-size: 2rem;
  }
}

.recipe-hero-meta {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;

  @media (min-width: 960px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.recipe-category-chip {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white !important;
  font-weight: 600 !important;
  font-size: 0.9rem !important;
  padding: 8px 16px !important;
  height: auto !important;
}

.recipe-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.recipe-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-weight: 500;
  font-size: 0.9rem;
}

.recipe-author-info {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);

  .author-details {
    .author-name {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
    }

    .author-subtitle {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.8);
      margin: 0;
    }
  }
}

/* Recipe Header Actions */
.recipe-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 16px;
  }

  .primary-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;

    @media (max-width: 600px) {
      width: 100%;
      justify-content: center;
    }
  }

  .secondary-actions {
    display: flex;
    gap: 8px;
  }
}

/* Header Action Buttons */
.header-action-btn {
  border-radius: 12px !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
  color: #4caf50 !important;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease !important;

  &.outlined {
    border: 2px solid rgba(255, 255, 255, 0.8) !important;
    background: rgba(255, 255, 255, 0.1) !important;
    color: white !important;
    
    &:hover {
      background: rgba(255, 255, 255, 0.2) !important;
      border-color: white !important;
    }
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2) !important;
  }

  @media (max-width: 600px) {
    min-width: 120px;
  }
}

.favorite-btn {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  transition: all 0.2s ease !important;

  &:hover {
    transform: scale(1.1);
    background: rgba(255, 255, 255, 0.2) !important;
  }
}

/* Actions Bar - Remove old styles */

/* Main Content */
.recipe-main-content {
  padding-top: 40px;
  padding-bottom: 60px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

/* Cards */
.ingredients-card,
.instructions-card {
  border-radius: 20px !important;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12) !important;
  }
}

.ingredients-section {
  @media (min-width: 960px) {
    position: sticky;
    top: 80px;
    height: fit-content;
  }
}

/* Content Formatting */
:deep(.ingredient-list) {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    position: relative;
    padding: 12px 0 12px 32px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    line-height: 1.6;
    color: #2c3e50;
    font-weight: 500;

    &:last-child {
      border-bottom: none;
    }

    &::before {
      content: '•';
      position: absolute;
      left: 0;
      top: 12px;
      color: #4caf50;
      font-size: 1.2rem;
      font-weight: bold;
    }
  }
}

:deep(.instruction-list) {
  list-style: none;
  counter-reset: step-counter;
  padding: 0;
  margin: 0;

  li {
    position: relative;
    counter-increment: step-counter;
    padding: 20px 0 20px 60px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    line-height: 1.7;
    color: #2c3e50;

    &:last-child {
      border-bottom: none;
    }

    &::before {
      content: counter(step-counter);
      position: absolute;
      left: 0;
      top: 20px;
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #4caf50, #66bb6a);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.9rem;
      box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    }
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .recipe-detail-page {
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }

  .section-title {
    color: #f7fafc;
  }

  .ingredients-card,
  .instructions-card {
    background: #2d3748;
    border-color: rgba(255, 255, 255, 0.1);
  }

  :deep(.ingredient-list li) {
    color: #cbd5e0;
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  :deep(.instruction-list li) {
    color: #cbd5e0;
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
}

/* Mobile Responsiveness */
@media (max-width: 960px) {
  .recipe-hero {
    padding: 24px 0 40px 0;
  }

  .recipe-main-content {
    padding-top: 24px;
    padding-bottom: 40px;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .ingredients-section {
    margin-bottom: 32px;
  }
}

@media (max-width: 600px) {
  .recipe-stats {
    gap: 12px;
  }

  .recipe-stat {
    padding: 8px 12px;
    font-size: 0.8rem;
  }

  .section-header {
    gap: 8px;
    margin-bottom: 16px;
  }

  :deep(.instruction-list li) {
    padding-left: 50px;

    &::before {
      width: 28px;
      height: 28px;
      font-size: 0.8rem;
    }
  }
}
</style>
