import generateSubgraphs from '../services/queryService';
import rankedResults from '../services/resultService';
import RequestConfig from '../utils/RequestConfig';

const resultController = async (req, res, next) => {
	try {
		const { target, keywords, k, disabledConnections, iri } = new RequestConfig(req);
		console.debug(new Date().toISOString().slice(11, -1), 'result', {target, keywords, k, disabledConnections, iri});
		const subgraphs = await generateSubgraphs(target, keywords, k);
		const results = await rankedResults(target, keywords, k, disabledConnections);
		const result = results.find(result => result.iri === iri)
			?.copyRaw();
		if (!result) {
			return res.status(404).json({ message: 'No result found' });
		}
		await result.enrichDetailResult(target, subgraphs.length)
		return res.json(result);
	} catch (error) {
		next(error);
	}
};

export default resultController;
