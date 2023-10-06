import ConnectingNode from '../models/ConnectingNode';
import Connection from '../models/Connection';
import Query, { blankNodeCheckedPrefix } from '../utils/Query';
import { type } from './enrichmentService';

const generateConnections = async (subgraphs, keywords, target) => {
	const connections = [];
	for (const subgraph of subgraphs) {
		const node = subgraph.nodes.get(target);
		const binding = await pseudoBinding(keywords, target);
		const connectingNodes = ConnectingNode.connectingNodes(node, undefined, false, target, binding);
		for (const connectingNode of connectingNodes) {
			await connectingNode.enrichNode();
		}
		const connection = new Connection(connectingNodes);
		connections.push(connection);
	}
	return connections;
};

const pseudoBinding = async (keywords, target) => {
	const binding = {};
	for (const keyword of keywords) {
		const keywordType = await type(keyword.iri);
		const variableName = blankNodeCheckedPrefix + Query.variableName(keywordType, target, false);
		binding[variableName] = keyword.iri;
	}
	return [ binding ];
}

export default generateConnections;
