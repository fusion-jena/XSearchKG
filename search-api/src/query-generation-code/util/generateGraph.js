import Graph                        from './../objects/Graph';
import Edge                         from './../objects/edge';
import JSONStream                   from 'JSONStream';

let graphs = {};

/**
 * generate graph object from summary graph file
 *
 *
 * @param {Object}    fs         object for file system node module
 * @param {String}    metric     which cost metric (edges weight)
 * @param {String}    dataset    dataset id
 * @param {String}    folder     location of summary graph folder
 */

export default async function generateGraph(fs, metric, dataset, folder) {
  if (typeof graphs[dataset] === 'undefined') {
    graphs[dataset] = await _generateGraph(fs, metric, dataset, folder);
  }
  return graphs[dataset];
};

async function _generateGraph(fs, metric, dataset, folder) {
  // summary graph file name
  const filename = folder +'weighted.json';

  //create graph object
  const graph = new Graph(dataset +'_'+ metric);

  // read summary graph file
  //let data = JSON.parse(fs.readFileSync(filename));

  // use stream to read triple per triple (parse does not work for large strings)
  let stream = fs.createReadStream(filename, {encoding: 'utf8'});

  let parser = JSONStream.parse('*');
  stream.pipe(parser);

  let endStream = new Promise ((resolve, reject) => {
    parser.on('data', triple => {
      //add nodes and edges to the graph
      const node1 = graph.createNode(triple.CLASS1),
            node2 = graph.createNode(triple.CLASS2),
            edge  = new Edge(triple.p, node1, node2, triple[metric]);

      graph.addNode(node1);
      graph.addNode(node2);
      graph.addEdge(node1, node2, edge);
    });
    parser.on('end', () => resolve(graph));
    parser.on('error', error => reject(error));
  });

  return endStream ;
}
