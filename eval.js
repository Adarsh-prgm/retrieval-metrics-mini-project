// Evaluate keyword and semantic retrieval using MRR and Recall@10.
const fs = require('fs');

// Load the test queries and their relevant post IDs.
function loadTestSet(path) {
  const lines = fs.readFileSync(path, 'utf8').trim().split(/\r?\n/).slice(1);

  return lines.map((line) => {
    const [query, ids] = line.split(',');
    return {
      query,
      correctIds: ids.split(';').map(Number)
    };
  });
}

const testSet = loadTestSet('test-set.csv');
const results = JSON.parse(fs.readFileSync('search-results.json', 'utf8'));

// Return the reciprocal of the 1-based rank of the first relevant result.
// Return 0 when none of the relevant IDs appears in the ranked list.
function reciprocalRank(rankedIds, correctIds) {
  const index = rankedIds.findIndex((id) => correctIds.includes(id));
  return index === -1 ? 0 : 1 / (index + 1);
}

// Return the 1-based rank of the first relevant result, or null on a miss.
function rankOf(rankedIds, correctIds) {
  const index = rankedIds.findIndex((id) => correctIds.includes(id));
  return index === -1 ? null : index + 1;
}

let keywordTotalRR = 0;
let semanticTotalRR = 0;
let keywordHits = 0;
let semanticHits = 0;

const totalQueries = testSet.length;
if (totalQueries === 0) {
  throw new Error('The test set is empty; cannot calculate retrieval metrics.');
}

const tableRows = [];

for (const item of testSet) {
  const { query, correctIds } = item;
  const queryResults = results[query];

  if (!queryResults || !Array.isArray(queryResults.keyword) || !Array.isArray(queryResults.semantic)) {
    throw new Error(`Missing or invalid search results for query: ${query}`);
  }

  const keywordResults = queryResults.keyword;
  const semanticResults = queryResults.semantic;

  const keywordRR = reciprocalRank(keywordResults, correctIds);
  const semanticRR = reciprocalRank(semanticResults, correctIds);

  keywordTotalRR += keywordRR;
  semanticTotalRR += semanticRR;

  if (keywordRR > 0) keywordHits++;
  if (semanticRR > 0) semanticHits++;

  const keywordRank = rankOf(keywordResults, correctIds);
  const semanticRank = rankOf(semanticResults, correctIds);

  tableRows.push({
    query,
    keywordRank: keywordRank === null ? 'miss' : keywordRank,
    semanticRank: semanticRank === null ? 'miss' : semanticRank
  });
}

const keywordMRR = keywordTotalRR / totalQueries;
const semanticMRR = semanticTotalRR / totalQueries;
const keywordRecall = keywordHits / totalQueries;
const semanticRecall = semanticHits / totalQueries;

console.log('| Query | Keyword rank | Semantic rank |');
console.log('|---|---|---|');

for (const row of tableRows) {
  console.log(`| ${row.query} | ${row.keywordRank} | ${row.semanticRank} |`);
}

console.log(
  `| **Summary** | **MRR ${keywordMRR.toFixed(2)} · Recall@10 ${keywordRecall.toFixed(2)}** | **MRR ${semanticMRR.toFixed(2)} · Recall@10 ${semanticRecall.toFixed(2)}** |`
);
