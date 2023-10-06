import { name } from '../services/enrichmentService';
import { generateTargets } from '../services/suggestionService';
import RequestConfig from '../utils/RequestConfig';

const targetsController = async (req, res, next) => {
	try {
		const { label, values } = new RequestConfig(req);
		console.debug(new Date().toISOString().slice(11, -1), 'targets', { label, values });
		if (!label && !values) {
			return [];
		}
		const targets = await generateTargets(label, ...values);
		const enrichedTargets = await enrichTargets(targets);
		const sortedTargets = enrichedTargets.sort((a, b) => a.label.localeCompare(b.label));
		return res.json(sortedTargets);
	} catch (error) {
		next(error);
	}
};

const enrichTargets = async (targets) => {
	const enrichedTargets = targets.map(async (target) => ({
		label: await name(target.type),
		value: target.type,
	}));
	return Promise.all(enrichedTargets);
};

export default targetsController;
