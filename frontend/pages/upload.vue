<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
const router = useRouter()
const config = useRuntimeConfig()
const auth = useAuthStore()

if (process.client && !auth.isLogged) {
  router.push('/login')
}

const file = ref<File | null>(null)
const resultUrl = ref('')
const errorMsg = ref('')

function onFile(e:any){
  file.value = e.target.files?.[0] || null
}

async function upload(){
  errorMsg.value = ''
  resultUrl.value = ''
  try{
    if(!file.value) {
      errorMsg.value = 'กรุณาเลือกไฟล์'
      return
    }
    const form = new FormData()
    form.append('file', file.value)

    const res:any = await $fetch(`${config.public.apiBase}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.token}` },
      body: form
    })
    resultUrl.value = res.url
  }catch(e:any){
    errorMsg.value = e?.data?.message || e.message || 'Upload failed'
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 max-w-xl">
    <v-card>
      <v-card-title>Upload File</v-card-title>
      <v-card-text>
        <div class="flex flex-col gap-4">
          <input type="file" @change="onFile" />
          <v-alert v-if="errorMsg" type="error" variant="tonal">{{ errorMsg }}</v-alert>
          <v-alert v-if="resultUrl" type="success" variant="tonal">
            Uploaded: <a :href="resultUrl" target="_blank">{{ resultUrl }}</a>
          </v-alert>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <NuxtLink to="/"><v-btn variant="text">Back</v-btn></NuxtLink>
        <v-btn color="primary" @click="upload">Upload</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
