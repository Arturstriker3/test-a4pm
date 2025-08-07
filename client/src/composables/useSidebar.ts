import { ref, computed } from "vue";
import { useDisplay } from "vuetify";

// Global state for sidebar
const isOpen = ref(false);
const isRail = ref(false);

export function useSidebar() {
  const { mobile } = useDisplay();

  // Computed properties
  const sidebarOpen = computed({
    get: () => isOpen.value,
    set: (value: boolean) => {
      isOpen.value = value;
    },
  });

  const railMode = computed({
    get: () => isRail.value && !mobile.value,
    set: (value: boolean) => {
      if (!mobile.value) {
        isRail.value = value;
      }
    },
  });

  // Methods
  const toggleSidebar = () => {
    isOpen.value = !isOpen.value;
  };

  const closeSidebar = () => {
    isOpen.value = false;
  };

  const openSidebar = () => {
    isOpen.value = true;
  };

  const toggleRail = () => {
    if (!mobile.value) {
      isRail.value = !isRail.value;
    }
  };

  // Auto-close on mobile when navigating
  const handleNavigation = () => {
    if (mobile.value) {
      closeSidebar();
    }
  };

  // Initialize sidebar based on screen size
  const initializeSidebar = () => {
    if (mobile.value) {
      isOpen.value = false;
      isRail.value = false;
    } else {
      isOpen.value = true;
      isRail.value = false;
    }
  };

  return {
    // State
    sidebarOpen,
    railMode,

    // Getters
    isOpen: computed(() => isOpen.value),
    isRail: computed(() => isRail.value),
    isMobile: computed(() => mobile.value),

    // Methods
    toggleSidebar,
    closeSidebar,
    openSidebar,
    toggleRail,
    handleNavigation,
    initializeSidebar,
  };
}
