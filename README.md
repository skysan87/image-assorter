
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

## ビルド

> [!NOTE]
> appのみ生成する。
> `tauri.conf.json`で設定を行う。

```bash
npm run tauri build
```

## Reference

- Nuxt3の導入方法
  - https://v2.tauri.app/ja/start/frontend/nuxt/
- ファイルを開く(dialog)
  - https://v2.tauri.app/ja/plugin/dialog/#open-a-file-selector-dialog
- ファイルを読み込む(fs)
  - https://v2.tauri.app/ja/plugin/file-system/
  - https://v2.tauri.app/ja/reference/javascript/api/namespacecore/#convertfilesrc
    - ローカルの画像ファイルの参照
- 権限
  - https://github.com/tauri-apps/plugins-workspace/issues/1989
