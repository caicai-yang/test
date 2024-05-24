import { ref } from 'vue'
import useConfigStore from '@/store/modules/config'

export function useConfig(key: string) {
  const configStore = useConfigStore()
  return ref(configStore.getKey(key))
}
