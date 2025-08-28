import { defineStore } from 'pinia'

interface User { id:number; name:string; email:string; role:'admin'|'evaluator'|'user' }
interface State { token: string | null; user: User | null }

export const useAuthStore = defineStore('auth', {
  state: (): State => ({
    token: process.client ? localStorage.getItem('token') : null,
    user: null
  }),
  actions: {
    setAuth(token: string, user: any){
      this.token = token
      this.user = user
      if (process.client) localStorage.setItem('token', token)
    },
    clear(){
      this.token = null
      this.user = null
      if (process.client) localStorage.removeItem('token')
    }
  },
  getters: {
    isLogged: (s) => !!s.token
  }
})
