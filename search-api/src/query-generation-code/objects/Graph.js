import Node                             from './node';
import cloneDeep                        from 'lodash/cloneDeep';

/*
 * object representing RDF graph as a collection of nodes.
 *
 *
 *
 */

export default class Graph {

  /**
   * @param {String}    label     name of the graph
   */

  constructor(label) {
    this._label = label;
    //graph vertices (array of node objects) as a map nodeUri => node object
    this._nodes = new Map();
  }

  // getter

  get label(){
    return this._label;
  }

  get nodes(){
    return this._nodes;
  }

  //setter

  set label(value){
    this._label = value;
  }

  set nodes(value){
    this._nodes = value;
  }

  /**
   * add node object to the graph
   * @param {Node}    node    vertex to be added to the graph
   */

  addNode(node){
    if(!(this._nodes.has(node.nodeURI))){
      this._nodes.set(node.nodeURI,node);
    }
  }

  /**
   * if node does not exist at all create it, otherwise get it from the nodes map
   * @param {String}    nodeURI   URI of node object
   */

  createNode(nodeURI){
    return !(this._nodes.has(nodeURI)) ? new Node(nodeURI) : this._nodes.get(nodeURI);
  }

  /**
   * add edge between two nodes to the graph
   * @param {Node}           node1          edge start node
   * @param {Node}           node2          edge end node
   * @param {Edge}           edge           edge connecting node 1 and node 2
   * for the graph exploration i consider the RDF graph as an undirected graph.
   * but the information about edge direction (edgeStart, edgeEnd) will be needed by query generation.
   */

  addEdge(node1, node2, edge){
    if(node1.nodeURI == node2.nodeURI){
      this._nodes.get(node1.nodeURI).neighbors.push({AdjNode: node1, edge: edge});
    }
    else{
      this._nodes.get(node1.nodeURI).neighbors.push({AdjNode: node2, edge: edge});
      this._nodes.get(node2.nodeURI).neighbors.push({AdjNode: node1, edge: edge});
    }
  }

  /**
   * remove node object from the graph
   * @param {String}    nodeURI    URI of vertex to be removed from the graph
   */

  removeNode(nodeURI){
    // remove the node from the neighbors of connected nodes
    this.nodes.forEach((value, key, map) => {
      if(value.neighbors.some(element => element.AdjNode.nodeURI == nodeURI)){
        value.neighbors = value.neighbors.filter(neighbor => neighbor.AdjNode.nodeURI != nodeURI);
      }
    });

    // remove the node from the nodes list
    this.nodes.forEach((value, key, map) => {
      if(key == nodeURI){
        map.delete(key);
      }
    });

    // return new subgraph
    return this ;

  }

  /**
   * create new graph with removed node
   * @param {String}    nodeURI    URI of vertex to be removed from the graph
   */

  removeNodeNewGraph(nodeURI){
    let graph = cloneDeep(this);
    graph.label = 'graph-without-node';
    return graph.removeNode(nodeURI);
  }

  /**
   * remove edge from the graph
   * @param {Edge}    edge    edge to be removed from the graph
   */

  removeEdge(edge){
    // remove the edge
    this.nodes.forEach((value, key, map) => {
      if(value.neighbors.some(element => element.edge.getEdgeInfo() == edge.getEdgeInfo())){
        value.neighbors = value.neighbors.filter(neighbor => neighbor.edge.getEdgeInfo() != edge.getEdgeInfo());
      }
    });

    // return new subgraph
    return this ;

  }

  /**
   * create new graph with removed edge
   * @param {Edge}    edge    edge to be removed from the graph
   */

  removeEdgeNewGraph(edge){
    let graph = cloneDeep(this);
    graph.label = 'graph-without-edge';
    return graph.removeEdge(edge);
  }

}
