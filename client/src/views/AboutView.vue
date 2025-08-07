<template>
  <div class="about-page">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" lg="8">
          <div class="text-center mb-8">
            <v-icon icon="mdi-chef-hat" size="96" color="primary" class="mb-4" />
            <h1 class="text-h3 font-weight-bold mb-4">Sobre o ChefiBook</h1>
            <p class="text-h6 text-medium-emphasis">
              Sua plataforma completa para organizar receitas culinárias
            </p>
          </div>

          <v-card elevation="2" class="about-card">
            <v-card-text class="pa-8">
              <div class="about-content">
                <h2 class="text-h4 font-weight-bold mb-4">Nossa Missão</h2>
                <p class="text-body-1 mb-6">
                  O ChefiBook foi criado para simplificar a vida de quem ama cozinhar. 
                  Nossa missão é fornecer uma plataforma intuitiva e moderna onde você 
                  pode organizar, compartilhar e preservar suas receitas favoritas.
                </p>

                <h2 class="text-h4 font-weight-bold mb-4">Recursos</h2>
                <v-list class="mb-6">
                  <v-list-item
                    v-for="feature in features"
                    :key="feature.title"
                    :prepend-icon="feature.icon"
                  >
                    <v-list-item-title class="font-weight-medium">
                      {{ feature.title }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ feature.description }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>

                <h2 class="text-h4 font-weight-bold mb-4">Desenvolvido com</h2>
                <div class="tech-stack">
                  <v-chip
                    v-for="tech in techStack"
                    :key="tech"
                    color="primary"
                    variant="outlined"
                    class="ma-1"
                  >
                    {{ tech }}
                  </v-chip>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const features = ref([
  {
    icon: 'mdi-book-open-page-variant',
    title: 'Organização Inteligente',
    description: 'Organize suas receitas por categorias, ingredientes e tempo de preparo'
  },
  {
    icon: 'mdi-magnify',
    title: 'Busca Avançada',
    description: 'Encontre rapidamente qualquer receita com nossa busca inteligente'
  },
  {
    icon: 'mdi-printer',
    title: 'Impressão Profissional',
    description: 'Imprima suas receitas com formatação limpa e profissional'
  },
  {
    icon: 'mdi-account-group',
    title: 'Compartilhamento',
    description: 'Compartilhe suas receitas favoritas com amigos e família'
  },
  {
    icon: 'mdi-cloud-sync',
    title: 'Sincronização',
    description: 'Acesse suas receitas de qualquer dispositivo, sempre sincronizadas'
  }
])

const techStack = ref([
  'Vue 3',
  'TypeScript',
  'Vuetify',
  'Pinia',
  'SCSS',
  'Vite',
  'Node.js',
  'Fastify',
  'MySQL'
])
</script>

<style lang="scss" scoped>
.about-page {
  padding: $spacing-2xl 0;

  .about-card {
    border-radius: 16px;
  }

  .about-content {
    line-height: 1.6;
  }

  .tech-stack {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xs;
  }
}
</style>
