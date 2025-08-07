<script setup lang="ts">
import { RouterView } from 'vue-router'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const route = useRoute()
const { isAuthenticated } = useAuth()

const shouldUseLayout = computed(() => {
  const noLayoutPages = ['home', 'login', 'register', 'about']
  return isAuthenticated.value && !noLayoutPages.includes(route.name as string)
})
</script>

<template>
  <DefaultLayout v-if="shouldUseLayout">
    <RouterView />
  </DefaultLayout>
  
  <v-app v-else>
    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>
