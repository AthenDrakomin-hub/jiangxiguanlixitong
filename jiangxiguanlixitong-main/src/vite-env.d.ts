
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_USER: string;
  readonly VITE_ADMIN_PASS: string;
  readonly VITE_APP_URL: string;
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
