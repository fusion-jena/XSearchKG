import Minheap    from 'heap';

/*
 * object that represent an array of queue objects
 *
 *
 *
 */

export default class QueueArray{

  /**
   * @param {Array}      queueArray    array of queues
   */
  constructor() {
    this._queueArray = [];
  }

  //getter

  get queueArray(){
    return this._queueArray;
  }

  /**
   * returns the minimum cost iterator from all keyword queues
   *
   */

  minCostIterator(){
    const minArray = new Minheap(function(a, b) {
      return a.iteratorCost- b.iteratorCost;
    });
    this._queueArray.filter(queue => !(queue.empty())).forEach( queue => minArray.push(queue.peek()));
    return minArray.peek();
  }

  /**
   * returns true if all queues in the global queue array are empty
   *
   */

  allQueuesEmpty(){
    let allempty = true;
    this._queueArray.forEach(queue => {
      if(!(queue.empty())){
        allempty = false;
      }
    });
    return allempty;
  }
}
