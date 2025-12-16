<template>
  <div
    class="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10
           bg-[url('https://miro.medium.com/v2/1*FsJUFXiqszwqq9JrtlIDpQ.jpeg')] bg-cover bg-center"
  >

    <div class="absolute inset-0 bg-black/50"></div>

    <div class="relative z-10 w-full">
      <slot />
    </div>
  </div>
</template>