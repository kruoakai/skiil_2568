<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
const router = useRouter()
const config = useRuntimeConfig()
const auth = useAuthStore()

if (process.client && !auth.isLogged) {
  router.push('/login')
}

const search = ref('')
const items = ref<any[]>([])
const total = ref(0)
const loading = ref(false)

const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: 'id', order: 'desc' }]
})

async function load(){
  loading.value = true
  try{
    const sortKey = options.value.sortBy?.[0]?.key || 'id'
    const sortDesc = (options.value.sortBy?.[0]?.order || 'desc') === 'desc'
    const res:any = await $fetch(`${config.public.apiBase}/api/users/server`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      query: {
        page: options.value.page,
        itemsPerPage: options.value.itemsPerPage,
        sortBy: sortKey,
        sortDesc,
        search: search.value
      }
    })
    items.value = res.items
    total.value = res.total
  } finally {
    loading.value = false
  }
}

watch(options, load, { deep: true })
watch(search, () => { options.value.page = 1; load() })
onMounted(load)

function logout() {
  auth.clear()
  router.push('/login')
}

async function removeUser(id:number){
  if(!confirm('Delete user #' + id + '?')) return;
  await $fetch(`${config.public.apiBase}/api/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${auth.token}` } })
  await load()
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-4 gap-3">
      <div class="flex items-center gap-3">
        <NuxtLink to="/users/new">
          <v-btn color="primary" variant="elevated">Create User</v-btn>
        </NuxtLink>
        <a href="http://localhost:7000/docs" target="_blank">
          <v-btn variant="tonal">Open API Docs</v-btn>
        </a>
        <NuxtLink to="/upload">
          <v-btn variant="tonal">Upload</v-btn>
        </NuxtLink>
      </div>
      <div class="flex items-center gap-3">
        <v-text-field v-model="search" label="Search" density="comfortable" hide-details />
        <v-btn color="error" @click="logout">Logout</v-btn>
      </div>
    </div>

    <v-card>
      <v-card-title class="text-lg">Users</v-card-title>
      <v-card-text>
        <v-data-table-server
          v-model:items-per-page="options.itemsPerPage"
          v-model:page="options.page"
          :items-length="total"
          :items="items"
          :loading="loading"
          :headers="[
            { title:'ID', key:'id' },
            { title:'Name', key:'name' },
            { title:'Email', key:'email' },
            { title:'Role', key:'role' },
            { title:'Created', key:'created_at' },
            { title:'Actions', key:'actions', sortable:false }
          ]"
          :sort-by="options.sortBy"
          @update:sort-by="(s:any)=> options.sortBy = s"
        >
          <template #item.actions="{ item }">
            <NuxtLink :to="`/users/${item.id}`"><v-btn size="small" variant="text">Edit</v-btn></NuxtLink>
            <v-btn size="small" color="error" variant="text" @click="removeUser(item.id)">Delete</v-btn>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>
  </div>
</template>
