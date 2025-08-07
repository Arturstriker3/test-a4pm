<template>
<v-dialog
    v-model="isOpen"
    max-width="420"
    :persistent="false"
    :scrim="true"
    transition="dialog-transition"
    @click:outside="isOpen = false"
>
    <v-card
      class="confirm-dialog"
      elevation="16"
    >
      <!-- Header com ícone e título -->
      <div class="confirm-dialog__header">
        <div class="confirm-dialog__icon-container" :class="`confirm-dialog__icon-container--${type}`">
          <v-icon 
            :icon="iconName"
            size="28"
            color="white"
          />
        </div>
        <div class="confirm-dialog__header-content">
          <h2 class="confirm-dialog__title">{{ title }}</h2>
          <p class="confirm-dialog__message">{{ message }}</p>
        </div>
      </div>

      <!-- Conteúdo principal -->
      <v-card-text v-if="description" class="confirm-dialog__content">
        <p class="confirm-dialog__description">{{ description }}</p>
      </v-card-text>

      <!-- Ações -->
      <v-card-actions class="confirm-dialog__actions">
        <v-btn
          variant="text"
          color="grey-darken-1"
          :disabled="isLoading"
          size="large"
          class="confirm-dialog__button confirm-dialog__button--cancel"
          @click="handleCancel"
        >
          {{ cancelText }}
        </v-btn>
        
        <v-btn
          :color="confirmColor"
          variant="flat"
          :loading="isLoading"
          size="large"
          class="confirm-dialog__button confirm-dialog__button--confirm"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  message?: string
  description?: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info' | 'success'
  isLoading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirmar ação',
  message: 'Tem certeza que deseja continuar?',
  description: '',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  type: 'danger',
  isLoading: false
})

const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const iconName = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'mdi-alert-circle'
    case 'warning':
      return 'mdi-alert'
    case 'info':
      return 'mdi-information'
    case 'success':
      return 'mdi-check-circle'
    default:
      return 'mdi-alert-circle'
  }
})

const iconColor = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'error'
    case 'warning':
      return 'warning'
    case 'info':
      return 'info'
    case 'success':
      return 'success'
    default:
      return 'error'
  }
})

const confirmColor = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'error'
    case 'warning':
      return 'warning'
    case 'info':
      return 'primary'
    case 'success':
      return 'success'
    default:
      return 'error'
  }
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  isOpen.value = false
}
</script>

<style scoped>
.confirm-dialog {
  border-radius: 20px !important;
  overflow: hidden;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafb 100%);
}

.confirm-dialog__header {
  display: flex;
  align-items: flex-start;
  padding: 32px 32px 24px 32px;
  gap: 20px;
  background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.confirm-dialog__icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.confirm-dialog__icon-container--danger {
  background: linear-gradient(135deg, #f56565, #e53e3e);
}

.confirm-dialog__icon-container--warning {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
}

.confirm-dialog__icon-container--info {
  background: linear-gradient(135deg, #4299e1, #3182ce);
}

.confirm-dialog__icon-container--success {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.confirm-dialog__header-content {
  flex: 1;
  min-width: 0;
  padding-top: 4px;
}

.confirm-dialog__title {
  font-size: 1.375rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 0 0 8px 0;
  color: #1a202c;
  letter-spacing: -0.025em;
}

.confirm-dialog__message {
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
  color: #4a5568;
  font-weight: 400;
}

.confirm-dialog__content {
  padding: 0 32px 24px 32px;
}

.confirm-dialog__description {
  font-size: 0.875rem;
  line-height: 1.6;
  color: #718096;
  margin: 0;
  font-weight: 400;
}

.confirm-dialog__actions {
  padding: 24px 32px 32px 32px;
  gap: 12px;
  justify-content: flex-end;
  background: rgba(248, 250, 252, 0.5);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.confirm-dialog__button {
  border-radius: 12px !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
  min-width: 100px;
  height: 44px !important;
  font-size: 0.95rem !important;
}

.confirm-dialog__button--cancel {
  color: #718096 !important;
  transition: all 0.2s ease;
}

.confirm-dialog__button--cancel:hover {
  background-color: rgba(113, 128, 150, 0.08) !important;
  color: #4a5568 !important;
}

.confirm-dialog__button--confirm {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  transition: all 0.2s ease !important;
}

.confirm-dialog__button--confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;
}

.confirm-dialog__button--confirm:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

/* Animações */
.v-dialog-transition-enter-active,
.v-dialog-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.v-dialog-transition-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.v-dialog-transition-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .confirm-dialog {
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }
  
  .confirm-dialog__header {
    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
  
  .confirm-dialog__title {
    color: #f7fafc;
  }
  
  .confirm-dialog__message {
    color: #cbd5e0;
  }
  
  .confirm-dialog__description {
    color: #a0aec0;
  }
  
  .confirm-dialog__actions {
    background: rgba(45, 55, 72, 0.5);
    border-top-color: rgba(255, 255, 255, 0.1);
  }
}

/* Mobile responsiveness */
@media (max-width: 600px) {
  .confirm-dialog__header {
    padding: 24px 20px 20px 20px;
    gap: 16px;
  }
  
  .confirm-dialog__icon-container {
    width: 48px;
    height: 48px;
    border-radius: 12px;
  }
  
  .confirm-dialog__title {
    font-size: 1.25rem;
  }
  
  .confirm-dialog__message {
    font-size: 0.95rem;
  }
  
  .confirm-dialog__content {
    padding: 0 20px 20px 20px;
  }
  
  .confirm-dialog__actions {
    padding: 20px;
    flex-direction: column-reverse;
    gap: 8px;
  }
  
  .confirm-dialog__button {
    width: 100%;
    min-width: auto;
  }
}
</style>
