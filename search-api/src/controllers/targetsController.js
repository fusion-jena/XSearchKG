import { name } from '../services/enrichmentService';
import { generateTargets } from '../services/suggestionService';
import RequestConfig from '../utils/RequestConfig';

const targetsController = async (req, res, next) => {
	try {
		const { label, target } = new RequestConfig(req);
		console.debug(new Date().toISOString().slice(11, -1), 'targets', { label, target });
		const generatedTargets = await generateTargets(label, target);
		const enrichedTargets = await enrichTargets(generatedTargets);
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
