import Config            from './../config/config';

/**
 * get instance properties (incoming and outgoing)
 *
 *
 */
export default function getInstanceProperties(userKeyword){

  if(Config.datasetID == 'mondial'){
    return `

  SELECT DISTINCT ?p
  FROM <${Config.namedGraphIRI.instance}>
  WHERE
  {
    { <${userKeyword}> ?p ?x . }
    UNION
    { ?x ?p <${userKeyword}> . }
  }
    `;
  }

  if(Config.datasetID == 'DBpedia'){

    return `
SELECT DISTINCT ?p
WHERE
{
  { <${userKeyword}> ?p ?x . }
  UNION
  { ?x ?p <${userKeyword}> . }
}
  `;
  }

  if(Config.datasetID == 'Wikidata'){

    return `
SELECT DISTINCT ?p
WHERE
{
  { <${userKeyword}> ?p ?x . }
  UNION
  { ?x ?p <${userKeyword}> . }
}
  `;
  }
}
