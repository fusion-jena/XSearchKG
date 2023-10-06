import Minheap    from 'heap';
import Iterator   from './iterator';

/*
 * object representing a keyword from which the graph exploration could start
 *
 *
 *
 */

export default class Keyword{

  /**
   * @param {Node}        correspondingNode     graph node corresponding to the keyword
   * @param {String}      type                  type of the keyword (class, instance or target)
   * @param {String}      userKeyword           URI of userKeyword
   */
  constructor(correspondingNode, type, userKeyword) {
    this._correspondingNode = correspondingNode;
    this._type = type;
    this._userKeyword = userKeyword;

    //priority queue object corresponding to the keyword
    this._queue = new Minheap(function(a, b) {
      return a.iteratorCost- b.iteratorCost;
    });
  }

  // getter

  get correspondingNode(){
    return this._correspondingNode;
  }

  get type(){
    return this._type;
  }

  get userKeyword(){
    return this._userKeyword;
  }

  get queue(){
    return this._queue;
  }

  /**
     * initialize keyword queue with initial iterator
     *
     */

  initializeQueue(){
    const initIterator = new Iterator(this, this._correspondingNode, null, null, 0, 0);
    this._queue.push(initIterator);
  }

}
