/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LIVE_API_URL: string;
  readonly VITE_AGORA_APP_ID: string;
  // add more env variables types here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
