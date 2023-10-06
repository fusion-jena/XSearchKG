# XSearchKG: A Platform for Explainable Keyword Search over Knowledge Graphs (Backend)

### Prerequisites

* Have a running SPARQL endpoint for your knowledge graph
* Have the summary graph files that correspond to your knowledge graph, located at [summary-graph/](summary-graph/)${datasetID}

*Example Setup for Mondial:*
* Get Virtuoso https://github.com/openlink/virtuoso-opensource#installer-packages
* Get Mondial Database in N3 format: https://www.dbis.informatik.uni-goettingen.de/Mondial/#RDF
    - mondial.n3
    - mondial-meta.n3
    - mondial-sameas.n3
* Import files via Virtuoso Conductor for Linked Data (Quad Store Upload)
* The summary graph files are already provided in this directory: [summary-graph/mondial](summary-graph/mondial)

### Installation

* Install [Node.js](https://nodejs.org/en/).
* Install dependencies: run `npm install` in the project root folder.

### Configuration

* In [src/config/config.js](src/config/config.js) you can control the configurations for query generation, results, etc.

### Running

* In the project directory run `npm start`.
* Open [http://localhost:3001/api-docs](http://localhost:3001/api-docs) to try the endpoints in your browser.
