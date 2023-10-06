import config from '../config/config';
import { description, image, name, sameAs } from '../services/enrichmentService';
import Query, { OperationExpression, ValuesPattern } from '../utils/Query';
import ConnectingNode from './ConnectingNode';
import Connection from './Connection';

class Result {
	constructor(iri, disabled = true, score = 0, subgraphs = []) {
		this.iri = iri;
		this.disabled = disabled;
		this.score = score;
		this.subgraphs = subgraphs;
	}

	addSubgraph = (index, disabled, score, subgraph) => {
		this.disabled &= disabled;
		this.score += score;
		if (!disabled) {
			this.subgraphs[index] = subgraph;
		}
	};

	copyRaw = () => {
		return new Result(this.iri, this.disabled, this.score, this.subgraphs);
	};

	enrichBaseResult = async (target) => {
		await this.addBaseInfo(target);
		this.connectionCount = this.subgraphs.filter((subgraph) => subgraph !== null).length;
		await this.addConnectionInfo(target, 1, 1);
	};

	enrichDetailResult = async (target, maxConnections) => {
		await this.addBaseInfo(target);
		await this.addDetailInfo();
		await this.addConnectionInfo(target, this.subgraphs.length, config.results.maxBindings);
		this.maxConnections = maxConnections;
	};

	addBaseInfo = async (target) => {
		this.name = await name(this.iri);
		this.description = await description(this.iri);
		this.type = {
			iri: target,
			name: await name(target)
		};
	};

	addDetailInfo = async () => {
		this.link = await sameAs(this.iri);
		this.image = await image(this.iri);
	};

	addConnectionInfo = async (target, connectionLimit, bindingLimit) => {
		this.connections = [];
		for (let i = 0; i < this.subgraphs.length && this.connections.length < connectionLimit; i++) {
			const subgraph = this.subgraphs[i];
			const variableNames = getVariableNames(subgraph, target);
			if (variableNames.length > 0) {
				const subgraphBindings = await determineBindings(subgraph, variableNames, this.iri, bindingLimit);
				const node = subgraph.nodes.get(target);
				const connectingNodes = ConnectingNode.connectingNodes(node, undefined, false, target, subgraphBindings);
				for (const connectingNode of connectingNodes) {
					await connectingNode.enrichNode();
				}
				const connection = new Connection(connectingNodes, subgraphBindings.length);
				this.connections[i] = connection;
			}
		}
		delete this.subgraphs;
	};
}

const determineBindings = async (subgraph, variableNames, iri, bindingLimit) => {
	const query = new Query(subgraph.query);
	variableNames.forEach((variableName) => {
		query.addVariableExpression(OperationExpression.createBlankNodeFilteredVariable(variableName));
	});
	query.addWhereClause(ValuesPattern.createBinding('target', iri));
	query.limit(bindingLimit);
	return await query.execute();
};

const getVariableNames = (subgraph, target) => {
	const nodeVariables = [];
	subgraph?.nodes.forEach((node) => {
		if (node.nodeURI !== target) {
			nodeVariables.push(Query.variableName(node.nodeURI, target, false));
		}
		if (node.neighbors.some((neighbor) => neighbor.AdjNode.nodeURI === node.nodeURI)) {
			nodeVariables.push(Query.variableName(node.nodeURI, target, true));
		}
	});
	return nodeVariables;
};

export default Result;
