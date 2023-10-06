import config from '../config/config';

class RequestConfig {
	constructor(req) {
		this.keywords = keywords(req);
		this.target = target(req);
		this.k = k(req);
		this.disabledConnections = disabledConnections(req);
		this.iri = iri(req);
		this.page = page(req);
		this.label = label(req);
		this.values = values(req);
	}
}

const keywords = (req) => req.query.keywords?.split(',')
	.map(keyword => ({ iri: keyword })) || [];

const target = (req) => req.query.target;

const k = (req) => Number(req.query.k) || config.queryGeneration.k;

const disabledConnections = (req) => req.query.disabledConnections?.split(',')
	.map(disabledConnection => Number(disabledConnection)) || [];

const iri = (req) => req.query.iri;

const page = (req) => Number(req.query.page) || 0;

const label = (req) => req.query.label;

const values = (req) => req.query.values?.split(',') || [];

export default RequestConfig;
