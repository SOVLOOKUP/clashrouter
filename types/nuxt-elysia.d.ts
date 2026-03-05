import type { ModuleOptions } from 'nuxt-elysia'

declare module 'nuxt/schema' {
    interface NuxtConfig {
        nuxtElysia?: ModuleOptions
    }

    interface NuxtOptions {
        nuxtElysia?: ModuleOptions
    }
}

export { }
