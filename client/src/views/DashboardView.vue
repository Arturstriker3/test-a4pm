<template>
  <div class="dashboard-page">
    <v-container>
      <v-row class="mb-8">
        <v-col cols="12">
          <div class="welcome-header">
            <h1 class="text-h3 font-weight-bold mb-2">
              Olá, {{ user?.nome }}!
            </h1>
            <p class="text-h6 text-medium-emphasis">
              Bem-vindo de volta ao seu ChefBook
            </p>
          </div>
        </v-col>
      </v-row>

      <v-row class="mb-8">
        <v-col cols="12" sm="6" md="3" v-for="stat in stats" :key="stat.title">
          <v-card class="stat-card" elevation="2">
            <v-card-text class="text-center pa-6">
              <div class="stat-icon mb-4" :class="stat.iconClass">
                <v-icon :icon="stat.icon" size="32" color="white" />
              </div>
              <h3 class="text-h4 font-weight-bold mb-2">{{ stat.value }}</h3>
              <p class="text-body-2 text-medium-emphasis">{{ stat.title }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mb-8">
        <v-col cols="12">
          <h2 class="text-h4 font-weight-bold mb-4">Ações Rápidas</h2>
          <div class="quick-actions">
            <v-btn
              :to="'/recipes/create'"
              color="primary"
              size="large"
              prepend-icon="mdi-plus-circle"
              class="mr-4 mb-4"
            >
              Nova Receita
            </v-btn>
            <v-btn
              :to="'/recipes'"
              color="secondary"
              size="large"
              prepend-icon="mdi-book-open-page-variant"
              class="mr-4 mb-4"
            >
              Ver Receitas
            </v-btn>
            <v-btn
              :to="'/categories'"
              variant="outlined"
              size="large"
              prepend-icon="mdi-tag-multiple"
              class="mb-4"
            >
              Categorias
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <h2 class="text-h4 font-weight-bold mb-4">Receitas Recentes</h2>
          <div v-if="isLoading" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" />
          </div>
          <div v-else-if="recentRecipes.length === 0" class="text-center py-8">
            <v-icon icon="mdi-chef-hat" size="64" color="grey" class="mb-4" />
            <h3 class="text-h6 text-medium-emphasis mb-2">
              Nenhuma receita ainda
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Comece criando sua primeira receita!
            </p>
            <v-btn
              :to="'/recipes/create'"
              color="primary"
              prepend-icon="mdi-plus-circle"
            >
              Criar primeira receita
            </v-btn>
          </div>
          <v-row v-else>
            <v-col
              cols="12"
              sm="6"
              md="4"
              v-for="recipe in recentRecipes"
              :key="recipe.id"
            >
              <v-card class="recipe-card" elevation="2" hover>
                <v-card-text class="pa-4">
                  <h4 class="text-h6 font-weight-medium mb-2">
                    {{ recipe.nome }}
                  </h4>
                  <div class="recipe-meta mb-3">
                    <v-chip size="small" color="primary" class="mr-2">
                      {{ recipe.categoria_nome }}
                    </v-chip>
                    <span class="text-caption text-medium-emphasis">
                      {{ recipe.tempo_preparo }} min
                    </span>
                  </div>
                  <p class="text-body-2 text-medium-emphasis recipe-description">
                    {{ recipe.ingredientes.substring(0, 100) }}...
                  </p>
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    :to="`/recipes/${recipe.id}`"
                    variant="text"
                    color="primary"
                  >
                    Ver receita
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRecipesStore } from '@/stores/recipes'
import type { Recipe, StatCard } from '@/types'

const isLoading = ref(false)
const recentRecipes = ref<Recipe[]>([])

const stats = ref<StatCard[]>([
  {
    title: 'Total de Receitas',
    value: '12',
    icon: 'mdi-book-open-page-variant',
    iconClass: 'stat-icon--primary'
  },
  {
    title: 'Categorias',
    value: '5',
    icon: 'mdi-tag-multiple',
    iconClass: 'stat-icon--secondary'
  },
  {
    title: 'Receitas Favoritas',
    value: '8',
    icon: 'mdi-heart',
    iconClass: 'stat-icon--accent'
  },
  {
    title: 'Este Mês',
    value: '3',
    icon: 'mdi-calendar',
    iconClass: 'stat-icon--success'
  }
])

const { user } = useAuth()
const recipesStore = useRecipesStore()

const loadRecentRecipes = async () => {
  isLoading.value = true
  try {
    await recipesStore.fetchRecipes(1, 6)
    recentRecipes.value = recipesStore.recipes.slice(0, 6)
  } catch (error) {
    console.error('Erro ao carregar receitas:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadRecentRecipes()
})
</script>

<style lang="scss" scoped>
.dashboard-page {
  .welcome-header {
    text-align: center;
    padding: $spacing-xl 0;
  }

  .stat-card {
    transition: transform 0.2s ease;
    border-radius: 12px;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .stat-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;

    &--primary {
      background: linear-gradient(135deg, $primary-color, lighten($primary-color, 15%));
    }

    &--secondary {
      background: linear-gradient(135deg, $secondary-color, lighten($secondary-color, 15%));
    }

    &--accent {
      background: linear-gradient(135deg, $accent-color, lighten($accent-color, 15%));
    }

    &--success {
      background: linear-gradient(135deg, $success-color, lighten($success-color, 15%));
    }
  }

  .quick-actions {
    @include mobile {
      display: flex;
      flex-direction: column;
      gap: $spacing-sm;
    }
  }

  .recipe-card {
    border-radius: 12px;
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .recipe-meta {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  .recipe-description {
    line-height: 1.5;
  }
}
</style>
