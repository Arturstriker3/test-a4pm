<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar 
      app 
      color="primary" 
      dark 
      :elevation="2"
      sticky
    >
      <!-- Menu Button (Mobile and Desktop) -->
      <v-app-bar-nav-icon
        v-if="isAuthenticated"
        @click="toggleSidebar"
      />

      <v-app-bar-title class="cursor-pointer">
        <v-icon icon="mdi-chef-hat" :class="$vuetify.display.mobile ? '' : 'mr-2'" />
        <span v-if="!$vuetify.display.mobile">Chefibook</span>
      </v-app-bar-title>

      <v-spacer />

      <!-- User Menu -->
      <template v-if="isAuthenticated">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
            >
              <template v-if="$vuetify.display.mobile">
                <v-icon :icon="user?.nivel_acesso === 'ADMIN' ? 'mdi-crown' : 'mdi-account'" />
              </template>
              <template v-else>
                <v-icon :icon="user?.nivel_acesso === 'ADMIN' ? 'mdi-crown' : 'mdi-account'" class="mr-2" />
                {{ user?.nome }}
              </template>
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

    <!-- Navigation Drawer - Desktop Only -->
    <v-navigation-drawer
      v-if="isAuthenticated && !isMobile"
      v-model="sidebarOpen"
      app
      :rail="railMode"
      disable-resize-watcher
      @click="railMode = false"
    >
      <v-list>
        <!-- Toggle Rail (Desktop Only) -->
        <!-- <v-list-item
          @click="toggleRail"
          class="px-2"
        >
          <template v-slot:prepend>
            <v-icon :icon="railMode ? 'mdi-menu' : 'mdi-menu-open'" />
          </template>
        <v-list-item-title v-if="!railMode" class="sidebar-section-title">Navegação</v-list-item-title>
        </v-list-item> -->

        <!-- <v-divider class="my-2" /> -->

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
          <v-list-subheader v-if="!railMode">Administração</v-list-subheader>
          
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

    <!-- Custom Mobile Sidebar -->
    <div v-if="isAuthenticated && isMobile">
      <!-- Overlay -->
      <div 
        v-if="sidebarOpen"
        class="mobile-sidebar-overlay"
        @click="closeSidebar"
      />
      
      <!-- Sidebar -->
      <div 
        class="mobile-sidebar"
        :class="{ 'mobile-sidebar--open': sidebarOpen }"
      >
        <div class="mobile-sidebar__content">
          <div class="mobile-sidebar__header">
            <div class="mobile-sidebar__header-left">
              <v-icon icon="mdi-chef-hat" color="white" size="32" />
              <h3 class="mobile-sidebar__title">Chefibook</h3>
            </div>
            <v-btn
              icon="mdi-close"
              variant="text"
              color="white"
              size="small"
              @click="closeSidebar"
              class="mobile-sidebar__close-btn"
            />
          </div>
          
          <v-list class="mobile-sidebar__list">
            <v-list-item
              :to="'/'"
              prepend-icon="mdi-home"
              title="Início"
              @click="closeSidebar"
            />
            
            <v-list-item
              :to="'/recipes'"
              prepend-icon="mdi-book-open-page-variant"
              title="Receitas"
              @click="closeSidebar"
            />
            
            <v-list-item
              :to="'/recipes/create'"
              prepend-icon="mdi-plus-circle"
              title="Nova Receita"
              @click="closeSidebar"
            />

            <!-- Admin Only -->
            <template v-if="isAdmin">
              <v-divider class="my-2" />
              <v-list-subheader>Administração</v-list-subheader>
              
              <v-list-item
                :to="'/categories'"
                prepend-icon="mdi-tag-multiple"
                title="Categorias"
                @click="closeSidebar"
              />
              
              <v-list-item
                :to="'/users'"
                prepend-icon="mdi-account-group"
                title="Usuários"
                @click="closeSidebar"
              />
            </template>
          </v-list>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <v-main>
      <div class="content-wrapper">
        <router-view />
      </div>
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
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'
import { useSidebar } from '@/composables/useSidebar'

// Composables
const route = useRoute()
const { user, isAuthenticated, isAdmin, logout } = useAuth()
const { notifications, remove: removeNotification } = useNotifications()
const { 
  sidebarOpen, 
  railMode, 
  isMobile, 
  toggleSidebar, 
  closeSidebar, 
  toggleRail, 
  handleNavigation,
  initializeSidebar 
} = useSidebar()

// Initialize sidebar based on screen size
onMounted(() => {
  initializeSidebar()
})

// Watch for route changes to close drawer on mobile
watch(() => route.path, () => {
  handleNavigation()
})
</script>

<style scoped>
/* Simple scroll fix */
.content-wrapper {
  padding: 24px;
}

/* Mobile Sidebar Styles */
.cursor-pointer {
  cursor: pointer;
}

.v-app-bar {
  z-index: 1001 !important;
}

/* Desktop Sidebar Styles */
.sidebar-section-title {
  font-weight: 600 !important;
color: var(--v-theme-primary) !important;
  font-size: 0.875rem !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Custom Mobile Sidebar */
.mobile-sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  transition: opacity 0.3s ease;
}

.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  background-color: white;
  z-index: 1001;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.mobile-sidebar--open {
  transform: translateX(0);
}

.mobile-sidebar__content {
  height: 100%;
  overflow-y: auto;
  padding: 0;
}

.mobile-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mobile-sidebar__header-left {
  display: flex;
  align-items: center;
}

.mobile-sidebar__close-btn {
  opacity: 0.9;
  transition: opacity 0.2s ease;
}

.mobile-sidebar__close-btn:hover {
  opacity: 1;
}

.mobile-sidebar__title {
  color: white;
  font-weight: 600;
  font-size: 1.25rem;
  margin: 0;
  margin-left: 12px;
  line-height: 32px;
  display: flex;
  align-items: center;
  height: 32px;
}

.mobile-sidebar__list {
  padding: 16px 0;
  flex: 1;
}

.mobile-sidebar__list .v-list-item {
  padding: 12px 24px;
  min-height: 56px;
  border-radius: 0;
}

.mobile-sidebar__list .v-list-item:hover {
  background-color: #f5f5f5;
}

.mobile-sidebar__list .v-list-item--active {
  background-color: #e3f2fd;
  color: #1976d2;
}

.mobile-sidebar__list .v-list-item-title {
  font-size: 1.1rem;
  font-weight: 500;
}

/* Mobile adjustments */
@media (max-width: 599px) {
  .v-app-bar-title {
    font-size: 1.1rem !important;
  }
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .mobile-sidebar {
    background-color: #1e1e1e;
    color: white;
  }
  
  .mobile-sidebar__header {
    background: linear-gradient(135deg, #388e3c, #4caf50);
  }
  
  .mobile-sidebar__list .v-list-item:hover {
    background-color: #2d2d2d;
  }
  
  .mobile-sidebar__list .v-list-item--active {
    background-color: #1565c0;
    color: white;
  }
}
</style>
