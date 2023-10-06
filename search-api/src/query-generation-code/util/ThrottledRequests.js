import Config from './../config/config';

/**
 * Issue queries to SPARQL Endpoint
 *
 * - limit requests to a maximum of X parallel requests
 *
 * @param {String}    endpoint        the endpoint to establish the pool for
 * @param {Number}    maxRequests     maximum number of requests issued in parallel
 */

export default function createRequestPool( endpoint = Config.endpoint, maxRequests = Config.maxParallelQueries ) {

  // endpoint has to be set
  if( !endpoint ) {
    throw new Error( 'endpoint is a mandatory parameter!' );
  }

  // if called as a constructor, redirect to function call
  if( new.target ) {
    return createRequestPool( endpoint, maxRequests = Config.maxParallelQueries );
  }

  // current queue
  const queue = [];

  // currently running requests
  const requests = new Set();

  // try to execute a new request
  async function execReq() {

    // if we are already at max or there is nothing left, don't do anything
    if( (requests.size > maxRequests) || (queue.length < 1) ) {
      return;
    }

    // start new request
    const req = queue.shift();
    try {

      // trigger before
      if( ('options' in req) && req.options && ('before' in req.options) ){
        req.options.before( req );
      }

      // add to active requests
      requests.add( req );

      // get response
      const res = await fetch( endpoint, {
        method: 'POST',
        headers: {
          'User-Agent': 'semantic-query-generation/1.0.0',
          'Content-type': 'application/x-www-form-urlencoded',
          'Accept':       'application/sparql-results+json',
        },
        body: req.query
      });

      // check, if it was successful
      if( res.status != 200 ) {
        req.reject( new Error( await res.text() ) );
        return;
      }

      // parse it
      const data = await res.json();

      // result format depends on the query type
      let result;
      switch( true ) {

        // ASK queries
        case ('boolean' in data) && !('results' in data):
          result = data.boolean;
          break;

          // SELECT queries
        case ('results' in data):
          // flatten result
          result = data.results.bindings.map( (b) => {
            return Object.keys( b )
              .reduce( (all, key) => {

                // parse value to correct type, if possible
                let val;
                switch( b[key].datatype ) {
                  case 'http://www.w3.org/2001/XMLSchema#decimal':
                    val = parseFloat( b[key].value );
                    break;
                  case 'http://www.w3.org/2001/XMLSchema#integer':
                    val = parseInt( b[key].value );
                    break;
                  default:
                    val = b[key].value;
                }

                return {
                  ... all,
                  [key]: val,
                };
              }, {});
          });
          break;
      }

      // trigger before
      if( ('options' in req) && req.options && ('after' in req.options) ){
        req.options.after( result );
      }

      // relay
      req.fulfill( result );

      // remove from active list
      requests.delete( req );

      // schedule the next one
      setTimeout( execReq, 10 );

    } catch( e ) {

      // relay errors
      req.reject( e );

    }

  }

  /*
    * function to call for actual requests
    * @param   {String}    queryString       SPARQL query to be sent
    * @param   {Object}    [options]         generic options; includes lifecycle callbacks
    * @param   {Function}  [options.before]  callback at the start of processing the request
    * @param   {Function}  [options.after]   callback at the end of processing the request
    */
  return function queryEndpoint( queryString, options ) {

    // create the queue
    const query = 'query=' + encodeURIComponent(queryString);

    // try to execute
    return new Promise( (fulfill, reject) => {

      try {

        // add to queue
        queue.push({
          query, fulfill, reject, options
        });

        // trigger execution
        execReq();

      } catch( e ) {
        reject( e );
      }

    });

  };

}
