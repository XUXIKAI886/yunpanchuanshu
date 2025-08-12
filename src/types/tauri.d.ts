// Tauri 环境类型声明
declare global {
  interface Window {
    __TAURI__?: {
      [key: string]: any
    }
  }
}

// Tauri 插件类型声明
declare module '@tauri-apps/plugin-dialog' {
  export interface SaveDialogOptions {
    defaultPath?: string
    filters?: Array<{
      name: string
      extensions: string[]
    }>
  }
  
  export function save(options?: SaveDialogOptions): Promise<string | null>
}

declare module '@tauri-apps/plugin-fs' {
  export function writeFile(path: string, data: Uint8Array): Promise<void>
  export function writeTextFile(path: string, data: string): Promise<void>
}

export {}