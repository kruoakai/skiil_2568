<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'

const router = useRouter()
const config = useRuntimeConfig()
const auth = useAuthStore()
const errorMsg = ref('')

const schema = yup.object({
  email: yup.string().email('อีเมลไม่ถูกต้อง').required('กรอกอีเมล'),
  password: yup.string().min(6, 'รหัสผ่านอย่างน้อย 6 ตัว').required('กรอกรหัสผ่าน')
})

const { handleSubmit } = useForm({ validationSchema: schema })
const { value: email, errorMessage: emailErr } = useField<string>('email')
const { value: password, errorMessage: passwordErr } = useField<string>('password')

const onSubmit = handleSubmit(async (values)=>{
  errorMsg.value = ''
  try{
    const res:any = await $fetch(`${config.public.apiBase}/api/auth/login`, {
      method: 'POST',
      body: values
    })
    if(res?.accessToken){
      auth.setAuth(res.accessToken, res.user)
      router.push('/')
    } else {
      errorMsg.value = 'Invalid response'
    }
  }catch(e:any){
    errorMsg.value = e?.data?.message || e.message || 'Login error'
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-12 max-w-md">
    <v-card>
      <v-card-title class="text-xl">เข้าสู่ระบบ</v-card-title>
      <v-card-text>
        <form class="flex flex-col gap-3" @submit.prevent="onSubmit">
          <v-text-field v-model="email" label="Email" :error-messages="emailErr || []" density="comfortable" />
          <v-text-field v-model="password" type="password" label="Password" :error-messages="passwordErr || []" density="comfortable" />
          <v-alert v-if="errorMsg" type="error" density="comfortable" variant="tonal">{{ errorMsg }}</v-alert>
          <v-card-actions class="px-0">
            <v-spacer />
            <v-btn color="primary" type="submit">Sign in</v-btn>
          </v-card-actions>
        </form>
      </v-card-text>
    </v-card>
  </div>
</template>
