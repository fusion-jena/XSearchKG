[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/fusion-jena/KeySearchWiki/blob/master/LICENSE)
# XSearchKG: A Platform for Explainable Keyword Search over Knowledge Graphs

:video_camera: [Demo Video]()

## System Architecture

The application consists of two fundamental building blocks: 
- A Node.js Express server (backend) produces ranked results with essential information such as labels, descriptions, and subgraph bindings.
- A React app (frontend) provides a user-friendly and responsive web interface.

The application requires a running SPARQL endpoint and the files representing the summary graph generated at the first off-line phase of [Fed20](https://ceur-ws.org/Vol-2798/paper3.pdf).
The routes of the backend are very lightweight, containing the [OpenAPI documentation](https://swagger.io/specification/).
The routes are mapped to corresponding controllers. The latter uses a common set of services.
The most prominent services are as follows:
- Query service: Acts as a single entry point for all calls to the [Top-k Query generator code](https://zenodo.org/record/8414093) (query generation).
- Result service: Used for the generation of the result list and the calculation of the ranking scores.
- Enrichment service: Provides all additional information for IRIs such as labels, descriptions, and image URLs.
To avoid regenerating identical data and improve performance, we utilize both standard HTTP cache headers and in-memory caches implemented as Express server middleware.

## Run
The search application consists of two components:
* backend: see [search-api/README.md](search-api/README.md)
* frontend: see [search-client/README.md](search-client/README.md)

<!---## Cite , consider updating codemeta with paper link and also zenodo metadata-->

## License
This project is licensed under the [MIT License](https://github.com/fusion-jena/XSearchKG/blob/master/LICENSE).
