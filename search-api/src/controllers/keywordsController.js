import { name } from '../services/enrichmentService';
import { generateKeywords } from '../services/suggestionService';
import RequestConfig from '../utils/RequestConfig';

const keywordsController = async (req, res, next) => {
	try {
		const { label, keywords } = new RequestConfig(req);
		console.debug(new Date().toISOString().slice(11, -1), 'keywords', { label, keywords });
		if (!label && !keywords ) {
			return [];
		}
		const generatedKeywords = await generateKeywords(label, keywords);
		const enrichedKeywords = await enrichKeywords(generatedKeywords);
		const sortedKeywords = enrichedKeywords.sort((a, b) => a.label.localeCompare(b.label));
		return res.json(sortedKeywords);
	} catch (error) {
		next(error);
	}
};

const enrichKeywords = async (keywords) => {
	const enrichedKeywords = keywords.map(async (keyword) => ({
		label: await name(keyword.iri) + ' (' + await name(keyword.type) + ')',
		value: {
			iri: keyword.iri,
			type: keyword.type
		}
	}));
	return Promise.all(enrichedKeywords);
};

export default keywordsController;
