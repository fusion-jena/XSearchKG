export const mondial = {
	datasetID: 'mondial',
	namespaces: {
		namespaceEntity: ['http://www.semwebtech.org/mondial/10/'],
		namespaceProp: ['http://www.semwebtech.org/mondial/10/'],
		namespaceSchemaClass: ['http://www.semwebtech.org/mondial/10/meta#'],
		namespaceSchemaProp: ['http://www.w3.org/2000/01/rdf-schema']
	},
	instanceOf: 'rdf:type',
	subClassOf: 'rdfs:subClassOf',
	label: 'mon:name',
	comment: undefined, // Mondial does not provide descriptions
	image: undefined, // Mondial does not provide images
	sameAs: 'owl:sameAs',
	inverseOf: 'owl:inverseOf',
	namedGraphIRI: {
		instance: 'http://mondial3',
		schema: 'http://mondial3-meta'
	},
	endpoint: 'http://127.0.0.1:8890/sparql'
};

export const dbpedia = {
	datasetID: 'DBpedia',
	namespaces: {
		namespaceEntity: ['http://dbpedia.org/ontology/'],
		namespaceProp: ['http://dbpedia.org/ontology/', 'http://dbpedia.org/property/'],
		namespaceSchemaClass: ['http://dbpedia.org/ontology/'],
		namespaceSchemaProp: ['http://www.w3.org/2000/01/rdf-schema']
	},
	instanceOf: 'rdf:type',
	subClassOf: 'rdfs:subClassOf',
	label: 'rdfs:label',
	comment: 'rdfs:comment',
	endpoint: 'http://ipc606.inf-bb.uni-jena.de:8890/sparql'
};

export const wikidata = {
	datasetID: 'Wikidata',
	namespaces: {
		namespaceEntity: ['http://www.wikidata.org/entity/'],
		namespaceProp: ['http://www.wikidata.org/prop/direct/'],
		namespaceSchemaClass: ['http://www.wikidata.org/entity/'],
		namespaceSchemaProp: ['http://www.wikidata.org/prop/direct/']
	},
	instanceOf: 'wdt:P31',
	subClassOf: 'wdt:P279',
	label: 'rdfs:label',
	comment: 'schema:description',
	image: 'wdt:P18',
	endpoint: 'https://query.wikidata.org/sparql'
};

const knowledgeGraphs = [mondial, dbpedia, wikidata];

export const knowledgeGraph = (iri) => {
	for (const knowledgeGraph of knowledgeGraphs) {
		if (iri?.startsWith(knowledgeGraph.namespaces.namespaceEntity)) {
			return knowledgeGraph;
		}
	}
}
