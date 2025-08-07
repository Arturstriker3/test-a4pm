<template>
  <div class="create-recipe-page">
    <v-container>
      <v-row class="mb-6">
        <v-col cols="12">
          <div class="page-header">
            <!-- <v-btn
              :to="'/recipes'"
              icon="mdi-arrow-left"
              variant="text"
              size="small"
              class="mb-3"
            /> -->
            <h1 class="text-h3 font-weight-bold mb-2">Nova Receita</h1>
            <p class="text-h6 text-medium-emphasis">
              Compartilhe sua receita especial com todos
            </p>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="8" lg="6" class="mx-auto">
          <v-card elevation="2" class="recipe-form-card">
            <v-card-text class="pa-8">
              <v-form ref="formRef" @submit.prevent="handleSubmit">
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="formData.nome"
                      label="Nome da Receita"
                      placeholder="Ex: Bolo de Chocolate"
                      variant="outlined"
                      :rules="nameRules"
                      :loading="isLoading"
                      prepend-inner-icon="mdi-chef-hat"
                      required
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="formData.id_categorias"
                      :items="categories"
                      item-title="nome"
                      item-value="id"
                      label="Categoria"
                      variant="outlined"
                      :rules="categoryRules"
                      :loading="categoriesStore.isLoading"
                      prepend-inner-icon="mdi-tag"
                      required
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model.number="formData.tempo_preparo_minutos"
                      label="Tempo de Preparo (minutos)"
                      placeholder="Ex: 45"
                      variant="outlined"
                      type="number"
                      :rules="timeRules"
                      :loading="isLoading"
                      prepend-inner-icon="mdi-clock-outline"
                      min="1"
                      max="1440"
                      required
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model.number="formData.porcoes"
                      label="Número de Porções"
                      placeholder="Ex: 8"
                      variant="outlined"
                      type="number"
                      :rules="portionRules"
                      :loading="isLoading"
                      prepend-inner-icon="mdi-account-group"
                      min="1"
                      max="100"
                      required
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="formData.ingredientes"
                      label="Ingredientes"
                      placeholder="Ex: 2 xícaras de farinha de trigo&#10;1 xícara de açúcar&#10;3 ovos&#10;200ml de leite"
                      variant="outlined"
                      :rules="ingredientsRules"
                      :loading="isLoading"
                      prepend-inner-icon="mdi-format-list-bulleted"
                      rows="6"
                      auto-grow
                      counter="2000"
                      required
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="formData.modo_preparo"
                      label="Modo de Preparo"
                      placeholder="Ex: 1. Pré-aqueça o forno a 180°C&#10;2. Em uma tigela, misture os ingredientes secos&#10;3. Adicione os ovos e o leite..."
                      variant="outlined"
                      :rules="preparationRules"
                      :loading="isLoading"
                      prepend-inner-icon="mdi-format-list-numbered"
                      rows="8"
                      auto-grow
                      counter="3000"
                      required
                    />
                  </v-col>
                </v-row>

                <v-row class="mt-6">
                  <v-col cols="12" class="text-center">
                    <v-btn
                      :to="'/recipes'"
                      variant="outlined"
                      size="large"
                      class="mr-4"
                      :disabled="isLoading"
                    >
                      Cancelar
                    </v-btn>
                    <v-btn
                      type="submit"
                      color="primary"
                      size="large"
                      :loading="isLoading"
                      :disabled="!isFormValid"
                      prepend-icon="mdi-content-save"
                    >
                      Salvar Receita
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
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
import type { CreateRecipeData } from '@/types'

const router = useRouter()
const recipesStore = useRecipesStore()
const categoriesStore = useCategoriesStore()
const { add: addNotification } = useNotifications()

const formRef = ref()
const isLoading = ref(false)

const formData = ref<CreateRecipeData>({
  nome: '',
  ingredientes: '',
  modo_preparo: '',
  tempo_preparo_minutos: 30,
  porcoes: 4,
  id_categorias: ''
})

const categories = computed(() => categoriesStore.categories)

const isFormValid = computed(() => {
  return formData.value.nome.trim() && 
         formData.value.ingredientes.trim() && 
         formData.value.modo_preparo.trim() &&
         formData.value.id_categorias &&
         formData.value.tempo_preparo_minutos > 0 &&
         formData.value.porcoes > 0
})

const nameRules = [
  (v: string) => !!v || 'Nome da receita é obrigatório',
  (v: string) => (v && v.length >= 3) || 'Nome deve ter pelo menos 3 caracteres',
  (v: string) => (v && v.length <= 100) || 'Nome deve ter no máximo 100 caracteres',
]

const categoryRules = [
  (v: string) => !!v || 'Categoria é obrigatória',
]

const timeRules = [
  (v: number) => !!v || 'Tempo de preparo é obrigatório',
  (v: number) => (v && v > 0) || 'Tempo deve ser maior que 0',
  (v: number) => (v && v <= 1440) || 'Tempo não pode exceder 24 horas (1440 minutos)',
]

const portionRules = [
  (v: number) => !!v || 'Número de porções é obrigatório',
  (v: number) => (v && v > 0) || 'Deve ser maior que 0',
  (v: number) => (v && v <= 100) || 'Não pode exceder 100 porções',
]

const ingredientsRules = [
  (v: string) => !!v || 'Ingredientes são obrigatórios',
  (v: string) => (v && v.length >= 10) || 'Descreva os ingredientes com mais detalhes',
  (v: string) => (v && v.length <= 2000) || 'Máximo de 2000 caracteres',
]

const preparationRules = [
  (v: string) => !!v || 'Modo de preparo é obrigatório',
  (v: string) => (v && v.length >= 20) || 'Descreva o modo de preparo com mais detalhes',
  (v: string) => (v && v.length <= 3000) || 'Máximo de 3000 caracteres',
]

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  
  if (!valid) {
    addNotification({
      type: 'error',
      title: 'Erro no formulário',
      message: 'Por favor, corrija os campos destacados'
    })
    return
  }

  isLoading.value = true

  try {
    const result = await recipesStore.createRecipe(formData.value)
    
    if (result.success) {
      addNotification({
        type: 'success',
        title: 'Receita criada!',
        message: 'Sua receita foi salva com sucesso'
      })
      
      router.push('/recipes')
    } else {
      addNotification({
        type: 'error',
        title: 'Erro ao criar receita',
        message: result.message || 'Erro desconhecido'
      })
    }
  } catch (error) {
    addNotification({
      type: 'error',
      title: 'Erro inesperado',
      message: 'Ocorreu um erro ao salvar a receita'
    })
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  // Carrega as categorias
  if (categoriesStore.categories.length === 0) {
    const result = await categoriesStore.fetchCategories()
    
    if (!result.success) {
      addNotification({
        type: 'warning',
        title: 'Atenção',
        message: 'Não foi possível carregar as categorias'
      })
    }
  }
})
</script>

<style lang="scss" scoped>
.create-recipe-page {
  .page-header {
    text-align: center;
    padding: $spacing-lg 0;

    @include mobile {
      text-align: left;
      padding: $spacing-md 0;
    }
  }

  .recipe-form-card {
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);

    @include mobile {
      margin: 0 -8px;
      border-radius: 0;
      box-shadow: none;
    }
  }

  .text-h3 {
    @include mobile {
      font-size: 1.75rem !important;
    }
  }

  .text-h6 {
    @include mobile {
      font-size: 1.125rem !important;
    }
  }
}

// Form specific styles
:deep(.v-field) {
  border-radius: 12px;
}

:deep(.v-btn) {
  border-radius: 8px;
  text-transform: none;
  font-weight: 600;
}

// Mobile adjustments
@media (max-width: 599px) {
  .create-recipe-page {
    .v-container {
      padding-left: 8px;
      padding-right: 8px;
    }
    
    .recipe-form-card .v-card-text {
      padding: 24px 16px !important;
    }

    // Ajustes dos botões para mobile
    .v-row:last-child .v-col {
      display: flex;
      flex-direction: column;
      gap: 12px;
      
      .v-btn {
        width: 100%;
        margin: 0 !important;
      }
    }
  }
}
</style>
