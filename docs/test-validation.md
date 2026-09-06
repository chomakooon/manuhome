# テスト件数の実測記録

2026年9月7日（日本時間）、PRのコミット [`bcd8f9ca2595a2834aa4bf6f4030f9d7365dfc97`](https://github.com/chomakooon/manuhome/commit/bcd8f9ca2595a2834aa4bf6f4030f9d7365dfc97) を対象に再実行した。
作業中の変更が混ざらないよう、同コミットの `git archive` からテストと参照ソースを隔離コピーした。件数はテストランナーの終了集計に基づき、件数再確認の対象4ファイルについて、テストの追加・削除・変更は行っていない。

## 実行結果

| ファイル | ランタイム | 実行件数 | 成功 | 失敗 | スキップ |
|---|---|---:|---:|---:|---:|
| `tests/commerce.test.ts` | Node.js 24.20.0 | 21 | 21 | 0 | 0 |
| `tests/manga.test.ts` | Node.js 24.20.0 | 5 | 5 | 0 | 0 |
| `tests/services.test.ts` | Node.js 24.20.0 | 10 | 10 | 0 | 0 |
| **Node単体テスト合計** | **Node.js 24.20.0** | **36** | **36** | **0** | **0** |
| `tests/stripe-signature.deno.ts` | Deno 2.9.6 | 2 | 2 | 0 | 0 |
| **両ランナーの合計** | | **38** | **38** | **0** | **0** |

Nodeの各実行は `cancelled 0`、`todo 0`、終了コード0。Denoも全2件が成功し、終了コード0だった。Stripe署名テストは合成データの署名検証であり、Stripe APIへの通信や実決済を実行しない。

**「単体36件」は `npm test` の対象である `tests/*.test.ts` の件数。** `*.deno.ts` はこのパターンに含まれず、`npm run test:stripe` で別途実行する。その2件を加えた値が38件となる。同コミットで「commerce 12、manga 6、services 7、Stripe 2、合計27件」という内訳は再現しなかった。

## 再現コマンド

上記コミットの独立したチェックアウトで、各ファイルを個別実行する。

```sh
npx --yes node@24.20.0 --test --test-reporter=tap tests/commerce.test.ts
npx --yes node@24.20.0 --test --test-reporter=tap tests/manga.test.ts
npx --yes node@24.20.0 --test --test-reporter=tap tests/services.test.ts
npx --yes deno@2.9.6 test --node-modules-dir=none tests/stripe-signature.deno.ts
```

Node側はまとめての実行でも確認した。

```sh
npx --yes node@24.20.0 --test --test-reporter=tap tests/commerce.test.ts tests/manga.test.ts tests/services.test.ts
```

終了集計：

```text
# tests 36
# suites 0
# pass 36
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

Deno終了集計：

```text
running 2 tests from ./tests/stripe-signature.deno.ts
ok | 2 passed | 0 failed
```

実行コマンド、ランタイム、対象コミット、対象ファイルのSHA-256、全出力、終了コードは、ローカル監査資料の `review-count-commerce.log`、`review-count-manga.log`、`review-count-services.log`、`review-count-stripe.log`、`review-count-node-total.log` に保存した。保存先は `/Users/keita/manuhome-audit/`。

## 集計範囲とコミットの区別

- ブラウザーテストは `npm run test:e2e`、DBの権限・制約テストは `npm run test:db` で別に検証する。上記36件・38件には含めない。今回の件数再確認ではこれらを再実行していない。
- 再確認時のリモートPRブランチ `fix/security-and-functional-audit` は `bcd8f9ca2595a2834aa4bf6f4030f9d7365dfc97`。リモート `main` は `53e1c988d08b49f6498517d0143c33580e644870` であり、対象の4テストファイルはまだ存在しない。参照確認は `review-count-refs.log` に保存した。
- PRの検証には対象コミットを明示する。件数だけからレビュー側が参照したコミットや27件となった原因を特定することはできない。
