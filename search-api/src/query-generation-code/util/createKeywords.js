import Keyword                            from './../objects/keyword';


/**
 * create keyword objects from all nodes and assign types to keywords
 *
 * @param {Array}       graphNodes        list of node objects corresponding to keywords and target
 */

export default function createKeywords(graphNodes) {

  // array to gather all keywords
  let keywordNodes = [];

  // create keyword objects from all nodes and assign types to keywords
  graphNodes.forEach(node => {
    const keyword = new Keyword(node.node, node.type, node.userKeyword);
    keywordNodes.push(keyword);
  });

  return keywordNodes;

}
