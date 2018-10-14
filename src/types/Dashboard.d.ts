import { Total } from '../types/Total'

export interface Dashboard {
  data: Total | null
  error: { errorHappened: boolean; errorMsg: string }
  loading: boolean
  onSaveHistory: (history: Total) => void
  total: Total
}