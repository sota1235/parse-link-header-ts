# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

RFC 5988準拠のHTTP Link Headerパーサー。TypeScript製のゼロ依存ライブラリ。npmパッケージ名は `@sota1235/parse-link-header-ts`。

## 開発コマンド

```bash
# ビルド
npm run build

# テスト（Node.js組み込みテストランナー使用）
npm test

# リント
npm run lint

# フォーマット＋リント修正
npm run fix

# npm公開用ビルド（テストファイル除外）
npm run build:publish
```

テストは `node --test --experimental-strip-types` で実行される。個別テストの実行は `node --test --experimental-strip-types src/index.test.ts` で可能（テストファイルは1つのみ）。

## アーキテクチャ

単一ファイルライブラリ。`src/index.ts` にすべてのロジックがある。

- **エントリポイント**: `src/index.ts` — `parse(linkHeader: string): Result` をデフォルトエクスポート
- **テスト**: `src/index.test.ts` — Node.js `node:test` モジュールを使用、`TestContext` の `t.assert.deepStrictEqual()` でアサーション
- **ビルド出力**: `dist/` — TypeScript宣言ファイル付き

パース処理の流れ: `parse()` → `checkHeader()` でバリデーション → 個々のリンクを `parseLink()` で分解 → `hasRel()` でrel属性の存在確認 → `intoRels()` で結果オブジェクトに変換。

## コード規約

- ESM（`"type": "module"`）
- TypeScript strict mode
- Prettier: シングルクォート、セミコロンあり、trailing comma
- ESLint: `@sota1235/eslint-config` を使用
- pre-commitフック（husky + lint-staged）でフォーマット・リント自動実行
