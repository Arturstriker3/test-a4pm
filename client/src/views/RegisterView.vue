<template>
  <div class="register-page">
    <v-container fluid class="fill-height">
      <v-row align="center" justify="center" class="fill-height">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="register-card" elevation="8">
            <v-card-text class="pa-8">
              <!-- Header -->
              <div class="text-center mb-8">
                <div class="brand-icon mb-4">
                  <v-icon icon="mdi-chef-hat" size="48" color="primary" />
                </div>
                <h2 class="text-h4 font-weight-bold primary--text mb-2">
                  Crie sua conta
                </h2>
                <p class="text-body-1 grey--text">
                  Comece a organizar suas receitas hoje mesmo
                </p>
              </div>

              <!-- Register Form -->
              <v-form @submit.prevent="handleRegister" ref="registerForm">
                <v-text-field
                  v-model="formData.nome"
                  label="Nome completo"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  :rules="[rules.required]"
                  class="mb-4"
                />

                <v-text-field
                  v-model="formData.login"
                  label="Email"
                  prepend-inner-icon="mdi-email"
                  variant="outlined"
                  :rules="[rules.required, rules.email]"
                  class="mb-4"
                />

                <v-text-field
                  v-model="formData.senha"
                  label="Senha"
                  prepend-inner-icon="mdi-lock"
                  :type="showPassword ? 'text' : 'password'"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="showPassword = !showPassword"
                  variant="outlined"
                  :rules="[rules.required, rules.minLength]"
                  class="mb-4"
                />

                <v-text-field
                  v-model="confirmPassword"
                  label="Confirmar senha"
                  prepend-inner-icon="mdi-lock-check"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="showConfirmPassword = !showConfirmPassword"
                  variant="outlined"
                  :rules="[rules.required, rules.passwordMatch]"
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
                  Criar conta
                </v-btn>
              </v-form>

              <!-- Divider -->
              <v-divider class="my-6" />

              <!-- Login Link -->
              <div class="text-center">
                <p class="text-body-2 grey--text mb-2">
                  Já tem uma conta?
                </p>
                <v-btn
                  :to="'/login'"
                  variant="outlined"
                  color="primary"
                  size="large"
                  block
                >
                  Fazer login
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Error Alert -->
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
const showConfirmPassword = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const confirmPassword = ref('')
const registerForm = ref()

const formData = reactive({
  nome: '',
  login: '',
  senha: ''
})

// Validation rules
const rules = {
  required: (value: string) => !!value || 'Campo obrigatório',
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Email inválido'
  },
  minLength: (value: string) => value.length >= 6 || 'Senha deve ter pelo menos 6 caracteres',
  passwordMatch: (value: string) => value === formData.senha || 'Senhas não coincidem'
}

// Composables
const { register, isLoading } = useAuth()
const { error, success } = useNotifications()

// Methods
const handleRegister = async () => {
  const { valid } = await registerForm.value.validate()
  if (!valid) return

  const result = await register(formData)
  
  if (!result.success) {
    errorMessage.value = result.message || 'Erro ao criar conta'
    showError.value = true
    error('Erro no cadastro', result.message)
  } else {
    success('Conta criada com sucesso!', 'Bem-vindo ao ChefBook!')
  }
}
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, lighten($primary-color, 45%) 0%, lighten($secondary-color, 45%) 100%);

  .register-card {
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
