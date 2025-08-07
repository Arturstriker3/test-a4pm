<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar 
      app 
      color="primary" 
      dark 
      :elevation="2"
    >
      <v-app-bar-title>
        <v-icon icon="mdi-chef-hat" class="mr-2" />
        Sistema de Receitas
      </v-app-bar-title>

      <v-spacer />

      <!-- User Menu -->
      <template v-if="isAuthenticated">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              :prepend-icon="user?.nivel_acesso === 'ADMIN' ? 'mdi-crown' : 'mdi-account'"
              variant="text"
            >
              {{ user?.nome }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="$router.push('/profile')">
              <v-list-item-title>
                <v-icon icon="mdi-account" class="mr-2" />
                Perfil
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="logout">
              <v-list-item-title>
                <v-icon icon="mdi-logout" class="mr-2" />
                Sair
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <!-- Login Button -->
      <template v-else>
        <v-btn 
          :to="'/login'"
          prepend-icon="mdi-login"
          variant="text"
        >
          Entrar
        </v-btn>
      </template>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-if="isAuthenticated"
      app
      :rail="rail"
      @click="rail = false"
    >
      <v-list>
        <!-- Toggle Rail -->
        <v-list-item
          @click="rail = !rail"
          class="px-2"
        >
          <template v-slot:prepend>
            <v-icon :icon="rail ? 'mdi-menu' : 'mdi-menu-open'" />
          </template>
          <v-list-item-title v-if="!rail">Menu</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <!-- Navigation Items -->
        <v-list-item
          :to="'/'"
          prepend-icon="mdi-home"
          title="Início"
          value="home"
        />
        
        <v-list-item
          :to="'/recipes'"
          prepend-icon="mdi-book-open-page-variant"
          title="Receitas"
          value="recipes"
        />
        
        <v-list-item
          :to="'/recipes/create'"
          prepend-icon="mdi-plus-circle"
          title="Nova Receita"
          value="create-recipe"
        />

        <!-- Admin Only -->
        <template v-if="isAdmin">
          <v-divider class="my-2" />
          <v-list-subheader v-if="!rail">Administração</v-list-subheader>
          
          <v-list-item
            :to="'/categories'"
            prepend-icon="mdi-tag-multiple"
            title="Categorias"
            value="categories"
          />
          
          <v-list-item
            :to="'/users'"
            prepend-icon="mdi-account-group"
            title="Usuários"
            value="users"
          />
        </template>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>

    <!-- Notifications -->
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

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'

// State
const rail = ref(false)

// Composables
const { user, isAuthenticated, isAdmin, logout } = useAuth()
const { notifications, remove: removeNotification } = useNotifications()
</script>
