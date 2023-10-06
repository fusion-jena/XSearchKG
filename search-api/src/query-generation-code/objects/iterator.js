/*
 * object that keeps track of the visited nodes during graph exploration
 *
 *
 *
 */

export default class Iterator{

  /**
   * @param {Keyword}     origin        start node (keyword)
   * @param {Node}        current       current visited node
   * @param {Edge}        edge          edge that leads to the current node
   * @param {Iterator}    visited       previous iterator with visited node
   * @param {Integer}     distance      distance between origin and current node
   * @param {Integer}     cost          cost of path corresponding to iterator
   */
  constructor(origin, current, edge , visited, distance, iteratorCost) {
    this._origin = origin;
    this._current = current;
    this._edge = edge;
    this._visited = visited;
    this._distance = distance;
    this._iteratorCost = iteratorCost;
  }

  //getter

  get origin(){
    return this._origin;
  }

  get current(){
    return this._current;
  }

  get edge(){
    return this._edge;
  }

  get visited(){
    return this._visited;
  }

  get distance(){
    return this._distance;
  }

  get iteratorCost(){
    return this._iteratorCost;
  }

  /**
   * returns true if the adjacent element has already been explored
   * @param {Iterator}    iterator     iterator to examine
   * @param {Node}        node         adjacent node which existance in the path will be checked
   */

  elementOfPath(iterator, node){
    let visited = false;
    /*//self Loop
    if(iterator._current == node){
      visited = true ;
      return visited;
    }*/
    //cycle (if no self loop check, allows for selfloop just one time)
    while(iterator._visited !== null){
      if(iterator._visited._current == node){
        visited = true ;
        break;
      }
      iterator = iterator._visited;
    }
    return visited;
  }

  /**
   * from the iterator go backward and generate path between keyword and current node in this form:
   * path =[cost, current node, visited nodes .., keyword]
   * @param {Iterator}    iterator     iterator that will be explored backward to generate path
   *
   */

  generatePath(iterator){
    const path = [];
    const cost = iterator._iteratorCost;
    while(iterator._visited !== null){
      path.push({node: iterator._current , edge: iterator._edge});
      iterator = iterator._visited;
    }
    // // TODO: type and userkeyword attributes added for new version of query generation (add cycles to backward light needs to be done)
    path.push({node: iterator._origin.correspondingNode , edge: iterator._edge , type: iterator._origin.type, userKeyword:iterator._origin.userKeyword});
    path.unshift(cost);
    return path;
  }

}
