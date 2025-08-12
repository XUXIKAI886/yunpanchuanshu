// Tauri 环境类型声明
declare global {
  interface Window {
    __TAURI__?: {
      core: {
        invoke: (command: string, args?: any) => Promise<any>
      }
      app?: any
      dpi?: any
      event?: any
      image?: any
      menu?: any
      mocks?: any
      path?: any
      tray?: any
      webview?: any
      webviewWindow?: any
      window?: any
      [key: string]: any
    }
  }
}

export {}