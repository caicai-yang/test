import { ref } from 'vue'
import { IParams } from '@/types'

export function useParams() {
  const defaultParams: IParams = {
    currentPage: 1,
    pageSize: 20,
    keyword: '',
    conditions: [],
    sorts: []
  }
  const queryParams = ref(defaultParams)
  return queryParams
}
