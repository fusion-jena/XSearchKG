import config from '../config/config';

const cacheHeader = (req, res, next) => {
	res.set('Cache-Control', 'public, max-age=' + config.server.cacheDurationInSeconds);
	res.set('Expires', new Date(Date.now() + config.server.cacheDurationInSeconds * 1000).toUTCString());
	next();
};

export default cacheHeader;
