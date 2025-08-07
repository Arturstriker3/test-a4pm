<template>
  <div class="recipes-page">
    <v-container>
      <v-row class="mb-6">
        <v-col cols="12">
          <div class="page-header">
            <h1 class="text-h3 font-weight-bold">Minhas Receitas</h1>
            <p class="text-h6 text-medium-emphasis mb-4">
              Organize e encontre suas receitas favoritas
            </p>
            <v-btn
              :to="'/recipes/create'"
              color="primary"
              size="large"
              prepend-icon="mdi-plus-circle"
            >
              Nova Receita
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <v-row class="mb-6">
        <v-col cols="12" md="8">
          <v-text-field
            v-model="searchQuery"
            label="Buscar receitas..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            clearable
            @input="handleSearch"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="selectedCategory"
            :items="categoryItems"
            label="Filtrar por categoria"
            variant="outlined"
            clearable
            @update:model-value="handleCategoryFilter"
          />
        </v-col>
      </v-row>

      <div v-if="isLoading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="text-h6 mt-4">Carregando receitas...</p>
      </div>

      <div v-else-if="recipes.length === 0" class="text-center py-12">
        <v-icon icon="mdi-chef-hat" size="96" color="grey" class="mb-6" />
        <h2 class="text-h4 font-weight-bold mb-4">
          Nenhuma receita encontrada
        </h2>
        <p class="text-h6 text-medium-emphasis mb-6">
          {{ searchQuery ? 'Tente uma busca diferente' : 'Comece criando sua primeira receita!' }}
        </p>
        <v-btn
          v-if="!searchQuery"
          :to="'/recipes/create'"
          color="primary"
          size="large"
          prepend-icon="mdi-plus-circle"
        >
          Criar primeira receita
        </v-btn>
      </div>

      <v-row v-else>
        <v-col
          cols="12"
          sm="6"
          lg="4"
          v-for="recipe in recipes"
          :key="recipe.id"
        >
          <v-card class="recipe-card" elevation="2" hover>
            <v-card-text class="pa-4">
              <div class="recipe-header mb-3">
                <h3 class="text-h6 font-weight-medium">{{ recipe.nome }}</h3>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-dots-vertical"
                      size="small"
                      variant="text"
                    />
                  </template>
                  <v-list>
                    <v-list-item @click="editRecipe(recipe.id)">
                      <v-list-item-title>
                        <v-icon icon="mdi-pencil" class="mr-2" />
                        Editar
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="deleteRecipe(recipe.id)">
                      <v-list-item-title class="text-error">
                        <v-icon icon="mdi-delete" class="mr-2" />
                        Excluir
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>

              <div class="recipe-meta mb-3">
                <v-chip size="small" color="primary" class="mr-2">
                  {{ recipe.categoria_nome }}
                </v-chip>
                <div class="recipe-info">
                  <span class="text-caption text-medium-emphasis">
                    <v-icon icon="mdi-clock-outline" size="16" class="mr-1" />
                    {{ recipe.tempo_preparo }} min
                  </span>
                  <span class="text-caption text-medium-emphasis ml-3">
                    <v-icon icon="mdi-account-group" size="16" class="mr-1" />
                    {{ recipe.porcoes }} porções
                  </span>
                </div>
              </div>

              <p class="text-body-2 text-medium-emphasis recipe-preview">
                {{ recipe.ingredientes.substring(0, 120) }}...
              </p>

              <div class="recipe-footer mt-3">
                <span class="text-caption text-medium-emphasis">
                  Por {{ recipe.usuario_nome }}
                </span>
              </div>
            </v-card-text>

            <v-card-actions>
              <v-btn
                :to="`/recipes/${recipe.id}`"
                variant="text"
                color="primary"
                prepend-icon="mdi-eye"
              >
                Ver receita
              </v-btn>
              <v-spacer />
              <v-btn
                icon="mdi-heart-outline"
                variant="text"
                color="grey"
                size="small"
              />
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="totalPages > 1" class="mt-8">
        <v-col cols="12" class="text-center">
          <v-pagination
            v-model="currentPage"
            :length="totalPages"
            @update:model-value="handlePageChange"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipesStore } from '@/stores/recipes'
import { useCategoriesStore } from '@/stores/categories'
import { useNotifications } from '@/composables/useNotifications'

const searchQuery = ref('')
const selectedCategory = ref(null)
const currentPage = ref(1)
const itemsPerPage = 12

const recipesStore = useRecipesStore()
const categoriesStore = useCategoriesStore()
const router = useRouter()
const { success, error } = useNotifications()

const recipes = computed(() => recipesStore.recipes)
const isLoading = computed(() => recipesStore.isLoading)
const totalPages = computed(() => recipesStore.pagination.totalPages)

const categoryItems = computed(() => [
  { title: 'Todas as categorias', value: null },
  ...categoriesStore.categories.map(cat => ({
    title: cat.nome,
    value: cat.id
  }))
])

const loadRecipes = async () => {
  await recipesStore.fetchRecipes(currentPage.value, itemsPerPage)
}

const handleSearch = () => {
  currentPage.value = 1
  loadRecipes()
}

const handleCategoryFilter = () => {
  currentPage.value = 1
  loadRecipes()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadRecipes()
}

const editRecipe = (id: string) => {
  router.push(`/recipes/${id}/edit`)
}

const deleteRecipe = async (id: string) => {
  if (confirm('Tem certeza que deseja excluir esta receita?')) {
    const result = await recipesStore.deleteRecipe(id)
    if (result.success) {
      success('Receita excluída', 'A receita foi excluída com sucesso')
      loadRecipes()
    } else {
      error('Erro ao excluir', result.message)
    }
  }
}

onMounted(async () => {
  await Promise.all([
    loadRecipes(),
    categoriesStore.fetchCategories()
  ])
})
</script>

<style lang="scss" scoped>
.recipes-page {
  .page-header {
    text-align: center;
    padding: $spacing-xl 0;
  }

  .recipe-card {
    border-radius: 12px;
    transition: transform 0.2s ease;
    height: 100%;

    &:hover {
      transform: translateY(-4px);
    }
  }

  .recipe-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .recipe-meta {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  .recipe-info {
    display: flex;
    align-items: center;
  }

  .recipe-preview {
    line-height: 1.5;
  }

  .recipe-footer {
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    padding-top: $spacing-sm;
  }
}
</style>
