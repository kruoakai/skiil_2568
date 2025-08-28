<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const auth = useAuthStore()
const id = computed(()=> route.params.id)
const errorMsg = ref('')

const schema = yup.object({
  name: yup.string().required('กรอกชื่อ'),
  email: yup.string().email('อีเมลไม่ถูกต้อง').required('กรอกอีเมล'),
  role: yup.mixed<'user'|'evaluator'|'admin'>().oneOf(['user','evaluator','admin']).required()
})
const { handleSubmit, setValues } = useForm({ validationSchema: schema })
const { value: name, errorMessage: nameErr } = useField<string>('name')
const { value: email, errorMessage: emailErr } = useField<string>('email')
const { value: role, errorMessage: roleErr } = useField<any>('role')

onMounted(async ()=>{
  try{
    const res:any = await $fetch(`${config.public.apiBase}/api/users/${id.value}`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    setValues({ name: res.data.name, email: res.data.email, role: res.data.role })
  }catch(e:any){
    errorMsg.value = e?.data?.message || e.message || 'Load failed'
  }
})

const onSubmit = handleSubmit(async (values)=>{
  try{
    await $fetch(`${config.public.apiBase}/api/users/${id.value}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${auth.token}` },
      body: values
    })
    router.push('/')
  }catch(e:any){
    errorMsg.value = e?.data?.message || e.message || 'Update failed'
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-6 max-w-xl">
    <v-card>
      <v-card-title>Edit User #{{ id }}</v-card-title>
      <v-card-text>
        <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
          <v-text-field v-model="name" label="Name" :error-messages="nameErr || []" />
          <v-text-field v-model="email" label="Email" :error-messages="emailErr || []" />
          <v-select v-model="role" :items="['user','evaluator','admin']" label="Role" :error-messages="roleErr || []" />
          <v-alert v-if="errorMsg" type="error" variant="tonal">{{ errorMsg }}</v-alert>
          <v-card-actions class="px-0">
            <v-spacer />
            <NuxtLink to="/"><v-btn variant="text">Back</v-btn></NuxtLink>
            <v-btn color="primary" type="submit">Save</v-btn>
          </v-card-actions>
        </form>
      </v-card-text>
    </v-card>
  </div>
</template>
