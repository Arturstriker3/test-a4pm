<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-overlay" />
      <v-container class="hero-content">
        <v-row align="center" class="fill-height">
          <v-col cols="12" lg="8">
            <div class="hero-text">
              <div class="brand-header">
                <div class="brand-icon">
                  <v-icon icon="mdi-chef-hat" size="48" color="white" />
                </div>
                <h1 class="brand-title">ChefBook</h1>
              </div>

              <h2 class="hero-headline">
                Organize suas receitas de forma simples e elegante
              </h2>

              <p class="hero-description">
                Crie, edite, organize e imprima suas receitas favoritas. 
                Tudo em um só lugar, com uma interface moderna e intuitiva.
              </p>

              <div class="hero-actions">
                <v-btn
                  :to="'/register'"
                  color="accent"
                  size="large"
                  class="mr-4 mb-4"
                  elevation="0"
                >
                  Começar agora
                </v-btn>
                <v-btn
                  :to="'/login'"
                  variant="outlined"
                  color="white"
                  size="large"
                  class="mb-4"
                >
                  Já tenho conta
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="features-section">
      <v-container>
        <div class="features-header">
          <h3 class="features-title">
            Tudo que você precisa para suas receitas
          </h3>
          <p class="features-description">
            Uma plataforma completa para organizar, compartilhar e imprimir suas receitas culinárias
          </p>
        </div>

        <v-row class="features-grid">
          <v-col cols="12" md="4" v-for="feature in features" :key="feature.id">
            <v-card class="feature-card" elevation="2" height="100%">
              <v-card-text class="text-center pa-8">
                <div class="feature-icon" :class="feature.iconClass">
                  <v-icon :icon="feature.icon" size="40" color="white" />
                </div>
                <h4 class="feature-title">{{ feature.title }}</h4>
                <p class="feature-text">{{ feature.description }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="cta-section">
      <v-container>
        <div class="cta-content">
          <h3 class="cta-title">
            Pronto para começar?
          </h3>
          <p class="cta-description">
            Junte-se a milhares de pessoas que já organizam suas receitas com o ChefBook
          </p>
          <div class="cta-buttons">
            <v-btn
              :to="'/register'"
              color="accent"
              size="large"
              class="cta-button"
              elevation="0"
            >
              Criar conta gratuita
            </v-btn>
            <v-btn
              :to="'/about'"
              variant="outlined"
              size="large"
              class="about-button"
              elevation="0"
            >
              Saiba mais sobre o ChefBook
            </v-btn>
          </div>
        </div>
      </v-container>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const features = ref([
  {
    id: 1,
    icon: 'mdi-book-open-page-variant',
    iconClass: 'feature-icon--primary',
    title: 'Organize suas receitas',
    description: 'Crie, edite e organize todas suas receitas em um só lugar. Adicione ingredientes, instruções e categorize como preferir.'
  },
  {
    id: 2,
    icon: 'mdi-account-group',
    iconClass: 'feature-icon--accent',
    title: 'Interface intuitiva',
    description: 'Design moderno e fácil de usar. Encontre rapidamente suas receitas favoritas com busca inteligente e navegação simplificada.'
  },
  {
    id: 3,
    icon: 'mdi-printer',
    iconClass: 'feature-icon--primary',
    title: 'Imprima facilmente',
    description: 'Imprima suas receitas com formatação profissional. Perfeito para levar para a cozinha ou compartilhar com amigos.'
  }
])
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
}

.hero-section {
  position: relative;
  height: 100vh;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  background-image: url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80');
  background-size: cover;
  background-position: center;
  background-blend-mode: overlay;
  display: flex;
  align-items: center;

  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.9) 0%, rgba(102, 187, 106, 0.7) 100%);
  }

  .hero-content {
    position: relative;
    z-index: 2;
    height: 100%;
  }

  .hero-text {
    color: white;
  }

  .brand-header {
    display: flex;
    align-items: center;
    margin-bottom: $spacing-xl;

    .brand-icon {
      width: 64px;
      height: 64px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: $spacing-md;
    }

    .brand-title {
      font-size: 3.5rem;
      font-weight: 700;
      margin: 0;
      
      @include mobile {
        font-size: 2.5rem;
      }
    }
  }

  .hero-headline {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: $spacing-lg;
    
    @include mobile {
      font-size: 2rem;
    }
  }

  .hero-description {
    font-size: 1.25rem;
    line-height: 1.6;
    margin-bottom: $spacing-2xl;
    opacity: 0.95;
    max-width: 600px;
    
    @include mobile {
      font-size: 1.1rem;
    }
  }

  .hero-actions {
    @include mobile {
      display: flex;
      flex-direction: column;
      gap: $spacing-md;
    }
  }
}

.features-section {
  padding: $spacing-2xl * 2 0;
  background: rgba(245, 245, 245, 0.5);

  .features-header {
    text-align: center;
    margin-bottom: $spacing-2xl * 2;

    .features-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: $text-primary;
      margin-bottom: $spacing-md;
      
      @include mobile {
        font-size: 2rem;
      }
    }

    .features-description {
      font-size: 1.25rem;
      color: $text-secondary;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }
  }

  .features-grid {
    margin-top: $spacing-2xl;
  }

  .feature-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border-radius: 12px;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
    }
  }

  .feature-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto $spacing-lg;

    &--primary {
      background: linear-gradient(135deg, $primary-color, lighten($primary-color, 15%));
    }

    &--accent {
      background: linear-gradient(135deg, $accent-color, lighten($accent-color, 15%));
    }
  }

  .feature-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: $spacing-md;
  }

  .feature-text {
    font-size: 1rem;
    color: $text-secondary;
    line-height: 1.6;
    margin: 0;
  }
}

// CTA Section
.cta-section {
  padding: $spacing-2xl * 2 0;
  background: linear-gradient(135deg, $primary-color 0%, lighten($primary-color, 10%) 100%);
  color: white;

  .cta-content {
    text-align: center;
  }

  .cta-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: $spacing-md;
    
    @include mobile {
      font-size: 2rem;
    }
  }

  .cta-description {
    font-size: 1.25rem;
    opacity: 0.95;
    max-width: 500px;
    margin: 0 auto $spacing-2xl;
    line-height: 1.6;
  }

  .cta-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-md;
    
    @include tablet {
      flex-direction: row;
      justify-content: center;
    }
  }

  .cta-button {
    padding: $spacing-md $spacing-xl;
    font-size: 1.1rem;
    font-weight: 600;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 200px;
  }

  .about-button {
    padding: $spacing-md $spacing-xl;
    font-size: 1rem;
    font-weight: 500;
    border-color: rgba(255, 255, 255, 0.7);
    color: white;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 200px;
    
    &:hover {
      border-color: white;
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
