import Timer                        from 'easytimer.js';
import { deepEqual }                from 'fast-equals';
import cartesianProduct             from 'fast-cartesian';
import Subgraph                     from './../objects/subgraph';
import QueueArray                   from './../objects/queueArray';
import Iterator                     from './../objects/iterator';
import CandidateList                from './../objects/candidateList';
import Keyword                      from './../objects/keyword';
import backwardLight                from './backwardLight';
import getInstanceProperties        from './../queries/getInstanceProperties';
import { performance }              from 'perf_hooks';

/**
 * return k candidate subgraphs that connect input keyword nodes
 * @param {Array}     keywordNodes            array of keyword objects
 * @param {Integer}   k                       the number of possible top-k subgraphs to output
 * @param {Integer}   dmax                    max distance
 * @param {Integer}   intermLimit             number of iteration after finding candidate(s) subgraphs
 * @param {Integer}   itrmax                  max number of global iterations
 * @param {Integer}   timeout                 query timeout in minutes
 * @param {Integer}   sameNeighborPropNumber  number of properties to take with min cost in case of neighbors having same nodes but different edges
 * @param {String}    target                  query target
 * @param {Function}  request                 function to issue queries
 * @param {boolean}   instanceOf           property to use for expressing instanceof , rdf:type or in case of wikidata wdt:P31
 */

export default async function backwardFinal(keywords,k,dmax,intermLimit,itrmax,timeout,sameNeighborPropNumber,target,request, instanceOf){

  const timer = new Timer();
  timer.start();


  //store keyword array as in origin , will be needed by query generation
  let keywordNodesForQuery = Array.from(keywords);

  // list of candidates for final output
  let candidateList = new CandidateList();

  //global array of queues
  const queueArray = new QueueArray();

  // just to count number of iterations reached for all exploration
  let itCountGlobal = 0;

  // to count number of iteration after finding candidate(s) subgraphs
  // allow for a defined number of iterations to early terminate
  let itCountInterm = 0;

  /**
   * special cases check e.g., userKeywords empty
   **********************************************
   */

  // check if user keywords is empty , only target defined
  if(keywords.every(keyword => keyword.type == 'target')){
    timer.stop();
    const subgraph = new Subgraph('subgraph', keywords[0].correspondingNode);
    let node1 = subgraph.createNode(keywords[0].correspondingNode.nodeURI);
    subgraph.addNode(node1);
    subgraph.query = subgraph.subgraphToQuery(keywordNodesForQuery, target, false);
    candidateList.list.push(subgraph);
    return {candidate: candidateList, termination: 'user keywords empty', iterations: itCountGlobal};
  }

  //check if we have special case where target + at least one keyword from same class
  let sameClassTarget = false ;
  if(keywords.some(keyword => {return keyword.correspondingNode.nodeURI == target && keyword.type != 'target';})){sameClassTarget = true;}

  //if target and at least one keyword from the same class keep just target class for exploration to avoid multiple explorations of same paths
  let keywordNodes ;
  if(sameClassTarget == true){
    keywordNodes = keywords.filter(keyword => {return keyword.correspondingNode.nodeURI != target || keyword.type == 'target';});
  }
  else{
    keywordNodes = keywords ;
  }

  /**
   *
   ***********************************************
   */

  // initialize priority queue for each keyword
  keywordNodes.forEach(keyword => {
    keyword.initializeQueue();
    queueArray.queueArray.push(keyword.queue);
  });

  // just to count redundant subgraphs found during exploration
  let sameSubgraphCount = 0;

  // explore graph
  //while not all queues in global array are empty
  while(!queueArray.allQueuesEmpty()){

    if(timer.getTimeValues().seconds >= timeout){
      timer.stop();
      return {candidate: candidateList, termination: 'timeout', iterations: itCountGlobal};
    }

    if(itCountGlobal >= itrmax){
      return {candidate: candidateList, termination: 'max iterations exceeded', iterations: itCountGlobal};
    }

    // increment global iteration counter just for display purpose
    itCountGlobal ++ ;

    //increment intermediate iterations counter
    itCountInterm ++ ;

    // take minimum cost iterator from all keyword queues
    let iterator = queueArray.minCostIterator(),
        currentNode = iterator.current,
        keyword = iterator.origin,
        neighbors = currentNode.neighbors;

    if(iterator.distance > dmax){
      timer.stop();
      return {candidate: candidateList, termination: 'max distance reached', iterations: itCountGlobal};
    }

    // if iterator list for each keyword exists,  add iterator to corresponding keyword list
    // otherwise create list of iterators first, then add to corresponding keyword list

    currentNode.iterators.size == 0 ?
    currentNode.createKeywordIteratorList(keywordNodes, iterator, keyword) : currentNode.iterators.get(keyword).push(iterator);

    //if current node has neighbors
    if(neighbors.length > 0){

      const t0 = performance.now();

      //check if we are at keyword of type instance to consider only the existing (incoming/outgoing) properties of the concrete instance
      if(iterator.visited == null && keyword.type == 'instance'){

        const time1 = performance.now();
        // retrieve list of instance direct properties
        let query = getInstanceProperties(keyword.userKeyword);
        const propList = await request(query);

        neighbors = neighbors.filter(neighbor => propList.some(prop => prop.p == neighbor.edge.edgeURI));

        const time2 = performance.now();

      }

      // filter some DBpedia specific properties
      //neighbors = neighbors.filter(node => node.edge.edgeURI != 'http://dbpedia.org/ontology/wikiPageWikiLink');
      //neighbors = neighbors.filter(node => node.edge.edgeURI != 'http://dbpedia.org/ontology/thumbnail');

      //from neighbors having same nodes but different edges select just one with minimum cost
      let selectedNeighbors = [] ;
      let groups = new Map();
      neighbors.forEach(node => {
        if(!groups.has(node.AdjNode.nodeURI)){
          groups.set(node.AdjNode.nodeURI, [] );
        }
        groups.get(node.AdjNode.nodeURI).push(node);
      });

      groups.forEach((value, key) => {
        let group = groups.get(key);
        //take one property with min cost
        //let min = group.reduce((res, node) => {return (node.edge.edgeCost < res.edge.edgeCost) ? node : res; });
        //selectedNeighbors.push(min);

        //take first k properties with min cost
        group.sort((a, b) => (a.edge.edgeCost > b.edge.edgeCost) ? 1 : -1);
        let mins = group.slice(0, sameNeighborPropNumber);
        mins.forEach(min => {
          selectedNeighbors.push(min);
        });

      });

      // add current node neighbors to corresponding keyword queue, filter already explored ones.
      let filteredNeighbors = selectedNeighbors.filter(node => iterator.elementOfPath(iterator, node.AdjNode) == false);

      filteredNeighbors.forEach(node => {
        keywordNodes.filter(item => item == keyword)[0].queue.push(new Iterator(keyword, node.AdjNode, node.edge, iterator, iterator.distance + 1, iterator.iteratorCost + node.edge.edgeCost));
      });
      const t1 = performance.now();
    }

    // remove current node iterator from corresponding keyword queue
    keywordNodes.filter(item => item == keyword)[0].queue.pop();

    // check if connecting node found
    if(currentNode.isConnectingNode()){

      const t01 = performance.now();

      const allIterators = currentNode.gatherIterators(keyword,iterator);

      // produce all possible paths combination doing a cartesian product between all iterator lists (corresponding all keywords)
      /* Example
      ** for allIterators = [ [it1 , it2] , [it3 , it4 ] ]
      ** cartesians
       [
          [ it1 , it3 ],
          [ it1 , it4 ],
          [ it2 , it3 ],
          [ it2 , it4 ]
       ]
      */
      const pathCombis = cartesianProduct(allIterators);

      const t11 = performance.now();

      // generate path fragments from the connecting node to each keyword for each possible combination
      const generatedPaths = pathCombis.map(iteratorArray => {
        return iteratorArray.map(iterator => iterator.generatePath(iterator));
      });

      // transform to subgraph objects with cost and connecting node
      for (let j = 0; j < generatedPaths.length; j++) {
        let subgraphnbEdges = 0;
        const subgraph = new Subgraph('subgraph', currentNode);
        let countedEdges = [];
        const t02 = performance.now();
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
        const t12 = performance.now();

        //set subgraph edge number
        subgraph.nbEdges = subgraphnbEdges;

        //boolean to decide if accept subgraph in special case ( target + at least one keyword from same class ) : accept only subgraphs having self loop in target class
        let selfLoopTarget = sameClassTarget && subgraph.checkSelfLoopTarget(target) ;

        if(selfLoopTarget || !sameClassTarget){

          let newKeywordNodes = [];

          //check if subgraph has loops
          let selfloops = subgraph.checkSelfLoop();

          keywordNodes.forEach(keyword => {
            let node = subgraph._nodes.get(keyword.correspondingNode.nodeURI);
            newKeywordNodes.push(new Keyword(node, keyword.type, keyword.userKeyword));
          });

          // remove edges that do not disconnect the subgraph keywords, if they exist (not bridges)
          const t03 = performance.now();
          const sub = backwardLight(newKeywordNodes, selfloops);
          const t13 = performance.now();

          // check if the subgraph was already added to candidate list: avoid redundant candidates

          const subgraphEdges = sub.getSubgraphEdges();

          let samegraph = false ;

          const t04 = performance.now();
          if(candidateList.list.length > 0){
            candidateList.list.forEach(element => {
              const elementEdges = element.getSubgraphEdges();
              if(deepEqual(subgraphEdges, elementEdges)){
                sameSubgraphCount ++ ;
                samegraph = true ;
              }
            });
          }
          const t14 = performance.now();

          // check if subgraph produces empty result
          let result = [];
          if(samegraph == false){
            const t005 = performance.now();
            let generatedQuery = sub.subgraphToQuery(keywordNodesForQuery,target, true, instanceOf);
            const t015 = performance.now();

            const t05 = performance.now();
            result = await request(generatedQuery);
            const t15 = performance.now();
          }

          if(samegraph == false && result.length != 0){
            candidateList.list.push(sub);

            // sort node candidate paths in ascending order based on the global cost
            candidateList.sortList();

            //pick best k candidates or lower
            candidateList.list = candidateList.list.slice(0,k);
          }

          //reset intermediate count
          itCountInterm = 0 ;
        }

      }
    }
    // compare candidate subgraph with highest score with lowest remaining iterator to ensure that no better graphs could be generated if we continue the exploration
    // Example: imagine we want to generate top-3 subgraphs, and we already have:
    // cost subgraph 1 = 3 , cost subgraph 2 = 4 , and cost subgraph 3 = 10 if we stop here without comparing with remaining iterators it might be that another graph with lower cost could still be generated

    if(candidateList.list.length == k){
      timer.stop();
      //const heighestCost = candidateList.getHighest(),
      //      lowestCost   = iterator.iteratorCost ;
      return {candidate: candidateList, termination: 'k reached' , iterations: itCountGlobal};
      //}
    }

    // TODO: think about it again : early termination condition: time, all iterations, intermediate itr, subgraph cost factor
    /*if(itCountInterm > intermLimit){
        timer.stop();
        return {candidate: candidateList, termination: 'limit intermediate count reached', iterations: itCountGlobal};
      }*/
  }

  timer.stop();
  // return for each connecting node the possible paths and their costs
  return {candidate: candidateList, termination: 'queue empty, no more paths to explore', iterations: itCountGlobal};
}
