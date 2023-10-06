import cacheWrapper from '../middleware/cacheWrapper';
import config from '../config/config';
import queryGeneration from '../query-generation-code/main';
import ThrottledRequests from '../query-generation-code/util/ThrottledRequests';

const generateSubgraphs = async (target, keywords, k) => {
	try {
		// copy config into a new object in order to avoid interference with other requests
		const extendedConfig = { 
			...config.queryGeneration, 
			target: target, 
			userKeywords: keywords, 
			k: k 
		};
		const subgraphs = await cacheWrapper(queryGeneration, 'queryGeneration')(extendedConfig);
		return subgraphs;
	} catch (error) {
		return [];
	}
};

export const tripleStoreRequest = async (query, endpoint) => await cacheWrapper(async (query, endpoint) => {
	const request = ThrottledRequests(endpoint);
	return await request(query);
}, 'executeSparqlQuery')(query, endpoint);

export default generateSubgraphs;
