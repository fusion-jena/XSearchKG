import { edgeName, isBlankNode, name } from '../services/enrichmentService';
import Query, { blankNodeCheckedPrefix } from '../utils/Query';

class ConnectingNode {
	constructor(node, edge, incomingNode, isIncomingLoop, target, subgraphBindings) {
		this.type = {
			iri: node.nodeURI
		};
		const hasOutgoingLoop = node.neighbors.some(neighbor => neighbor.AdjNode.nodeURI === node.nodeURI) && !isIncomingLoop;
		const variableName = Query.variableName(node.nodeURI, target, hasOutgoingLoop);
		const blankNodeCheckedVariableName = blankNodeCheckedPrefix + variableName;
		this.values = subgraphBindings?.map(subgraphBinding => subgraphBinding[blankNodeCheckedVariableName])
			.map(iri => ({ iri: iri }));
		this.edge = {
			iri: edge.edgeURI,
			inverseDirection: edge.edgeStart.nodeURI === node.nodeURI,
			isIncomingLoop: isIncomingLoop
		};
		this.connectingNodes = ConnectingNode.connectingNodes(node, incomingNode, isIncomingLoop, target, subgraphBindings);
	}

	static connectingNodes = (node, incomingNode, isIncomingLoop, target, subgraphBindings) => {
		const connectingNodes = [];
		const loopNeighbor = node.neighbors.find(neighbor => neighbor.AdjNode.nodeURI === node.nodeURI)
		if (!isIncomingLoop && loopNeighbor) {
			const connectingNode = new ConnectingNode(node, loopNeighbor.edge, incomingNode, true, target, subgraphBindings);
			connectingNodes.push(connectingNode);
		} else {
			const nextNeighbors = node.neighbors.filter(neighbor => neighbor.AdjNode.nodeURI !== incomingNode?.nodeURI && neighbor.AdjNode.nodeURI !== node.nodeURI);
			for (const neighbor of nextNeighbors) {
				const connectingNode = new ConnectingNode(neighbor.AdjNode, neighbor.edge, node, false, target, subgraphBindings);
				connectingNodes.push(connectingNode);
			}
		}
		return connectingNodes;
	};

	enrichNode = async () => {
		this.type.name = await name(this.type.iri);
		for (const value of this.values) {
			value.name = await name(value.iri);
			value.hidden = !value.iri && await isBlankNode(this.type.iri);
		}
		if (this.edge.isIncomingLoop) {
			this.edge.name = await edgeName(this.edge.iri, false, this.type.iri) + ' or ' + await edgeName(this.edge.iri, true, this.type.iri);
		} else {
			this.edge.name = await edgeName(this.edge.iri, this.edge.inverseDirection, this.type.iri);
		}
		for (const connectingNode of this.connectingNodes) {
			await connectingNode.enrichNode();
		}
	};
}

export default ConnectingNode;
