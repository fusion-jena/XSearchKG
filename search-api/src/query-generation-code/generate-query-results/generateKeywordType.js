import getKeywordType from './../queries/getKeywordType';
import Config         from './../config/config';
import * as fs        from 'fs';

/**
 * generate keyword type (class or instance)
 *
 * @param {Function}    request           function to issue queries
 * @param {Object}      userKeyword       user keyword object to get type for
 * @param {boolean}     typeInfo          type of keywords is known (true) or should be generated (false)
 */

export default async function generateKeywordType(request, userKeyword, typeInfo) {

  let nodes = JSON.parse(fs.readFileSync(Config.summary+Config.datasetID+'/nodes-merged-default-en.json'));

  if(typeInfo == false){
    // retrieve keyword type
    let formatedQuery = getKeywordType(userKeyword.iri);
    const keywordType = await request(formatedQuery);

    if(keywordType.length == 0 || nodes.some(item => item == keywordType[0].iri)){
      return 'class';
    }

    else{
      return keywordType[0].type ;
    }

  }

  else {
    if(nodes.some(item => item == userKeyword.iri)){
      return 'class';
    }

    else{
      return userKeyword.type ;
    }
  }

}
