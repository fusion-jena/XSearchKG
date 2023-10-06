import Config            from './../config/config';

/**
 * get keyword type (instance or class)
 *
 * @param {String}      userkeywordURI    user keyword to get type for
 *
 */
export default function getKeywordType(userkeywordURI) {

  if(Config.datasetID == 'mondial'){
    return `
SELECT DISTINCT ?type (COUNT (DISTINCT ?x) AS ?count)
  WHERE
  {
    <${userkeywordURI}> ${Config.instanceOf} ?type .
    ?x ${Config.instanceOf} ?type .
  } GROUP BY ?type ?count
    ORDER BY DESC(?count)
  `;
  }
  if(Config.datasetID == 'DBpedia'){
    return `
    SELECT DISTINCT ?type (COUNT (DISTINCT ?x) AS ?count)
    WHERE
    {
      <${userkeywordURI}> ${Config.instanceOf} ?type .
      ?x ${Config.instanceOf} ?type .
      FILTER(STRSTARTS(str(?type), "http://dbpedia.org/ontology/")) .
      #noticed that type of a lot of instances without being compatible
      FILTER(!STRSTARTS(str(?type), "http://dbpedia.org/ontology/Article")) .
    } GROUP BY ?type ?count
      ORDER BY DESC(?count)
  `;
  }

  if(Config.datasetID == 'Wikidata'){
    return `
SELECT DISTINCT ?type (COUNT (DISTINCT ?x) AS ?count)
  WHERE
  {
    <${userkeywordURI}> ${Config.instanceOf} ?type .
    ?x ${Config.instanceOf} ?type .
  } GROUP BY ?type ?count
    ORDER BY DESC(?count)
  `;
  }


}
