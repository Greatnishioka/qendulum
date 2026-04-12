# Qendulum

## API ドキュメント

このリポジトリでは、OpenAPI 仕様の正本として `swagger-php` を利用します。
生成されたファイルは `docs/` 配下に配置し、PHP attributes から生成される成果物として Git 管理します。

### 正本の扱い

- API 仕様の正本は `app/` 配下の PHP OpenAPI attributes です。
- `docs/openapi.yaml` と `docs/openapi.json` は生成物なので、手で直接編集してはいけません。
- API に関する変更を含む PR では、PHP 側の attributes 変更と `docs/` 配下の生成物更新を必ずセットで含めてください。

### 生成ファイル

- `docs/openapi.yaml`
- `docs/openapi.json`
- `docs/index.html`

### 仕様書の生成

```bash
composer docs:generate
```

このコマンドは Laravel アプリケーションを走査し、`docs/` 配下の OpenAPI ファイルを再生成します。

### 仕様書の表示

`docs/index.html` は Swagger UI を使って `docs/openapi.yaml` を読み込みます。
多くのブラウザでは `file://` 経由の読み込みが制限されるため、ローカルで確認するときは `docs/` を HTTP 配信してください。

例:

```bash
php -S 127.0.0.1:8081 -t docs
```

その後、`http://127.0.0.1:8081` を開いてください。

### Pre-commit Hook

このリポジトリでは Git hook を `.githooks/` で管理しています。
clone ごとに一度だけ、以下を実行してください。

```bash
composer hooks:install
```

設定後、`git commit` のたびに以下を実行します。

1. `composer deptrac`
2. `npm run lint`
3. OpenAPI 仕様書の再生成
4. `docs/openapi.yaml` と `docs/openapi.json` の再ステージ
5. 更新済み仕様書を同じ commit に含める

Deptrac または ESLint のどちらかが失敗した場合、その commit はブロックされます。

### 更新フロー

1. endpoint 実装、Request の validation rules、または OpenAPI attributes を更新します。
2. commit 前に仕様書を確認したい場合は `composer docs:generate` を実行します。
3. 通常どおり commit します。pre-commit hook が OpenAPI ファイルを再生成し、再ステージします。

### Contract Test に関する補足

このリポジトリは `Schemathesis` を使った contract test 導入を見据えています。
ただし現時点では、一部 endpoint が JSON ではなく Inertia page や redirect を返しています。
そのため、現在の構成ではまず Laravel コードと OpenAPI 生成物の同期を優先しています。
