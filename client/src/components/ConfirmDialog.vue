<template>
  <v-dialog
    v-model="isOpen"
    max-width="500"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon 
          :icon="iconName"
          :color="iconColor"
          class="mr-3"
          size="32"
        />
        <span class="text-h5">{{ title }}</span>
      </v-card-title>

      <v-card-text class="py-4">
        <p class="text-body-1 mb-0">{{ message }}</p>
        <p v-if="description" class="text-body-2 text-medium-emphasis mt-2 mb-0">
          {{ description }}
        </p>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="isLoading"
          @click="handleCancel"
        >
          {{ cancelText }}
        </v-btn>
        <v-btn
          :color="confirmColor"
          :loading="isLoading"
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
.v-card-title {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.v-card-actions {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
