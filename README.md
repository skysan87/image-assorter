
### Commands

```bash
# For Desktop development
npm run tauri:dev
```
## プロジェクト構成

```
.
├── node_modules  ・・・Nuxt.jsプロジェクトのモジュール
├── src-tauri
│   ├── src/(Tauri resource)
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src-web
│   ├── src/(Nuxt3 resource)
│   ├── package.json
│   └── tsconfig.json
├── nuxt.config.ts
├── package.json
└── tsconfig.json
```

## 環境

- Rustはローカルにインストールが必要

```bash
$ node -v
v22.8.0

$ npm -v
10.8.2

$ devbox version
0.14.0

$ cargo version
cargo 1.85.0 (d73d2caf9 2024-12-31)

$ rustc --version
rustc 1.85.0 (4d91de4e4 2025-02-17)
```

## インストール

```bash
$ npm install
```

## デバッグ実行

```bash
# For Desktop development
npm run tauri:dev
```