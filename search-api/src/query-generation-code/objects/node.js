import Minheap    from 'heap';

/*
 * object that represent a node in the graph and its connections using adjacency list
 *
 *
 *
 */

export default class Node{

  /**
   * @param {String}      nodeURI       URI of the RDF concept
   */
  constructor(nodeURI) {
    this._nodeURI = nodeURI;
    //adjacency list that holds for each vertex a list of vertices that are connected to it and the name of the edge that constitutes the relationship.
    this._neighbors = [];
    //Map (keyword => iterators queue) to store the iterator that visits the node and find out if the node was visited by all keywords iterators (connecting node).
    this._iterators = new Map();
    //this._nodeCost =  nodeCost;
  }

  // getter

  get nodeURI(){
    return this._nodeURI;
  }

  get neighbors(){
    return this._neighbors;
  }

  get iterators(){
    return this._iterators;
  }

  get nodeCost(){
    return this._nodeCost;
  }

  //setter

  set neighbors(value){
    this._neighbors = value;
  }

  /**
     * Create for each keyword an iterators list.
     * @param {Array}          keywordNodes   Array of keyword objects
     * @param {Iterator}       iterator       iterator to be first added to the iterators list
     * @param {Keyword}        keyword        keyword for which iterators list will be added (as key in iterators map)
     *
     */

  createKeywordIteratorList(keywordNodes,iterator, keyword){
    keywordNodes.forEach(keyword => {
      const queue = new Minheap(function(a, b) {
        return a.iteratorCost- b.iteratorCost;
      });

      this._iterators.set(keyword, queue);
    });
    this._iterators.get(keyword).push(iterator);
  }

  /**
     * returns true if a node is connecting all keyword nodes
     *
     */

  isConnectingNode(){
    let connecting = true;
    let nullEdgecount = 0 ;
    for(let [key, value] of this._iterators){
      if(this._iterators.get(key).empty()){
        connecting = false;
        break ;
      }
      // TODO: if we have only target (one keywords e.g., give all countries target will be country , in this case consider one node as connecting node)

      // case of keyword/target from same class
      //count iterators in node with edge = null and iterators heap contains just one element
      //if this number is 2 or more means that this one node is the same and the algorithm did not quit it (in case of selfloop)
      //it should not be considered as a connecting node since it ends up considering the node without its selfloop
      if(this._iterators.size > 1){
        if(value.size() == 1 && value.nodes[0].edge == null){
          nullEdgecount ++ ;
        }
        if(nullEdgecount > 1){
          connecting = false;
          break ;
        }
      }
    }
    /*this._iterators.forEach((value, key, map) => {
        if(this._iterators.get(key).empty()){
          connecting = false;
        }
      });*/
    return connecting;
  }

  /**
     * gather all keyword iterator arrays in a single array
     * from the iterators queue corresponding to the current node and current keyword,
     * consider only the iterator just added to avoid redundant paths after combination
     * @param {Keyword}          keyword      keyword origin of current iterator
     * @param {Iterator}         iterator     current iterator of minimum cost
     */

  gatherIterators(keyword,iterator){
    const allIterators = [];
    this._iterators.forEach((value, key, map) => {
      //from the iterators queue corresponding to the current keyword,
      //consider only the iterator just added to avoid redundant paths after combination
      if(key == keyword){
        let iteratorsArray = [];
        iteratorsArray.push(iterator);
        allIterators.push(iteratorsArray);
      }

      else {
        let iteratorsArray = Array.from(this._iterators.get(key).nodes);
        allIterators.push(iteratorsArray);
      }

    });

    return allIterators;
  }
}
