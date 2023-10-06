import config from '../config/config';
import cacheWrapper from '../middleware/cacheWrapper';
import Query from '../utils/Query';
import Result from '../models/Result';
import generateSubgraphs from './queryService';

const rankedResults = async (target, keywords, k, disabledConnections) => await cacheWrapper(async (target, keywords, k, disabledConnections) => {
	const subgraphs = await generateSubgraphs(target, keywords, k) || [];
	if (subgraphs.length == 0) {
		return [];
	}
	const maxSubgraphCost = calcMaxSubgraphCost(subgraphs);
	const mergedResults = [];
	for (let i = 0; i < subgraphs.length; i++) {
		if (config.results.considerDisabledSubgraphsForRanking || !disabledConnections.includes(i)) {
			const subgraph = subgraphs[i];
			const disabled = disabledConnections.includes(i);
			await mergeSubgraphResults(mergedResults, i, subgraph, maxSubgraphCost, disabled);
		}
	}
	const filteredResults = mergedResults.filter(result => !result.disabled);
	const sortedResults = filteredResults.sort((a, b) => b.score - a.score);
	return sortedResults;
}, 'rankedResults')(target, keywords, k, disabledConnections);

const calcMaxSubgraphCost = (subgraphs) => (1 + config.queryGeneration.metricBetaValue) * Math.max(...subgraphs.map(subgraph => subgraph.nbEdges));

const mergeSubgraphResults = async (mergedResults, index, subgraph, maxSubgraphCost, disabled) => {
	const score = maxSubgraphCost - subgraph.cost;
	const query = new Query(subgraph.query);
	const subgraphResults = await query.execute();
	for (const subgraphResult of subgraphResults) {
		let result = mergedResults.find(result => result.iri === subgraphResult.target);
		if (!result) {
			result = new Result(subgraphResult.target);
			mergedResults.push(result);
		}
		result.addSubgraph(index, disabled, score, subgraph);
	}
};

export default rankedResults;
