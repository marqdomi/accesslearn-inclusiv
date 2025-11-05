import { apiRequest } from './http-client'

export interface AdminSetupPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

interface SetupStatusResponse {
  needsSetup: boolean
}

interface InitializeResponse {
  data: {
    id: string
    email: string
    role: 'admin'
    firstName: string
    lastName: string
  }
}

interface LoginSuccessResponse {
  data: {
    id: string
    email: string
    role: 'admin' | 'employee' | 'mentor'
    firstName: string | null
    lastName: string | null
  }
}

export const AuthService = {
  async getSetupStatus(): Promise<boolean> {
    const response = await apiRequest<SetupStatusResponse>('admin/setup-status')
    return response.needsSetup
  },

  async initializeAdmin(payload: AdminSetupPayload) {
    return apiRequest<InitializeResponse>('admin/initialize', {
      method: 'POST',
      body: payload
    })
  },

  async login(email: string, password: string) {
    return apiRequest<LoginSuccessResponse>('auth/login', {
      method: 'POST',
      body: { email, password }
    })
  }
}
