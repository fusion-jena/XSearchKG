import config from '../config/config';
import generateSubgraphs from '../services/queryService';
import rankedResults from '../services/resultService';
import RequestConfig from '../utils/RequestConfig';

const resultsController = async (req, res, next) => {
	try {
		const { target, keywords, k, disabledConnections, page } = new RequestConfig(req);
		console.debug(new Date().toISOString().slice(11, -1), 'results', { target, keywords, k, disabledConnections, page });
		const subgraphs = await generateSubgraphs(target, keywords, k) || [];
		const results = await rankedResults(target, keywords, k, disabledConnections);
		const resultsPage = pagedResultCopies(results, page, config.results.pageSize);
		for (const result of resultsPage) {
			await result.enrichBaseResult(target);
		}
		return res.json({
			connectionCount: subgraphs.length - disabledConnections.length,
			results: resultsPage,
			resultStart: page * config.results.pageSize,
			resultCount: results.length
		});
	} catch (error) {
		next(error);
	}
};

const pagedResultCopies = (results, page, pageSize) => {
	// make a copy in order to not enrich the raw results in the cache
	return results.slice(pageSize * page, pageSize * (page + 1))
		.map(result => result.copyRaw());
};

export default resultsController;
