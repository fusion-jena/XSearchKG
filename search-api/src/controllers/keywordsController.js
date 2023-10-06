import { name } from '../services/enrichmentService';
import { generateKeywords } from '../services/suggestionService';
import RequestConfig from '../utils/RequestConfig';

const keywordsController = async (req, res, next) => {
	try {
		const { label, values } = new RequestConfig(req);
		console.debug(new Date().toISOString().slice(11, -1), 'keywords', { label, values });
		if (!label && !values) {
			return [];
		}
		const keywords = await generateKeywords(label, ...values);
		const enrichedKeywords = await enrichKeywords(keywords);
		const sortedKeywords = enrichedKeywords.sort((a, b) => a.label.localeCompare(b.label));
		return res.json(sortedKeywords);
	} catch (error) {
		next(error);
	}
};

const enrichKeywords = async (keywords) => {
	const enrichedKeywords = keywords.map(async (keyword) => ({
		label: await name(keyword.iri) + ' (' + await name(keyword.type) + ')',
		value: keyword.iri,
	}));
	return Promise.all(enrichedKeywords);
};

export default keywordsController;
