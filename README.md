# Retrieval Metrics Mini Project

This project evaluates keyword search and semantic search against the same 10 test queries using Mean Reciprocal Rank (MRR) and Recall@10.

## Run the evaluation

No database, API keys, or third-party packages are required. Run:

```bash
node eval.js
```

## Evaluation Results and Observations

The program prints the following comparison table:

```text
| Query | Keyword rank | Semantic rank |
|---|---|---|
| my redis cache keeps showing old data | 8 | 1 |
| how do I add semantic search to a table I already have | miss | 2 |
| redis or memcached for caching | 1 | 2 |
| why did my query get slower after I added an index | miss | 1 |
| what does ACID actually guarantee | 2 | 1 |
| how do I keep my postgres online while changing the schema | 6 | 3 |
| my background jobs stop after every deploy | miss | 2 |
| how do I let my database accept more writes per second | 4 | 1 |
| sql or nosql for a new product | 1 | 3 |
| why does my redis memory keep climbing | miss | 2 |
| **Summary** | **MRR 0.30 · Recall@10 0.60** | **MRR 0.67 · Recall@10 1.00** |
```

Semantic search performs better overall on both metrics: its MRR is 0.67 compared with 0.30 for keyword search, and its Recall@10 is 1.00 compared with 0.60. Keyword search ranks the correct result higher for “redis or memcached for caching” and “sql or nosql for a new product”; both queries contain specific technology or product terms that can match directly. Semantic search wins on the other eight queries, especially questions describing a problem or asking for an explanation in natural language. Its results show that it can recognize the meaning and intent of a query even when the wording does not exactly match the relevant post. A team may still keep keyword search because exact-term queries can sometimes rank better with it, so combining both approaches can provide complementary results.

## How the metrics work

- **Reciprocal Rank (RR):** (1 / rank) of the first relevant result, or 0 when no relevant result appears in the top 10.
- **Mean Reciprocal Rank (MRR):** the average reciprocal rank across all test queries.
- **Recall@10:** the fraction of queries with at least one relevant result in the top 10.

The ranked result fixtures are in `search-results.json`, and the expected relevant IDs are in `test-set.csv`. The script evaluates those provided results; it does not run live database searches.
