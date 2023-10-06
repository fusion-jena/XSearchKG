/**
 * generate results for one subgraph
 *
 *
 *
 * @param {Subgraph}         subgraph         subgraph to generate the query for
 * @param {Function}         request          function to issue queries
 * @param {String}           target           target URI
 */

export default async function executeQuery(subgraph, request, target) {

  // array to store result uris
  let uris = [];

  //execute query
  const result = await request(subgraph.query);

  [...result].forEach(element => {
    uris.push(element['target']);
  });

  return uris;
}
