import { deepEqual }                from 'fast-equals';
import cartesianProduct             from 'fast-cartesian';
import Subgraph                     from './../objects/subgraph';
import QueueArray                   from './../objects/queueArray';
import Iterator                     from './../objects/iterator';

/**
 * return first candidate subgraph that connect input keyword nodes
 * @param {Array}     keywordNodes      array of keyword objects
 * @param {Array}     selfloops         list of edges objects with selfloops
 */

export default function backwardLight(keywordNodes, selfloops){

  //global array of queues
  const queueArray = new QueueArray();

  //list of possible subgraphs
  let candidateSubgraphs = [] ;

  let connNodeFound = false ;

  // initialize priority queue for each keyword
  keywordNodes.forEach(keyword => {
    keyword.initializeQueue();
    queueArray.queueArray.push(keyword.queue);
  });

  // just to count number of iterations reached
  let itCount = 0;

  // explore graph
  //while not all queues in global array are empty
  while(!queueArray.allQueuesEmpty()){

    // increment iteration counter just for display purpose
    itCount ++;

    // take minimum cost iterator from all keyword queues
    const iterator = queueArray.minCostIterator(),
          currentNode = iterator.current,
          keyword = iterator.origin,
          neighbors = currentNode.neighbors;

    // if iterator list for each keyword exists,  add iterator to corresponding keyword list
    // otherwise create list of iterators first, then add to corresponding keyword list

    currentNode.iterators.size == 0 ?
    currentNode.createKeywordIteratorList(keywordNodes, iterator, keyword) : currentNode.iterators.get(keyword).push(iterator);

    //if current node has neighbors
    if(neighbors.length > 0){

      // add current node neighbors to corresponding keyword queue, filter already explored ones.
      let filteredNeighbors = neighbors.filter(node => iterator.elementOfPath(iterator, node.AdjNode) == false);
      filteredNeighbors.forEach(node => {
        keywordNodes.filter(item => item == keyword)[0].queue.push(new Iterator(keyword, node.AdjNode, node.edge, iterator, iterator.distance + 1, iterator.iteratorCost + node.edge.edgeCost));
      });
    }


    // remove current node iterator from corresponding keyword queue
    keywordNodes.filter(item => item == keyword)[0].queue.pop();

    // check if connecting node found
    if(currentNode.isConnectingNode()){

      const allIterators = currentNode.gatherIterators(keyword,iterator);

      const pathCombis = cartesianProduct(allIterators);


      // generate path fragments from the connecting node to each keyword for each possible combination
      const generatedPaths = pathCombis.map(iteratorArray => {
        return iteratorArray.map(iterator => iterator.generatePath(iterator));
      });

      // transform to subgraph objects with cost and connecting node
      for (let j = 0; j < generatedPaths.length; j++){
        let subgraphnbEdges = 0;
        const subgraph = new Subgraph('subgraph', currentNode);
        let countedEdges = [];

        /* // TODO: HOW TO ADD CYCLES IN THIS CASE
      //store target path fragment
      let targetFragment = generatedPaths[j].find(element => element[element.length - 1].type == 'target') ;

      //for each keyword store path from keyword to target and store it in the corresponding subgraph (for query generation purpose)
      generatedPaths[j].forEach(pathFragment =>{
        if(pathFragment[pathFragment.length -1].type !== 'target'){
          // take out cost from target path fragment
          let targetFragmentNoCost = Array.from(targetFragment);
          targetFragmentNoCost.shift();
          //skip first element (cost) and start adding nodes from keyword path to target path to have a combination : [keyword - nodes - connecting node -target]
          for (let i = 1; i < pathFragment.length; i++) {
            targetFragmentNoCost.unshift(pathFragment[i]);
          }
          subgraph.pathTotarget.push({keyword:pathFragment[pathFragment.length -1].node.nodeURI ,path: targetFragmentNoCost})
        }
      });
*/
        generatedPaths[j].forEach(pathFragment =>{
          for (let i = 1; i < pathFragment.length; i++){
            let node1 = subgraph.createNode(pathFragment[i].node.nodeURI);
            subgraph.addNode(node1);

            // since we are not in a keyword start node
            if(pathFragment[i].edge !== null){
              let node2 = subgraph.createNode(pathFragment[i+1].node.nodeURI);
              subgraph.addNode(node2);

              // if edge not already added (case of some keywords have same class)
              if(!subgraph.edgeAdded(pathFragment[i].edge)){
                subgraph.addEdge(node1, node2, pathFragment[i].edge);
                subgraphnbEdges ++ ;
              }

              // avoiding double adding cost of the same edges (coming from different iterators)
              if(!countedEdges.some(element => deepEqual(element, pathFragment[i].edge))){
                countedEdges.push(pathFragment[i].edge);
                subgraph.cost+= pathFragment[i].edge.edgeCost;
              }
            }

            // if path fragment contains only keyword start node
            else if(pathFragment.length == 2) {
              subgraph.cost+= pathFragment[0];
            }
          }
        });

        //set subgraph edge number
        subgraph.nbEdges = subgraphnbEdges;

        if(selfloops.length > 0){
          selfloops.forEach(element => {
            if(!subgraph.edgeAdded(element)){
              if(subgraph.nodes.has(element.edgeStart.nodeURI)){
                subgraph.addEdge(element.edgeStart, element.edgeEnd, element);
                subgraph.cost += element.edgeCost ;
                subgraph.nbEdges += 1 ;
              }
            }
          });
        }

        candidateSubgraphs.push(subgraph);

      }


      connNodeFound = true ;

    }

    if(connNodeFound){
      break;
    }


  }

  candidateSubgraphs.sort((a, b) => (a.cost > b.cost) ? 1 : -1);
  return candidateSubgraphs[0];

}
