<template>
  <v-card 
    class="recipe-card" 
    elevation="2" 
    hover
    :class="{ 'recipe-card--compact': compact }"
  >
    <v-card-text class="pa-4">
      <div class="recipe-header mb-3">
        <h3 class="recipe-title">{{ recipe.nome }}</h3>
        <v-menu v-if="showActions">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-dots-vertical"
              size="small"
              variant="text"
              class="recipe-menu-btn"
            />
          </template>
          <v-list>
            <v-list-item @click="$emit('edit', recipe.id)">
              <v-list-item-title>
                <v-icon icon="mdi-pencil" class="mr-2" />
                Editar
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="$emit('delete', recipe.id)">
              <v-list-item-title class="text-error">
                <v-icon icon="mdi-delete" class="mr-2" />
                Excluir
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <div class="recipe-meta mb-3">
        <v-chip 
          size="small" 
          color="primary" 
          class="recipe-category-chip"
          variant="flat"
        >
          {{ recipe.categoria_nome }}
        </v-chip>
        <div class="recipe-info">
          <span class="recipe-info-item">
            <v-icon icon="mdi-clock-outline" size="16" class="mr-1" />
            {{ recipe.tempo_preparo_minutos }} min
          </span>
          <span class="recipe-info-item">
            <v-icon icon="mdi-account-group" size="16" class="mr-1" />
            {{ recipe.porcoes }} porções
          </span>
        </div>
      </div>

      <p class="recipe-preview" v-if="!compact">
        {{ truncateText(recipe.ingredientes, 120) }}
      </p>

      <div class="recipe-footer mt-3" v-if="showAuthor">
        <span class="recipe-author">
          Por {{ recipe.usuario_nome }}
        </span>
      </div>
    </v-card-text>

    <v-card-actions class="recipe-actions">
      <v-btn
        :to="`/recipes/${recipe.id}`"
        variant="text"
        color="primary"
        prepend-icon="mdi-eye"
        class="recipe-view-btn"
      >
        Ver receita
      </v-btn>
      <v-spacer />
      <v-btn
        icon="mdi-heart-outline"
        variant="text"
        color="grey"
        size="small"
        class="recipe-favorite-btn"
        @click="$emit('toggleFavorite', recipe.id)"
      />
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { Recipe } from '@/types'

interface Props {
  recipe: Recipe
  compact?: boolean
  showActions?: boolean
  showAuthor?: boolean
}

interface Emits {
  (e: 'edit', recipeId: string): void
  (e: 'delete', recipeId: string): void
  (e: 'toggleFavorite', recipeId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  showActions: true,
  showAuthor: true
})

const emit = defineEmits<Emits>()

const truncateText = (text: string, maxLength: number): string => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>

<style lang="scss" scoped>
.recipe-card {
  border-radius: 16px !important;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  height: 100%;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border: 1px solid rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12) !important;
    border-color: rgba(76, 175, 80, 0.2);
  }

  &--compact {
    .recipe-title {
      font-size: 1.1rem;
    }
    
    .recipe-meta {
      margin-bottom: 8px;
    }
  }
}

.recipe-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.recipe-title {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.3;
  color: #1a202c;
  margin: 0;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.recipe-menu-btn {
  opacity: 0.7;
  transition: opacity 0.2s ease;
  flex-shrink: 0;

  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.04) !important;
  }
}

.recipe-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recipe-category-chip {
  align-self: flex-start;
  font-weight: 500 !important;
  border-radius: 8px !important;
  background: linear-gradient(135deg, #4caf50, #66bb6a) !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.recipe-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.recipe-info-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
  
  .v-icon {
    color: #94a3b8;
  }
}

.recipe-preview {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #64748b;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

.recipe-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 12px;
  margin-top: 16px !important;
}

.recipe-author {
  font-size: 0.8125rem;
  color: #94a3b8;
  font-weight: 500;
}

.recipe-actions {
  padding: 16px 20px 20px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%);
}

.recipe-view-btn {
  border-radius: 10px !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
  color: #4caf50 !important;
  background-color: rgba(76, 175, 80, 0.08) !important;
  transition: all 0.2s ease !important;

  &:hover {
    background-color: rgba(76, 175, 80, 0.12) !important;
    transform: translateY(-1px);
  }
}

.recipe-favorite-btn {
  border-radius: 8px !important;
  transition: all 0.2s ease;
  
  &:hover {
    color: #f56565 !important;
    background-color: rgba(245, 101, 101, 0.08) !important;
    transform: scale(1.1);
  }
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .recipe-card {
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
    border-color: rgba(255, 255, 255, 0.1);

    &:hover {
      border-color: rgba(76, 175, 80, 0.3);
    }
  }

  .recipe-title {
    color: #f7fafc;
  }

  .recipe-preview {
    color: #cbd5e0;
  }

  .recipe-author {
    color: #a0aec0;
  }

  .recipe-footer {
    border-top-color: rgba(255, 255, 255, 0.1);
  }

  .recipe-actions {
    background: linear-gradient(135deg, rgba(45, 55, 72, 0.8) 0%, rgba(26, 32, 44, 0.9) 100%);
    border-top-color: rgba(255, 255, 255, 0.1);
  }
}

/* Mobile responsiveness */
@media (max-width: 599px) {
  .recipe-card {
    border-radius: 12px !important;
  }

  .recipe-title {
    font-size: 1.1rem;
  }

  .recipe-info {
    gap: 12px;
  }

  .recipe-info-item {
    font-size: 0.8125rem;
  }

  .recipe-actions {
    padding: 12px 16px 16px 16px;
  }
}
</style>
