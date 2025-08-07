<template>
  <div class="login-page">
    <v-container fluid class="fill-height">
      <v-row align="center" justify="center" class="fill-height">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="login-card" elevation="8">
            <v-card-text class="pa-8">
              <div class="text-center mb-8">
                <div class="brand-icon mb-4">
                  <v-icon icon="mdi-chef-hat" size="48" color="primary" />
                </div>
                <h2 class="text-h4 font-weight-bold primary--text mb-2">
                  Bem-vindo de volta!
                </h2>
                <p class="text-body-1 grey--text">
                  Entre na sua conta para acessar suas receitas
                </p>
              </div>

              <v-form @submit.prevent="handleLogin" ref="loginForm">
                <v-text-field
                  v-model="credentials.login"
                  label="Email ou usuário"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  :rules="[rules.required, rules.email]"
                  class="mb-4"
                />

                <v-text-field
                  v-model="credentials.senha"
                  label="Senha"
                  prepend-inner-icon="mdi-lock"
                  :type="showPassword ? 'text' : 'password'"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="showPassword = !showPassword"
                  variant="outlined"
                  :rules="[rules.required]"
                  class="mb-6"
                />

                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  :loading="isLoading"
                  class="mb-4"
                >
                  Entrar
                </v-btn>
              </v-form>

              <v-divider class="my-6" />

              <div class="text-center">
                <p class="text-body-2 grey--text mb-2">
                  Ainda não tem uma conta?
                </p>
                <v-btn
                  :to="'/register'"
                  variant="outlined"
                  color="primary"
                  size="large"
                  block
                >
                  Criar conta
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-snackbar
      v-model="showError"
      color="error"
      :timeout="5000"
      location="top"
    >
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn icon="mdi-close" @click="showError = false" />
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'

// State
const showPassword = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const loginForm = ref()

const credentials = reactive({
  login: '',
  senha: ''
})

// Validation rules
const rules = {
  required: (value: string) => !!value || 'Campo obrigatório',
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || value.includes('@') || 'Email inválido'
  }
}

const { login, isLoading } = useAuth()
const { error } = useNotifications()

const handleLogin = async () => {
  const { valid } = await loginForm.value.validate()
  if (!valid) return

  const result = await login(credentials)
  
  if (!result.success) {
    errorMessage.value = result.message || 'Erro ao fazer login'
    showError.value = true
    error('Erro no login', result.message)
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, lighten($primary-color, 45%) 0%, lighten($secondary-color, 45%) 100%);

  .login-card {
    border-radius: 16px;
    overflow: hidden;
  }

  .brand-icon {
    width: 80px;
    height: 80px;
    background: rgba($primary-color, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
  }
}
</style>
