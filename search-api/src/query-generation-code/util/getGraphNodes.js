import generateKeywordType          from './../generate-query-results/generateKeywordType';


/**
 * for each keyword (instance) extract corresponding class (if not already a class )
 * store corresponding node together with its user keyword type
 *
 * @param {Function}    graph          graph from where we get nodes corresponding to user keywords
 * @param {Function}    request        function to issue queries
 * @param {Array}       userKeyword    user keyword URIs array
 * @param {String}      target         target URI
 */

export default async function getGraphNodes(graph,request,userKeyword,target) {

  //array to store retrieved nodes from the graph, to be able to create keyword object for each node afterwards
  let graphNodes = [];

  // for each keyword (instance) extract corresponding class (if not already a class )
  for (var i = 0; i < userKeyword.length; i++) {
    let node;
    let typeInfo = true ;
    if(!userKeyword[i].hasOwnProperty('type')){typeInfo = false; }
    const type = await generateKeywordType(request, userKeyword[i], typeInfo);
    // get corresponding node from graph
    if(type != 'class'){
      // check if corresponding class already added (in case of user keywords instances of same class)
      if(!graphNodes.some(node => node.node.nodeURI == type)){
        node = graph._nodes.get(type);
        //store node together with its keyword type
        graphNodes.push({node: node, type: 'instance', userKeyword: []});
      }
    }
    else{
      node = graph._nodes.get(userKeyword[i].iri);
      graphNodes.push({node: node, type: 'class', userKeyword: []});
    }
    // add user keyword
    graphNodes.forEach(node => {
      if(node.node.nodeURI == type){
        node.userKeyword.push(userKeyword[i].iri);
      }
      if(node.node.nodeURI == userKeyword[i].iri){
        node.userKeyword.push(userKeyword[i].iri);
      }
    });
  }

  //get corresponding node for the target and add to nodes array and assign it a type
  let node = graph._nodes.get(target);
  graphNodes.push({node:node, type:'target', userKeyword: target});

  return graphNodes;

}
