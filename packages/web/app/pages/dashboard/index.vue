 <script setup lang="ts">
   useHead({ title: 'Atelier | Dashboard' })
   
   import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card'
 </script>

<template>
  <div class="grid grid-flow-col grid-cols-3 gap-4 relative z-11">
      <Card>
        <CardHeader class="text-center">Projects</CardHeader>
      </Card>
    </div>
</template>
