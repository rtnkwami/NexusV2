<script setup lang="ts">
  useHead({ title: 'Atelier | Login' })
  
  import { GalleryVerticalEnd } from "lucide-vue-next"
  import LoginForm from "@/components/login-03/components/LoginForm.vue";
</script>

<template>
  <div class="flex w-full max-w-sm mx-auto flex-col gap-6">
    <a href="#" class="flex items-center gap-2 self-center font-medium text-white">
      <div class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
        <GalleryVerticalEnd class="size-4" />
      </div>
      Atelier
    </a>

    <LoginForm />
  </div>
</template>