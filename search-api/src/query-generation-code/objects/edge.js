/*
 * object that represent an edge between two nodes in the graph
 *
 *
 *
 */

export default class Edge{

  /**
   * @param {String}      edgeURI        URI of the RDF property
   * @param {Node}        edgeStart      URI of the subject
   * @param {Node}        edgeEnd        URI of the object
   * @param {Integer}     edgeCost       cost of an edge
   */
  constructor(edgeURI,edgeStart,edgeEnd,edgeCost) {
    this._edgeURI = edgeURI;
    this._edgeStart = edgeStart;
    this._edgeEnd = edgeEnd;
    this._edgeCost = edgeCost ;
  }

  // getter

  get edgeURI(){
    return this._edgeURI;
  }

  get edgeStart(){
    return this._edgeStart;
  }

  get edgeEnd(){
    return this._edgeEnd;
  }

  get edgeCost(){
    return this._edgeCost;
  }

  //setter

  set edgeCost(value){
    this._edgeCost = value;
  }

  /**
     * get only essential edge information to campare edges
     * return string
     */

  getEdgeInfo(){
    return JSON.stringify({edgeURI: this.edgeURI, edgeStart: this.edgeStart.nodeURI, edgeEnd: this.edgeEnd.nodeURI});
  }


}
