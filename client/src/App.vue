<script setup lang="ts">
import { RouterView } from 'vue-router'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const route = useRoute()
const { isAuthenticated } = useAuth()
const { notifications, remove: removeNotification } = useNotifications()

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
    
    <!-- Notifications for non-layout pages -->
    <v-snackbar
      v-for="notification in notifications"
      :key="notification.id"
      :model-value="true"
      :color="notification.type"
      :timeout="notification.duration"
      location="top right"
      @update:model-value="removeNotification(notification.id)"
    >
      <v-icon icon="mdi-information" class="mr-2" />
      <strong>{{ notification.title }}</strong>
      <div v-if="notification.message" class="text-caption">
        {{ notification.message }}
      </div>
      
      <template v-slot:actions>
        <v-btn
          icon="mdi-close"
          size="small"
          @click="removeNotification(notification.id)"
        />
      </template>
    </v-snackbar>
  </v-app>
</template>
