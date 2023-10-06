import Graph            from  './Graph';
import Keyword          from './keyword';
import { deepEqual }    from 'fast-equals';

/*
 * object that represent a candidate subgraph
 *
 *
 *
 */

export default class Subgraph extends Graph{

  /**
    * @param {String}       label               name of the subgraph
    * @param {Node}         connectingNode      connecting node of candidate paths
    */

  constructor(label, connectingNode) {
    super(label);
    this._connectingNode = connectingNode;
    // cost of the candidate subraph (sum of graph edges)
    this._cost = 0;
    this._query = '' ;
    this._nbEdges = 0 ;
    // // TODO:  not know if i keep it in future for query generation
    this.pathTotarget = [] ;

  }

  // getter

  get connectingNode(){
    return this._connectingNode;
  }

  get cost(){
    return this._cost;
  }

  get query(){
    return this._query;
  }

  get nbEdges(){
    return this._nbEdges;
  }

  // setter

  set cost(value){
    this._cost = value;
  }

  set query(value){
    this._query = value;
  }

  set nbEdges(value){
    this._nbEdges = value;
  }

  /**
   * return array of subgraph edges information (used to check if subgraphs are the same)
   *
   */

  getSubgraphEdges(){
    let edges = [];
    this.nodes.forEach(value => {
      value.neighbors.forEach(neighbor => {
        // get only information needed (URIs : edge, start and end nodes )
        const neighborInfo = JSON.stringify({edgeURI: neighbor.edge.edgeURI, edgeStart: neighbor.edge.edgeStart.nodeURI, edgeEnd: neighbor.edge.edgeEnd.nodeURI});
        if(!edges.some(element => element == neighborInfo)){
          edges.push(neighborInfo);
        }
      });
    });
    edges.sort();
    return edges;
  }

  /**
    * check if edge already added
    *
    */

  edgeAdded(edge){
    let added = false ;
    let edgeInfo = JSON.stringify({edgeURI: edge.edgeURI, edgeStart: edge.edgeStart.nodeURI, edgeEnd: edge.edgeEnd.nodeURI});
    for(let [key, value] of this.nodes){
      if(value.neighbors.length > 0){
        if(value.neighbors.some(element =>
          edgeInfo == JSON.stringify({edgeURI: element.edge.edgeURI, edgeStart: element.edge.edgeStart.nodeURI, edgeEnd: element.edge.edgeEnd.nodeURI})))
        {
          added = true ;
          break ;
        }
      }
    }
    return added ;
  }

  /**
    * check if subgraph contains a selfloop in target
    *
    */

  checkSelfLoopTarget(target){
    let check = false ;
    if(this.nodes.get(target).neighbors.some(node => node.AdjNode.nodeURI == target)){check = true ;}
    return check ;
  }

  /**
     * check if subgraph contains selfloops, return where
     *
     */

  checkSelfLoop(){
    let selfloops = [] ;
    this.nodes.forEach((value, key) => {
      if(value.neighbors.some(node => node.AdjNode.nodeURI == key)){
        let loop = value.neighbors.find(node => node.AdjNode.nodeURI == key);
        selfloops.push(loop.edge);
      }
    });
    return selfloops ;
  }

  /**
     * translate subgraph to corresponding query
     * combination between keyword done with AND
     * @param {Array}     keywordNodes         array of keywords
     * @param {String}    target               target URI
     * @param {boolean}   emptyCheck           to define if we only generate the query to check if the result set is empty (with LIMIT) or it is the final query
     * @param {boolean}   instanceOf           property to use for expressing instanceof , rdf:type or in case of wikidata wdt:P31
     */

  subgraphToQueryOld(keywordNodes,target, emptyCheck, instanceOf){

    //get target URI (use as a variable without special characters)
    let  targetVariable = target.replace(/[^a-zA-Z0-9]/g, '');

    let query =
       `SELECT DISTINCT ?${targetVariable}
       WHERE
       {
         `;

    // to make sure that we do not add triples twice because the same edge is stored in both node and its neighbor
    let addedTriple = [];

    //get keywords that are of type instances (they will have a special handeling afterwards)
    let instances = [];
    keywordNodes.forEach( keyword => {
      if(keyword.type == 'instance'){
        instances.push(keyword);
      }
    });


    this.nodes.forEach((value, key) => {
      // create rdf:type triples
      query += `
            ?${key.replace(/[^a-zA-Z0-9]/g, '')} ${instanceOf} <${key}> .
            `;

      //create other triples
      value.neighbors.forEach(neighbor => {
        let triple = '';
        let instanceCheck = false ;


        // if instance need to get its userKeyword
        if(instances.some(element => element.correspondingNode.nodeURI == key)){
          let instance = instances.find(element => element.correspondingNode.nodeURI == key);

          //if current node is start node
          if(instance.correspondingNode.nodeURI == neighbor.edge.edgeStart.nodeURI){

            //for each element in user keyword array create triple

            // if only one user keyword instance of the current node consider just one
            if(instance.userKeyword.length == 1){
              // if self loop consider both directions with union (or)
              if(neighbor.edge.edgeStart.nodeURI == neighbor.edge.edgeEnd.nodeURI){
                triple += `
                  { <${instance.userKeyword[0]}> <${neighbor.edge.edgeURI}> ?${neighbor.edge.edgeEnd.nodeURI.replace(/[^a-zA-Z0-9]/g, '')} .}
                  UNION
                  {?${neighbor.edge.edgeStart.nodeURI.replace(/[^a-zA-Z0-9]/g, '')} <${neighbor.edge.edgeURI}> <${instance.userKeyword[0]}> .}
                  `;
              }
              else {
                //if selfloop avoid adding triple that constraint also non selfloop relations with keyword value : e.g., target: continent , keyword: france , avoir france ?in continent for subgraph with selfloop
                if(value.neighbors.some(element => element.AdjNode.nodeURI == key)){
                  triple += '';
                }
                else {
                  triple += `
                <${instance.userKeyword[0]}> <${neighbor.edge.edgeURI}> ?${neighbor.edge.edgeEnd.nodeURI.replace(/[^a-zA-Z0-9]/g, '')} .
                `;
                }
              }
            }

            // if only multiple userkeywords instance of the current node consider their union (or)
            else {
              instance.userKeyword.forEach((userKeyword,i) => {
                if(neighbor.edge.edgeStart.nodeURI == neighbor.edge.edgeEnd.nodeURI){
                  triple += `
                  { <${userKeyword}> <${neighbor.edge.edgeURI}> ?${neighbor.edge.edgeEnd.nodeURI.replace(/[^a-zA-Z0-9]/g, '')} .}
                  UNION
                  {?${neighbor.edge.edgeStart.nodeURI.replace(/[^a-zA-Z0-9]/g, '')} <${neighbor.edge.edgeURI}> <${userKeyword}> .}
                  `;
                }
                else {
                  if(value.neighbors.some(element => element.AdjNode.nodeURI == key)){
                    triple += '';
                  }

                  else {triple += `
                { <${userKeyword}> <${neighbor.edge.edgeURI}> ?${neighbor.edge.edgeEnd.nodeURI.replace(/[^a-zA-Z0-9]/g, '')}  . }
                `;
                  if(i != instance.userKeyword.length - 1){
                    triple += 'UNION';
                  }
                  }
                }


              });
            }
          }

          //if current node is end node
          else{

            //for each element in user keyword array create triple
            if(instance.userKeyword.length == 1){
              if(value.neighbors.some(element => element.AdjNode.nodeURI == key)){
                triple += '';
              }
              else {
                triple += `
                ?${neighbor.edge.edgeStart.nodeURI.replace(/[^a-zA-Z0-9]/g, '')} <${neighbor.edge.edgeURI}> <${instance.userKeyword[0]}> .
                `;
              }
            }
            else {
              instance.userKeyword.forEach((userKeyword, i) => {
                if(value.neighbors.some(element => element.AdjNode.nodeURI == key)){
                  triple += '';
                }
                else {
                  triple += `
                {?${neighbor.edge.edgeStart.nodeURI.replace(/[^a-zA-Z0-9]/g, '')} <${neighbor.edge.edgeURI}> <${userKeyword}> .}
                `;
                  if(i != instance.userKeyword.length - 1){
                    triple += 'UNION';
                  }
                }

              });
            }
          }
          // change to true to mark that this node has also instances and avoid having generic triple for it (only with variable)
          instanceCheck = true ;
        }

        //if not an instance add the corresponding triple with variables without treating the instances values
        if(instanceCheck  == false) {
          triple = `
            ?${neighbor.edge.edgeStart.nodeURI.replace(/[^a-zA-Z0-9]/g, '')} <${neighbor.edge.edgeURI}> ?${neighbor.edge.edgeEnd.nodeURI.replace(/[^a-zA-Z0-9]/g, '')} .
            `;
        }

        // if not already there add triple to query
        if(!addedTriple.some(element => element == triple)){
          addedTriple.push(triple);
          query += triple;
        }

      });

    });

    if (emptyCheck == true){
      query += '} LIMIT 1';
    }
    else{
      query += '}';
    }


    return query ;


  }


  /**
      * translate subgraph to corresponding query
      * combination between keyword done with AND
      * @param {Array}     keywordNodes         array of keywords
      * @param {String}    target               target URI
      * @param {boolean}   emptyCheck           to define if we only generate the query to check if the result set is empty (with LIMIT) or it is the final query
      * @param {boolean}   instanceOf           property to use for expressing instanceof , rdf:type or in case of wikidata wdt:P31
      */

  subgraphToQuery(keywordNodes,target, emptyCheck, instanceOf){

    let query =
        `SELECT DISTINCT ?target
        WHERE
        {
          ?target ${instanceOf} <${target}> .
          `;

    // to make sure that we do not add triples twice because the same edge is stored in both node and its neighbor
    let addedTriple = [];

    //bind instance variables
    let instances = [];
    keywordNodes.forEach( keyword => {
      if(keyword.type == 'instance'){
        instances.push(keyword);
      }
    });

    this.nodes.forEach((value, key) => {

      //neighbors array
      let neighbors = value.neighbors ;
      // to check if selfloop in instance
      let selfloopcheck = false ;

      //check if instance and not target
      let instNotarget = instances.some(keyword => keyword.correspondingNode.nodeURI == key) && key != target ;
      if(instNotarget){
        let userKeyword = instances.find(keyword => keyword.correspondingNode.nodeURI == key).userKeyword ;
        // bind variables
        query += `VALUES ?${key.replace(/[^a-zA-Z0-9]/g, '')} {`;
        userKeyword.forEach(item => {
          query += `<${item}> `;
        });
        query+= `}
           `;

        // check if selfloop in instance
        selfloopcheck = neighbors.some(neighbor => neighbor.AdjNode.nodeURI == key);
        if(selfloopcheck){
          let selfloopedge = value.neighbors.find(neighbor => neighbor.AdjNode.nodeURI == key).edge.edgeURI ;
          let instanceCopyVar = `${key.replace(/[^a-zA-Z0-9]/g, '')}COPY`;
          //create self loop triple using a copy variable
          query += `?${key.replace(/[^a-zA-Z0-9]/g, '')} (<${selfloopedge}> | ^<${selfloopedge}>) ?${instanceCopyVar} .
             ` ;

          // filter selfloop node from neighbors
          neighbors = neighbors.filter(neighbor => neighbor.AdjNode.nodeURI != key);
        }
      }

      //check if instance and target (selfloop in target)
      let instANDtarget = instances.some(keyword => keyword.correspondingNode.nodeURI == key) && key == target ;
      if(instANDtarget){
        // bind variables
        let userKeyword = instances.find(keyword => keyword.correspondingNode.nodeURI == key).userKeyword;
        query += `VALUES ?${key.replace(/[^a-zA-Z0-9]/g, '')} {`;
        userKeyword.forEach(item => {
          query += `<${item}> `;
        });
        query+= `}
           `;

        let selfloopedge = value.neighbors.find(neighbor => neighbor.AdjNode.nodeURI == key).edge.edgeURI ;
        //create self loop triple using target variable
        query += `?${key.replace(/[^a-zA-Z0-9]/g, '')} (<${selfloopedge}> | ^<${selfloopedge}>) ?target .
           ` ;

        // filter target from neighbors
        neighbors = neighbors.filter(neighbor => neighbor.AdjNode.nodeURI != key);
      }

      // add rdf:type triples
      if(key != target){
        query += `
         ?${key.replace(/[^a-zA-Z0-9]/g, '')} ${instanceOf} <${key}> .
         `;
      }
      //add other triples
      neighbors.forEach(neighbor => {
        //selfloop and instance not target check for neighbor
        let selfloopcheckForNei = neighbor.AdjNode.neighbors.some(n => n.AdjNode.nodeURI == neighbor.AdjNode.nodeURI) && instances.some(keyword => keyword.correspondingNode.nodeURI == neighbor.AdjNode.nodeURI) && neighbor.AdjNode.nodeURI != target;
        let startNode = neighbor.edge.edgeStart.nodeURI,
            endNode = neighbor.edge.edgeEnd.nodeURI;
        //if not target all variable should get identifier (i)
        let startNodeVar =  `${startNode.replace(/[^a-zA-Z0-9]/g, '')}`,
            endNodeVar = `${endNode.replace(/[^a-zA-Z0-9]/g, '')}`;

        // if selfloop in instance make sure to relate to other neighbors with variable copy not bound one
        if(selfloopcheck){
          if(startNode == key){
            startNodeVar =  `${startNodeVar}COPY`;
          }
          if(endNode == key){
            endNodeVar = `${endNodeVar}COPY`;
          }
        }

        // if neigboor selfloop and instance make sure to relate to copy variable
        if(selfloopcheckForNei){
          if(startNode != key){
            startNodeVar =  `${startNodeVar}COPY`;
          }
          if(endNode != key){
            endNodeVar = `${endNodeVar}COPY`;
          }
        }

        //use the same variable on the whole query for target
        if(startNode == target){
          startNodeVar =  'target';
        }
        if(endNode == target){
          endNodeVar = 'target';
        }

        let triple = `
           ?${startNodeVar} (<${neighbor.edge.edgeURI}> | ^<${neighbor.edge.edgeURI}>) ?${endNodeVar} .
           `;

        // if not already there add triple to query
        if(!addedTriple.some(element => element == triple)){
          addedTriple.push(triple);
          query += triple;
        }

      });

    });

    if (emptyCheck == true){
      query += '} LIMIT 1';
    }
    else{
      query += '}';
    }
    return query ;
  }


  /**
      * translate subgraph to corresponding query
      * combination between keyword done with AND
      * works if // TODO: HOW TO ADD CYCLES IN THIS CASE solved
      * @param {String}    target               target URI
      * @param {boolean}   emptyCheck           to define if we only generate the query to check if the result set is empty (with LIMIT) or it is the final query
      * @param {boolean}   instanceOf           property to use for expressing instanceof , rdf:type or in case of wikidata wdt:P31
      */

  subgraphToQueryAND(target, emptyCheck, instanceOf){

    //get target URI (use as a variable without special characters)
    let  targetVariable = target.replace(/[^a-zA-Z0-9]/g, '');

    let query =
        `SELECT DISTINCT ?${targetVariable}
        WHERE
        {
          ?${targetVariable} ${instanceOf} <${target}> .
          `;

    this.pathTotarget.forEach((path, i) => {
      // avoid adding 2 times ${instanceOf} for redundant node in path
      let addedNodes = [];
      path.path.forEach(node => {
        //create rdf:type triples
        if(!addedNodes.some(item => item == node.node.nodeURI) && node.node.nodeURI != target){
          query += `
            ?${node.node.nodeURI.replace(/[^a-zA-Z0-9]/g, '')}${i} ${instanceOf} <${node.node.nodeURI}> .
            `;
          addedNodes.push(node.node.nodeURI);
        }

        //bind instance variables
        if(node.type == 'instance'){
          query += `VALUES ?${node.node.nodeURI.replace(/[^a-zA-Z0-9]/g, '')}${i} {`;
          node.userKeyword.forEach(item => {
            query += `<${item}> `;
          });
          query+= `}
              `;
        }
        //for all other nodes than target or keyword which just indicate start and end of path and have edge = null
        if(node.edge != null){
          let startNode = node.edge.edgeStart.nodeURI,
              endNode = node.edge.edgeEnd.nodeURI;
              //if not target all variable should get identifier (i)
          let startNodeVar =  `${startNode.replace(/[^a-zA-Z0-9]/g, '')}${i}`,
              endNodeVar = `${endNode.replace(/[^a-zA-Z0-9]/g, '')}${i}`;

              //use the same variable on the whole query for target : does not add variable identifier (i);
          if(startNode == target){
            startNodeVar =  startNode.replace(/[^a-zA-Z0-9]/g, '');
          }
          if(endNode == target){
            endNodeVar = endNode.replace(/[^a-zA-Z0-9]/g, '');
          }

          query += `?${startNodeVar} <${node.edge.edgeURI}> ?${endNodeVar} .
              `;
        }

      });
    });

    if (emptyCheck == true){
      query += '} LIMIT 1';
    }
    else{
      query += '}';
    }

    return query ;

  }


  /**
       * translate subgraph to corresponding query
       * combination between keyword done with OR
       * works if // TODO: HOW TO ADD CYCLES IN THIS CASE solved
       * @param {String}    target               target URI
       * @param {boolean}   emptyCheck           to define if we only generate the query to check if the result set is empty (with LIMIT) or it is the final query
       * @param {boolean}   instanceOf           property to use for expressing instanceof , rdf:type or in case of wikidata wdt:P31
       */

  subgraphToQueryOR(target, emptyCheck, instanceOf){

    //get target URI (use as a variable without special characters)
    let  targetVariable = target.replace(/[^a-zA-Z0-9]/g, '');

    let query =
         `SELECT DISTINCT ?${targetVariable}
         WHERE
         {
           ?${targetVariable} ${instanceOf} <${target}> .
           `;

    // triples from each path that directly connect with target
    let connTriples = [];

    this.pathTotarget.forEach((path, i) => {
      // avoid adding 2 times rdf:type for redundant node in path
      let addedNodes = [];
      path.path.forEach((node, idx) => {
        //create rdf:type triples
        if(!addedNodes.some(item => item == node.node.nodeURI) && node.node.nodeURI != target){
          query += `
             ?${node.node.nodeURI.replace(/[^a-zA-Z0-9]/g, '')}${i} ${instanceOf} <${node.node.nodeURI}> .
             `;
          addedNodes.push(node.node.nodeURI);
        }

        //bind instance variables
        if(node.type == 'instance'){
          query += `VALUES ?${node.node.nodeURI.replace(/[^a-zA-Z0-9]/g, '')}${i} {`;
          node.userKeyword.forEach(item => {
            query += `<${item}> `;
          });
          query+= `}
               `;
        }
        //for all other nodes than target or keyword which just indicate start and end of path and have edge = null
        if(node.edge != null){
          let startNode = node.edge.edgeStart.nodeURI,
              endNode = node.edge.edgeEnd.nodeURI;
          //if not target all variable should get identifier (i)
          let startNodeVar =  `${startNode.replace(/[^a-zA-Z0-9]/g, '')}${i}`,
              endNodeVar = `${endNode.replace(/[^a-zA-Z0-9]/g, '')}${i}`;

          //use the same variable on the whole query for target : does not add variable identifier (i);
          if(startNode == target){
            startNodeVar =  startNode.replace(/[^a-zA-Z0-9]/g, '');
          }
          if(endNode == target){
            endNodeVar = endNode.replace(/[^a-zA-Z0-9]/g, '');
          }

          // gather last triple that connects with target, to allow OR by union of all connecting triples
          if(idx == path.path.length -2){
            connTriples.push(`?${startNodeVar} <${node.edge.edgeURI}> ?${endNodeVar}`);
          }
          else{
            query += `?${startNodeVar} <${node.edge.edgeURI}> ?${endNodeVar} .
               `;
          }
        }

      });
    });

    //add connection triples with union
    connTriples.forEach((triple, id) => {
      if(connTriples.length - 1 != id ){
        query += `{ ${triple} .}
             UNION
             `;
      }
      else {
        query += `{ ${triple} .}
             ` ;
      }

    });


    if (emptyCheck == true){
      query += '} LIMIT 1';
    }
    else{
      query += '}';
    }

    return query ;

  }

  /**
       * translate subgraph to corresponding query using path expressions
       * combination between keyword done with AND
       * works if // TODO: HOW TO ADD CYCLES IN THIS CASE solved
       * @param {String}    target               target URI
       * @param {boolean}   emptyCheck           to define if we only generate the query to check if the result set is empty (with LIMIT) or it is the final query
       * @param {boolean}   instanceOf           property to use for expressing instanceof , rdf:type or in case of wikidata wdt:P31
       */

  subgraphToQueryPathExAND(target, emptyCheck, instanceOf){

    //get target URI (use as a variable without special characters)
    let  targetVariable = target.replace(/[^a-zA-Z0-9]/g, '');

    let query =
         `SELECT DISTINCT ?${targetVariable}
         WHERE
         {
           ?${targetVariable} ${instanceOf} <${target}> .
           `;

    this.pathTotarget.forEach(path => {
      let keywordVariable = path.keyword.replace(/[^a-zA-Z0-9]/g, '');

      //create rdf:type triples for keyword
      query += `
           ?${keywordVariable} ${instanceOf} <${path.keyword}> .
           `;

      path.path.forEach((node, idx) => {
        //bind instance variables
        if(node.type == 'instance'){
          query += `VALUES ?${node.node.nodeURI.replace(/[^a-zA-Z0-9]/g, '')} {`;
          node.userKeyword.forEach(item => {
            query += `<${item}> `;
          });
          query+= `}
               `;
        }

        // if we are at keyword noe (beginning of path)
        if(node.edge == null && idx == 0){
          query+= `?${keywordVariable} `;
        }
        //for all other nodes than target or keyword which just indicate start and end of path and have edge = null
        if(node.edge != null){
          // if we are at the end of path (before target since for target edge = null)
          if(idx == path.path.length - 2){
            query += `(<${node.edge.edgeURI}> | ^<${node.edge.edgeURI}>) ?${targetVariable} .
                   `;
          }
          else{
            query += `(<${node.edge.edgeURI}> | ^<${node.edge.edgeURI}>)/`;
          }
        }
      });
    });

    if (emptyCheck == true){
      query += '} LIMIT 1';
    }
    else{
      query += '}';
    }

    return query ;

  }

  /**
        * translate subgraph to corresponding query using path expressions
        * combination between keyword done with OR
        * works if // TODO: HOW TO ADD CYCLES IN THIS CASE solved
        * @param {String}    target               target URI
        * @param {boolean}   emptyCheck           to define if we only generate the query to check if the result set is empty (with LIMIT) or it is the final query
        * @param {boolean}   instanceOf           property to use for expressing instanceof , rdf:type or in case of wikidata wdt:P31
        */

  subgraphToQueryPathExOR(target, emptyCheck, instanceOf){

    //get target URI (use as a variable without special characters)
    let  targetVariable = target.replace(/[^a-zA-Z0-9]/g, '');

    let query =
          `SELECT DISTINCT ?${targetVariable}
          WHERE
          {
            ?${targetVariable} ${instanceOf} <${target}> .
            `;

    this.pathTotarget.forEach(path => {
      let keywordVariable = path.keyword.replace(/[^a-zA-Z0-9]/g, '');

      //create rdf:type triples for keyword
      query += `
            ?${keywordVariable} ${instanceOf} <${path.keyword}> .
            `;

      path.path.forEach(node => {
        //bind instance variables
        if(node.type == 'instance'){
          query += `VALUES ?${node.node.nodeURI.replace(/[^a-zA-Z0-9]/g, '')} {`;
          node.userKeyword.forEach(item => {
            query += `<${item}> `;
          });
          query+= `}
                `;
        }
      });
    });

    this.pathTotarget.forEach((path, i) => {
      let keywordVariable = path.keyword.replace(/[^a-zA-Z0-9]/g, '');
      path.path.forEach((node, idx) => {

        // if we are at keyword node (beginning of path)
        if(node.edge == null && idx == 0){
          query+= `{ ?${keywordVariable} `;
        }
        //for all other nodes than target or keyword which just indicate start and end of path and have edge = null
        if(node.edge != null){
          // if we are at the end of path (before target since for target edge = null)
          if(idx == path.path.length - 2){
            query += `(<${node.edge.edgeURI}> | ^<${node.edge.edgeURI}>) ?${targetVariable} . }
                `;
          }
          else{
            query += `(<${node.edge.edgeURI}> | ^<${node.edge.edgeURI}>)/`;
          }
        }
      });
      if(i != this.pathTotarget.length -1){
        query+= `UNION
        `;
      }
    });

    if (emptyCheck == true){
      query += '} LIMIT 1';
    }
    else{
      query += '}';
    }

    return query ;

  }

}
