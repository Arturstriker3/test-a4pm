<template>
  <div class="not-found-page">
    <v-container class="fill-height">
      <v-row align="center" justify="center" class="fill-height">
        <v-col cols="12" sm="8" md="6" lg="4">
          <div class="text-center">
            <div class="error-icon mb-6">
              <v-icon icon="mdi-alert-circle-outline" size="120" color="grey-darken-1" />
            </div>
            
            <h1 class="error-code">404</h1>
            
            <h2 class="error-message mb-4">
              Oops! Página não encontrada
            </h2>
            
            <p class="error-description mb-6">
              A página que você está procurando não existe ou foi movida.
            </p>
            
            <div class="error-actions">
              <v-btn
                :to="'/'"
                color="primary"
                size="large"
                class="mr-4 mb-2"
                prepend-icon="mdi-home"
              >
                Voltar ao início
              </v-btn>
              
              <v-btn
                @click="goBack"
                variant="outlined"
                size="large"
                class="mb-2"
                prepend-icon="mdi-arrow-left"
              >
                Voltar
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { onMounted } from 'vue'

const router = useRouter()
const route = useRoute()

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

onMounted(() => {
  console.error(
    '404 Error: User attempted to access non-existent route:',
    route.fullPath
  )
})
</script>

<style lang="scss" scoped>
.not-found-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-icon {
  opacity: 0.6;
}

.error-code {
  font-size: 6rem;
  font-weight: 900;
  color: $text-primary;
  line-height: 1;
  margin-bottom: $spacing-md;
  
  @include mobile {
    font-size: 4rem;
  }
}

.error-message {
  font-size: 1.5rem;
  font-weight: 600;
  color: $text-primary;
  
  @include mobile {
    font-size: 1.25rem;
  }
}

.error-description {
  font-size: 1rem;
  color: $text-secondary;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto;
}

.error-actions {
  @include mobile {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }
}
</style>
