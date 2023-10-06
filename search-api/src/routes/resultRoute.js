import { Router } from 'express';
import resultController from '../controllers/resultController';
import serverError from '../middleware/errorHandler';
import { validateDisabledConnections, validateIri, validateK, validateKeywords, validateTarget } from '../middleware/requestValidator';

const router = Router();

/**
 * @openapi
 * /result:
 *   get:
 *     description: Get detailed information for a specific search result
 *     parameters:
 *       - in: query
 *         name: target 
 *         schema:
 *           type: string
 *         required: true
 *         description: target IRI
 *       - in: query
 *         name: keywords
 *         schema:
 *           type: string
 *         required: false
 *         description: keyword IRIs (comma separated list)
 *       - in: query
 *         name: disabledConnections
 *         schema:
 *           type: string
 *         required: false
 *         description: disabled connections (comma separated list of numbers with 0 being the first connection / subgraph template)
 *       - in: query
 *         name: iri
 *         schema:
 *           type: string
 *         required: true
 *         description: result IRI
  *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Not Found
 *       '500':
 *         description: Internal Server Error
*/
router.get('/', validateKeywords, validateTarget, validateK, validateDisabledConnections, validateIri, resultController, serverError);

export default router;
