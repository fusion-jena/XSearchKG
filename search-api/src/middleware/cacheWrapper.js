import NodeCache from 'node-cache';
import config from '../config/config';

const cache = new NodeCache();

const cacheWrapper = (originalMethod, originalMethodName) => (...args) => {
	const cacheKey = originalMethodName + JSON.stringify(args);
	if (cache.has(cacheKey)) {
		return cache.get(cacheKey);
	}
	const result = originalMethod(...args);
	cache.set(cacheKey, result, config.server.cacheDurationInSeconds);
	return result;
};

export default cacheWrapper;
