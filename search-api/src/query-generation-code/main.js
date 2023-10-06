import 'cross-fetch/polyfill';
import * as fs                            from 'fs';
import request                            from './conn';

import generateGraph                      from './util/generateGraph';
import getGraphNodes                      from './util/getGraphNodes';
import createKeywords                     from './util/createKeywords';
import backwardFinal                      from './graph-traversal/backwardFinal';

const queryGeneration = async (Config) => {

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Graph Creation (should be created once for all queries) XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  let datasetFolder = Config.summary+Config.datasetID+ '/';

  // generate graph object from summary graph file
  const graph = await generateGraph(fs, Config.metric, Config.datasetID, datasetFolder);

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Graph Exploration XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

  //get nodes corresponding to user keywords from graph
  let graphNodes = await getGraphNodes(graph,request,Config.userKeywords,Config.target);

  //create keyword objects from all nodes and assign types to keywords
  let keywordNodes = createKeywords(graphNodes);

  // generate top-k connecting subgraphs
  const candidateList = await backwardFinal(keywordNodes,Config.k,Config.dmax,Config.intermLimit, Config.itrmax, Config.timeout, Config.sameNeighborPropNumber,Config.target,request, Config.instanceOf);

  //translate subgraphs to queries
  candidateList.candidate.list.forEach(subgraph => {
    subgraph.query = subgraph.subgraphToQuery(keywordNodes,Config.target, false,Config.instanceOf);
  });

  /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Empty nodes Iterators (apply after each query)XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX */

graph.nodes.forEach((value,key,map) => {
  value.iterators.clear();
});

const util = require('util');

  console.log(util.inspect(candidateList.candidate.list, { depth: 2, colors: true }));

  return candidateList.candidate.list;
}

export default queryGeneration;
