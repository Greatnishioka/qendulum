# DDD Purity Report

## 総合評価

**83 / 100**

このリポジトリの DDD 的純度は高めです。  
特に `Application` / `Domain` / `Infrastructure` / `Http` の責務分離はかなり意識されており、依存方向も概ね守られています。

一方で、`Search` がまだ「外部 API の整形結果」を配列で返す段階にあり、`ValuableBook` でも外部入力由来の構造や `rawPayload` がドメインへ残っています。  
そのため、DDD としては良い土台ができているが、まだ「戦術的 DDD が全体に浸透し切った状態」ではありません。

## 加点要素

### 1. 層の依存方向が明確

- `CreateFavoriteUseCase` は `TransactionManager`、`UserIdResolver`、`FavoriteStore` などの port を介して処理を組み立てており、アプリケーション層の責務が明確です。  
  参照: [app/Application/ValuableBook/UseCase/CreateFavoriteUseCase.php](/Users/nishioka/projects/ayato-dev/qendulum/app/Application/ValuableBook/UseCase/CreateFavoriteUseCase.php:17)
- `LoginUseCase` も repository と domain service だけに依存しており、Laravel 実装詳細を直接持ち込んでいません。  
  参照: [app/Application/Auth/UseCase/LoginUseCase.php](/Users/nishioka/projects/ayato-dev/qendulum/app/Application/Auth/UseCase/LoginUseCase.php:13)
- DI バインドは `AppServiceProvider` に集約され、Infrastructure 実装の接続点が明示されています。  
  参照: [app/Providers/AppServiceProvider.php](/Users/nishioka/projects/ayato-dev/qendulum/app/Providers/AppServiceProvider.php:27)

### 2. ドメインの基本要素がある

- `ValuableBookEntity` は identity と各種 Value Object を持ち、単なる配列運搬では終わっていません。  
  参照: [app/Domain/ValuableBook/Entity/ValuableBookEntity.php](/Users/nishioka/projects/ayato-dev/qendulum/app/Domain/ValuableBook/Entity/ValuableBookEntity.php:20)
- `Auth` でも `Email`、`Password`、`UserAuthEntity`、`UserAuthenticator` が分かれていて、認証関心が整理されています。

### 3. HTTP の副作用が外に逃がされている

- セッションログインは `LoginResponder` に置かれており、ユースケースが HTTP セッション開始を直接扱っていません。  
  参照: [app/Http/Responders/Auth/LoginResponder.php](/Users/nishioka/projects/ayato-dev/qendulum/app/Http/Responders/Auth/LoginResponder.php:14)
- `CreateFavoriteRequest` は入力変換を担当し、ユースケースへ `InputData` を渡しています。  
  参照: [app/Http/Requests/ValuableBook/CreateFavoriteRequest.php](/Users/nishioka/projects/ayato-dev/qendulum/app/Http/Requests/ValuableBook/CreateFavoriteRequest.php:49)

### 4. 設計を支えるテストがある

- Application / Domain のユニットテストが存在し、port 越しの設計を壊しにくい状態です。  
  参照: [tests/Unit/Application/ValuableBook/UseCase/CreateFavoriteUseCaseTest.php](/Users/nishioka/projects/ayato-dev/qendulum/tests/Unit/Application/ValuableBook/UseCase/CreateFavoriteUseCaseTest.php:20)
- `php artisan test` は全件通過、`php vendor/bin/deptrac analyse` も violation 0 でした。

## 減点要素

### 1. Search がまだドメインモデル不在

- `PaperSearchGateway` は `array<string, mixed>` を返しており、検索結果の概念がドメインに昇格していません。  
  参照: [app/Domain/Search/Repository/PaperSearchGateway.php](/Users/nishioka/projects/ayato-dev/qendulum/app/Domain/Search/Repository/PaperSearchGateway.php:5)
- `ArxivPaperSearchGateway` は HTTP、キャッシュ、XML パース、レスポンス整形を 1 クラスで抱えており、現在は「インフラ実装としては妥当」でも、DDD の純度という観点では source 依存が強いです。  
  参照: [app/Infrastructure/Search/ArxivPaperSearchGateway.php](/Users/nishioka/projects/ayato-dev/qendulum/app/Infrastructure/Search/ArxivPaperSearchGateway.php:23)

### 2. 外部入力の形がまだユースケース境界に強く残る

- `CreateFavoriteRequest` では `valuable_book.links.*` や `primaryCategory` など arXiv 由来の構造を直接解釈しています。  
  参照: [app/Http/Requests/ValuableBook/CreateFavoriteRequest.php](/Users/nishioka/projects/ayato-dev/qendulum/app/Http/Requests/ValuableBook/CreateFavoriteRequest.php:22)
- これは現実的な実装ですが、複数 source に拡張した瞬間に Application/Request 側が肥大化しやすい構造です。

### 3. ドメインに `rawPayload` が残っている

- `ValuableBookEntity` が `rawPayload` を保持しており、ドメインモデルが外部 API の生情報を抱えています。  
  参照: [app/Domain/ValuableBook/Entity/ValuableBookEntity.php](/Users/nishioka/projects/ayato-dev/qendulum/app/Domain/ValuableBook/Entity/ValuableBookEntity.php:18)
- 監査や再表示の都合では有用ですが、DDD 的には「ドメインが知らなくてよい情報」を保持しているため純度を少し下げます。

### 4. アーキテクチャ検査の網羅がまだ弱い

- `deptrac` は violation 0 ですが、`Uncovered 56` が出ています。
- つまり「禁止依存は見えている範囲ではない」が、「全ファイルが設計ルールの監視対象に入っている」とはまだ言えません。

## 点数内訳

- 層分離と依存方向: 24 / 25
- ユースケース中心の設計: 18 / 20
- ドメインモデルの厚み: 15 / 20
- インフラ隔離: 16 / 20
- テストと設計保護: 10 / 15

## 100点に近づけるための優先順位

1. `Search` に検索結果 DTO / Entity / Value Object を導入し、`array<string, mixed>` をやめる
2. `ArxivPaperSearchGateway` のレスポンス整形結果を、source 非依存の検索結果モデルへ変換する
3. `ValuableBookEntity` から `rawPayload` を外すか、少なくとも domain ではなく application/infrastructure 側へ退避する
4. `CreateFavoriteRequest` の source 固有解釈を mapper に逃がし、入力境界を source 非依存に寄せる
5. `deptrac` の `Uncovered` を減らし、設計違反の監視範囲を広げる

## 結論

現状は **「Laravel アプリとしてはかなり DDD を意識できている」** 段階です。  
ただし **「検索ドメインがまだ薄いこと」と「外部 API 由来の構造が一部残っていること」** が、純度を 80 点台前半に留めています。

したがって、現在の評価は **83 / 100** が妥当です。
