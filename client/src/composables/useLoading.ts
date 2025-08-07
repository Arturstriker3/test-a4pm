import { ref, reactive } from "vue";

export function useLoading() {
  const loading = reactive<Record<string, boolean>>({});
  const globalLoading = ref(false);

  const setLoading = (key: string, value: boolean) => {
    loading[key] = value;
  };

  const isLoading = (key: string): boolean => {
    return loading[key] || false;
  };

  const setGlobalLoading = (value: boolean) => {
    globalLoading.value = value;
  };

  const withLoading = async <T>(
    key: string,
    promise: Promise<T>
  ): Promise<T> => {
    setLoading(key, true);
    try {
      const result = await promise;
      return result;
    } finally {
      setLoading(key, false);
    }
  };

  const withGlobalLoading = async <T>(promise: Promise<T>): Promise<T> => {
    setGlobalLoading(true);
    try {
      const result = await promise;
      return result;
    } finally {
      setGlobalLoading(false);
    }
  };

  return {
    loading,
    globalLoading,
    setLoading,
    isLoading,
    setGlobalLoading,
    withLoading,
    withGlobalLoading,
  };
}
