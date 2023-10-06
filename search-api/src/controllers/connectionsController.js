import generateConnections from '../services/connectionService';
import generateSubgraphs from '../services/queryService';
import RequestConfig from '../utils/RequestConfig';

const connectionsController = async (req, res, next) => {
	try {
		const { target, keywords, k } = new RequestConfig(req);
		console.debug(new Date().toISOString().slice(11, -1), 'connections', { target, keywords, k });
		const subgraphs = await generateSubgraphs(target, keywords, k);
		const response = res.json({
			connections: await generateConnections(subgraphs, keywords, target)
		});
		return response;
	} catch (error) {
		next(error);
	}
};

export default connectionsController;
