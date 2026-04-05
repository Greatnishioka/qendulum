# DDD Improvement Report

## 目的

現在のコードベースに対して、DDD 観点で優先して進める改善方針を整理する。
特に `Auth` と `ValuableBook` を先に整え、`Search` は将来の複数データソース対応を見据えた方針のみ定義する。

## 全体評価

現状の評価ポイントは以下。

- `Application -> Domain -> Infrastructure` の依存方向は概ね守れている
- Value Object は導入できている
- `Auth` は比較的整理されている
- `ValuableBook` は前進しているが、まだ外部入力形式や永続化都合の影響が強い
- `Search` は現状まだ「外部 API ラッパー」であり、ドメインとしては薄い

## 現状の主な課題

### 1. Auth で認証結果の表現が曖昧

現在の `LoginUseCase` は `UserAuthEntity` を返しているが、これは「認証情報」であり、「実際にログインさせる主体」とは少しズレている。

結果として、認証成功後に必要なのは「現在の guard がログイン対象として扱う ID」であるにもかかわらず、ユースケース結果と HTTP 層の意図が一致していない。

また、現状は `LoginResource` を経由して配列に変換し、その値を `LoginResponder` で再解釈して `loginUsingId()` を呼んでいるため、責務がやや遠回りになっている。

### 2. ValuableBook で User 解決責務が混ざっている

`FavoriteRepository` の実装が `UserPublicUuid` から `User` モデルを解決しており、`ValuableBook` コンテキストが `User` 永続化事情を知っている。

`UserPublicUuid` を受け取ること自体は問題ではないが、`ValuableBook` 側が `User` の解決まで抱えるのは責務過多。

### 3. ValuableBookRepository の契約意図が明文化されていない

現在の `ValuableBookRepository::save()` の実装は `firstOrCreate` ではなく `updateOrCreate` 相当である。
つまり現実装は「お気に入り登録時に論文を新規作成するだけでなく、既存論文のメタデータも最新状態へ更新する」挙動になっている。

この挙動自体は要件に合っているが、仕様書側でその意図が明文化されていないため、メソッド名と期待動作の解釈が揺れやすい。

### 4. 外部入力の表現が ValuableBook まで入り込みやすい

現状は `CreateFavoriteInputData` や `ValuableBookFactory` が source 固有の入力構造を色濃く扱っている。
複数データソース対応を見据えるなら、この責務は将来的に `Search` 側で吸収したい。

### 5. Search がドメインモデルを持っていない

`Search` は現在、外部 API のレスポンスを配列で返している。
このままだと将来 arXiv 以外のソースを追加した際に、Application や他ドメインへ source 固有差分が漏れやすい。

## 目標状態

目指す状態は以下。

- `Auth` は「認証失敗」と「認証成功結果」の表現が明確
- `Auth` の HTTP セッション開始処理の責務配置が明確
- `ValuableBook` はお気に入り登録ユースケースに集中し、`User` 解決責務を持たない
- `ValuableBookRepository` は「favorite 時に既存論文のメタデータ更新を許す」契約を明示する
- 将来的に `Search` が外部 API 差分を吸収し、共通の論文モデルを返す
- `ValuableBook` は正規化済みの論文情報だけを受け取る

## ドメイン別方針

## Auth

### 方針

- 認証失敗は引き続き例外で表現する
- `InvalidCredentialsException` は `Domain/Auth/Exception` に置いたままでよい
- `LoginUseCase` は `UserAuthEntity` を返すのではなく、認証成功結果を返す
- 認証成功後に必要な情報は現時点では `authId` のみとする
- セッションログインの実行は HTTP 層で扱う

### 修正内容

- `Application/Auth/Dto/AuthenticatedUser` を追加する
- `AuthenticatedUser` は `authId` のみを持つ
- `LoginUseCase` の戻り値を `AuthenticatedUser` に変更する
- `LoginResource` は廃止する
- `LoginResponder` は `loginUsingId($authenticatedUser->authId)` を使う
- `LoginAction` の `catch` 節は明示的に処理を終了させる

### 意図

`UserAuthEntity` は「認証情報」であり、「ログインさせる主体」そのものではない。
認証後に必要なのは現在の guard が要求するログイン対象 ID なので、ユースケース結果としては `AuthenticatedUser` の方が自然。

現構成では `config/auth.php` の `web` guard が `App\Models\User\UserAuth` を provider として使っているため、`loginUsingId()` に必要なのは `users.id` ではなく `user_auth.id` である。
したがって `AuthenticatedUser` が持つべき最小値は `userId` ではなく `authId` とする。

また `Auth::guard()->loginUsingId()` は Laravel の session guard を用いた HTTP セッション開始処理であり、永続化 repository の責務ではない。
この処理は Delivery/Interface Adapter に属する副作用として扱うのが自然であり、現構成では `Responder` に置くのが最も分かりやすい。

責務分担は以下を基本とする。

- `UseCase`: 認証可否を判定し、認証成功結果を返す
- `Responder`: セッションログイン、session regenerate、redirect を行う

### DTO 命名

命名候補としては `AuthenticatedSessionUser` や `AuthenticatedPrincipal` も考えられるが、今回のスコープでは `AuthenticatedUser` に統一する。

理由は以下。

- まずは現行のログイン処理を素直に置き換えることを優先したい
- DTO が持つ値は `authId` の 1 つだけであり、誤読リスクはプロパティ名で十分に抑えられる
- 将来 guard/provider の構成が大きく変わった場合にのみ、より抽象的な名前へ再検討すればよい

したがって今回は、クラス名は `AuthenticatedUser`、保持する値は `authId` とする。

## ValuableBook

### 方針

- 現時点では `Favorite` 集約を独立させない
- 理由は「お気に入り登録された論文だけ保存する」要件のため、保存とお気に入りのライフサイクルがほぼ一致しているから
- ただし `User` 解決責務は `ValuableBook` から外す
- `CreateFavoriteUseCase` というユースケース名は維持してよい
- favorite 時に既存論文が存在する場合は、外部ソースの最新メタデータで更新してよい

### 補足

このユースケースの本質は「お気に入り登録」であり、論文保存はその付随処理。
したがって UseCase 名は `CreateFavoriteUseCase` で問題ない。
一方で repository 側は「新規作成だけでなく更新も起こる」ことを契約として明示する必要がある。

### 修正内容

- `User` ドメインを追加する
- `UserPublicUuid` から `UserId` を解決する port を Application から利用できる形で追加する
- `CreateFavoriteUseCase` は `UserIdResolver` のような port を通して `UserId` を解決する
- `Action` から複数 UseCase を呼ばず、`CreateFavoriteUseCase` の中で解決する
- `favorite` 保存処理は `ValuableBook` ドメインの repository ではなく、Application port として切り出す
- `ValuableBookRepository::save()` は `upsert` など「更新を含む」ことが分かる名前へ変更する
- `DbFavoriteStore` から `User` モデル解決責務を外す
- `UserIdResolver` はユーザー未検出時に専用例外を投げる
- `CreateFavoriteUseCase` 全体は transaction port を介して 1 トランザクションで実行する

### 具体的な解決案

`ValuableBook` から `User` 永続化事情を外したいが、Action から複数 UseCase を呼びたくない場合は、以下の形が扱いやすい。

```text
CreateFavoriteAction
  -> CreateFavoriteUseCase
       -> UserIdResolver (port)
       -> ValuableBookRepository::upsert()
       -> FavoriteStore (Application port)
```

ポイントは、`CreateFavoriteUseCase` が `User` の Eloquent Model や table 構造を知らないこと。
知るのは「`UserPublicUuid` から `UserId` を引ける port がある」という事実だけにする。

例えば以下のような責務分担にする。

- `CreateFavoriteInputData`: `userPublicUuid` と正規化済み論文情報を持つ
- `UserIdResolver`: `UserPublicUuid -> UserId` を解決する Application port
- `DbUserIdResolver`: `Infrastructure/User` で Eloquent を使って実装する
- `FavoriteStore`: `UserId` と `ValuableBookIdentity` を受けて favorite を保存する Application port
- `DbFavoriteStore`: `Infrastructure` で Eloquent を使って実装する
- `TransactionManager`: ユースケース全体を 1 トランザクションで実行する Application port
- `DbTransactionManager`: `Infrastructure` で `DB::transaction()` を使って実装する

これにより、`ValuableBook` ユースケースは `User` コンテキストの永続化詳細を知らずに済む。
また、`favorite` 保存は `User` と `ValuableBook` をまたぐユースケース固有の操作として Application 境界に置ける。
トランザクション開始/終了も port 越しに扱うことで、UseCase が Laravel の static facade に直接依存せずに済む。

### 例外方針

`UserIdResolver` は、`UserPublicUuid` に対応するユーザーが存在しない場合に専用例外を送出する。
ここでは例えば `UserNotFoundException` のような名前を採用する。

これにより `CreateFavoriteUseCase` は Eloquent の `ModelNotFoundException` のような Infrastructure 依存の例外を直接扱わずに済む。
失敗理由をアプリケーションの言葉で表現できるようにする。

### 実装時の注意

この改善は差分が連動しているため、実装順を崩すと中途半端な状態になりやすい。
また、お気に入り登録は「論文の保存」と「favorite の保存」が揃って初めて完了とみなす。
そのため `CreateFavoriteUseCase` 全体は Application 層で 1 トランザクションとして扱う。

もし途中で `UserIdResolver` や `FavoriteStore` が失敗した場合は、保存途中の `ValuableBook` だけが残らないように rollback させる。
このユースケースでは以下を一括で成功させる前提にする。

- `UserPublicUuid` から `UserId` の解決
- `ValuableBookRepository::upsert()`
- `FavoriteStore::store()`

transaction 制御は repository 個別ではなく、ユースケース全体を囲う Application サービス側に置く。
具体的には `CreateFavoriteUseCase` が `TransactionManager` を受け取り、そのコールバック内で `UserIdResolver`、`ValuableBookRepository`、`FavoriteStore` を順に実行する。

特に以下の順で進める。

1. `CreateFavoriteInputData` を正規化済み形状へ変更する
2. `ValuableBookFactory` をその形状に合わせて単純化する
3. `UserIdResolver` を導入する
4. `FavoriteStore` を Application port として導入する
5. `TransactionManager` を導入する
6. `ValuableBookRepository` を `upsert` 命名へ変更する

先に DTO を正規化してから repository 境界を動かすことで、責務の移動先が明確になる。

### 生成ロジック

`ValuableBookFactory` は維持してよい。
ただし将来的には `Search` 側で正規化済みの論文情報を受け取る前提に寄せ、`ValuableBookFactory` が source 固有の生配列を深く解釈しなくて済む状態を目指す。

そのため、先に `CreateFavoriteInputData` を source 固有の配列構造から切り離す。

### 推奨する DTO 形状

`CreateFavoriteInputData` は少なくとも以下のような「正規化済みの論文情報」に寄せる。

```php
final class CreateFavoriteInputData
{
    /**
     * @param list<string> $authors
     * @param list<string> $categories
     * @param array<string, mixed> $rawPayload
     */
    public function __construct(
        public readonly string $userPublicUuid,
        public readonly string $source,
        public readonly string $sourcePaperId,
        public readonly string $title,
        public readonly ?string $abstract,
        public readonly ?string $publishedAt,
        public readonly ?string $updatedAtSource,
        public readonly ?string $pdfUrl,
        public readonly ?string $absUrl,
        public readonly ?string $primaryCategory,
        public readonly array $authors,
        public readonly array $categories,
        public readonly array $rawPayload,
    ) {
    }
}
```

この形にすると `ValuableBookFactory` は `links` や `authors[].name` のような source 固有表現を解釈せずに済む。
HTTP Request や将来の `Search` 側 mapper が source ごとの差分を吸収し、UseCase 以降へは正規化済みデータだけを渡す。

なお `rawPayload` は監査やデバッグ用途で保持したいなら残してよいが、Domain がその構造を解釈しないことを原則とする。

### Favorite を独立させない理由

現時点の要件では、

- お気に入り登録された論文しか保存しない
- 外部論文を全件同期するわけではない
- 論文保存はお気に入り機能のための付随処理

という前提なので、保存とお気に入りのライフサイクルはほぼ一致している。

したがって今は `Favorite` を別集約として切り出すよりも、

- `User` 解決責務の分離
- repository 契約の見直し
- 論文入力の正規化責務の整理

を優先する方が費用対効果が高い。

将来、以下が増えたときに `Favorite` の独立を再検討する。

- `favoritedAt`
- `memo`
- `tag`
- `folder`
- favorite 固有の重複禁止や状態遷移ルール

## Search

### 方針

- 一旦実装は後回しにする
- 将来的には `Search` ドメインで外部 API 差分を吸収する
- `ValuableBook` 側で source ごとの ACL を重ねて持たず、`Search` が共通モデルへ正規化する
- `ValuableBook` の入力 DTO は先に正規化済み形状へ寄せておき、後から `Search` に責務を移しやすくする

### 将来像

- `Search` は arXiv など外部ソースの生データを、このアプリケーションで扱いやすい共通モデルへ変換する
- その共通モデルを `ValuableBook` や他ユースケースが利用する
- これにより、複数データソース対応時の差分を `Search` に閉じ込められる

### 想定するモデル

- `SearchQuery`
- `PaperSource`
- `PaperSummary`
- `SearchResult`

### 想定する構造

- source ごとの gateway を `Infrastructure/Search` に置く
- 外部 API の XML/JSON は source ごとの mapper で共通モデルへ変換する
- `Application` や他ドメインには生配列を渡さない

## 推奨クラス構成

現時点では以下の構成を目標にする。

```text
app/
  Application/
    Auth/
      Dto/
        AuthenticatedUser.php
      UseCase/
        LoginUseCase.php
    Shared/
      Transaction/
        TransactionManager.php
    ValuableBook/
      Dto/
        CreateFavoriteInputData.php
      Port/
        FavoriteStore.php
        UserIdResolver.php
      UseCase/
        CreateFavoriteUseCase.php
  Domain/
    Auth/
      Entity/
        UserAuthEntity.php
      Exception/
        InvalidCredentialsException.php
    User/
      ValueObject/
        UserId.php
        UserPublicUuid.php
    ValuableBook/
      Entity/
        ValuableBookEntity.php
      Factory/
        ValuableBookFactory.php
      Repository/
        ValuableBookRepository.php
      ValueObject/
        ValuableBookIdentity.php
        SourcePaperId.php
        ValuableBookSource.php
        ValuableBookTitle.php
    Search/
      Entity/
        PaperSummary.php
        SearchResult.php
      ValueObject/
        SearchQuery.php
        PaperSource.php
      Repository/
        PaperSearchGateway.php
  Infrastructure/
    Auth/
    Shared/
      Transaction/
        DbTransactionManager.php
    User/
      DbUserIdResolver.php
    ValuableBook/
      DbFavoriteStore.php
    Search/
```

## 実装順

### Phase 1. Auth の整理

作業:

1. `AuthenticatedUser` を追加する
2. `LoginUseCase` の戻り値を変更する
3. `LoginResource` を廃止する
4. `LoginResponder` を `authId` ベースで動かす
5. DTO 名を `AuthenticatedUser` で統一する
6. `LoginAction` の例外処理を明示的に終了させる

期待効果:

- 認証成功結果の意味が明確になる
- HTTP 層との接続が自然になる
- セッション開始処理の責務配置が明確になる

### Phase 2. User 解決責務の分離

作業:

1. `User` ドメインを追加する
2. `UserPublicUuid -> UserId` の解決 port を作る
3. `CreateFavoriteUseCase` からそれを利用する
4. `FavoriteStore` を Application port として作る
5. `DbFavoriteStore` から `User` モデル解決責務を外す
6. `TransactionManager` を導入する

期待効果:

- `ValuableBook` が `User` 永続化事情を知らなくて済む
- コンテキスト境界が明確になる
- ユースケースのトランザクション境界が明確になる

### Phase 3. ValuableBook の契約整理

作業:

1. `ValuableBookRepository::save()` を `upsert()` など実装意図が伝わる名前へ変更する
2. `FavoriteStore` の引数を `UserId` ベースへ寄せる
3. `CreateFavoriteInputData` を正規化済み形状へ変更する
4. `ValuableBookFactory` から source 固有の配列解釈責務を減らす
5. `CreateFavoriteUseCase` を transaction port 経由の構成へ整理する

期待効果:

- repository 契約と実装が一致する
- ユースケースの意図が読みやすくなる
- 将来 `Search` へ正規化責務を移しやすくなる
