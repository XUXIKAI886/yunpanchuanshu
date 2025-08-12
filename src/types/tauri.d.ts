// Tauri 环境类型声明
declare global {
  interface Window {
    __TAURI__?: {
      dialog: {
        save: (options?: {
          defaultPath?: string
          filters?: Array<{
            name: string
            extensions: string[]
          }>
        }) => Promise<string | null>
      }
      fs: {
        writeBinaryFile: (path: string, data: Uint8Array) => Promise<void>
        writeTextFile: (path: string, data: string) => Promise<void>
        readBinaryFile: (path: string) => Promise<Uint8Array>
        readTextFile: (path: string) => Promise<string>
      }
      shell: {
        open: (url: string) => Promise<void>
      }
      invoke: (command: string, args?: any) => Promise<any>
      [key: string]: any
    }
  }
}

export {}