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

      <div v-else-if="(recipes || []).length === 0" class="text-center py-12">
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
          <RecipeCard
            :recipe="recipe"
            @edit="editRecipe"
            @delete="deleteRecipe"
            @toggle-favorite="toggleFavorite"
          />
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

    <!-- Modal de Confirmação de Exclusão -->
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="Excluir Receita"
      message="Tem certeza que deseja excluir esta receita?"
      description="Esta ação não pode ser desfeita. A receita será permanentemente removida do sistema."
      confirm-text="Sim, Excluir"
      cancel-text="Cancelar"
      type="danger"
      :is-loading="deletingRecipe"
      @confirm="confirmDeleteRecipe"
      @cancel="cancelDeleteRecipe"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipesStore } from '@/stores/recipes'
import { useCategoriesStore } from '@/stores/categories'
import { useNotifications } from '@/composables/useNotifications'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import RecipeCard from '@/components/RecipeCard.vue'

const searchQuery = ref('')
const selectedCategory = ref(null)
const currentPage = ref(1)
const itemsPerPage = 12

// Modal de confirmação
const showDeleteConfirm = ref(false)
const recipeToDelete = ref<string | null>(null)
const deletingRecipe = ref(false)

const recipesStore = useRecipesStore()
const categoriesStore = useCategoriesStore()
const router = useRouter()
const { success, error } = useNotifications()

const recipes = computed(() => recipesStore.recipes || [])
const isLoading = computed(() => {
  return recipesStore.isLoading;
})
const totalPages = computed(() => recipesStore.pagination.totalPages)

const categoryItems = computed(() => [
  { title: 'Todas as categorias', value: null },
  ...(categoriesStore.categories || []).map(cat => ({
    title: cat.nome,
    value: cat.id
  }))
])

const loadRecipes = async () => {
  await recipesStore.fetchRecipes(
    currentPage.value, 
    itemsPerPage, 
    searchQuery.value,
    selectedCategory.value || undefined
  )
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

const deleteRecipe = (id: string) => {
  recipeToDelete.value = id
  showDeleteConfirm.value = true
}

const confirmDeleteRecipe = async () => {
  if (!recipeToDelete.value) return
  
  deletingRecipe.value = true
  const result = await recipesStore.deleteRecipe(recipeToDelete.value)
  
  if (result.success) {
    success('Receita excluída', 'A receita foi excluída com sucesso')
    showDeleteConfirm.value = false
    recipeToDelete.value = null
    loadRecipes()
  } else {
    error('Erro ao excluir', result.message)
  }
  
  deletingRecipe.value = false
}

const cancelDeleteRecipe = () => {
  showDeleteConfirm.value = false
  recipeToDelete.value = null
}

const toggleFavorite = (recipeId: string) => {
  // TODO: Implementar sistema de favoritos
  console.log('Toggle favorite for recipe:', recipeId)
}

onMounted(async () => {
  // Reset do estado do store para evitar problemas de cache
  recipesStore.clearRecipes();
  
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
}
</style>
