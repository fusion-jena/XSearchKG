import path from 'path';
import { mondial } from './knowledgeGraphs';

const config = {
	openApi: {
		definition: {
			openapi: '3.0.0',
			info: {
				title: 'Explainable Keyword Search over Knowledge Graphs',
				version: '1.0.0',
				description: 'Backend API for Explainable Keyword Search over Knowledge Graphs',
			},
		},
		apis: ['src/routes/*.js'],
	},
	keywords: {
		maxSuggestions: 10, // max number of keyword suggestions
	},
	queryGeneration: {
		...mondial, // knowledge graph specific configuration
		maxParallelQueries: 20, // maximum parallel queries
		k: 5, // number of subgraphs to output (top-k)
		dmax: 20, // max distance
		intermLimit: 1000, // number of iteration after finding candidate(s) subgraphs - allow for a defined number of iterations to early terminate
		itrmax: 10000, // max number of global iterations
		timeout: 10, // query timeout in seconds
		sameNeighborPropNumber: 5, // number of properties to take with min cost in case of neighbors having same nodes but different edges
		metric: 'cost_combi_simEmbed_tripleFreq_normMaxMinCount', // summary graph metric to use for traversal -- select one of the following values:
		/* 
			cost_combi_simEmbed_tripleFreq_normMaxMinCount
			cost_simEmbed
			cost_tripleFreq_normMaxCount
			cost_tripleFreq_normMaxMinCount
			cost_tripleFreq_normTotalCount
		*/
		metricBetaValue: 0.5, // constant used in cost assignment for subgraph edges, its value is in ]0,1]
		summary: path.join(__dirname, '..', '..', '/summary-graph/'), // file location: summary graph object
	},
	results: {
		considerDisabledSubgraphsForRanking: true, // consider disabled subgraph templates for ranking (will stabilize result order)
		maxBindings: 5, // max number of bindings for a single subgraph
		pageSize: 10, // number of results per page
	},
	server: {
		cacheDurationInSeconds: 60 * 60, // time for the caches to invalidate in seconds (60 * 60 = 1 hour)
		port: 3001 // server port
	},
	sparql: {
		// prefixes used by the sparql parser/generator
		prefixes: {
			mon: 'http://www.semwebtech.org/mondial/10/meta#',
			owl: 'http://www.w3.org/2002/07/owl#',
			rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
			rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
			schema: 'http://schema.org/',
			wdt: 'http://www.wikidata.org/prop/direct/'
		}
	},
	targets: {
		maxSuggestions: 25, // max number of target suggestions
	}
};

export default config;
