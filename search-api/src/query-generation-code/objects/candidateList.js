/*
 * global candidate subgraphs list
 *
 *
 *
 */

export default class CandidateList{


  constructor() {
    // list of candidates
    this._list = [];
  }

  // getter

  get list(){
    return this._list;
  }

  // setter
  set list(value){
    this._list = value;
  }

  /**
     * sort list of candidate path object based on their score
     *
     */

  sortList(){
    this._list.sort((a, b) => (a.cost > b.cost) ? 1 : -1);
  }

  /**
     * get score of candidate path objects (score of k-element)
     *
     */

  getHighest(){
    return this._list[this._list.length-1].cost ;
  }
}
