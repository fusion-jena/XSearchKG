import { Router } from 'express';
import resultsController from '../controllers/resultsController';
import serverError from '../middleware/errorHandler';
import { validateDisabledConnections, validateK, validateKeywords, validatePage, validateTarget } from '../middleware/requestValidator';

const router = Router();

/**
 * @openapi
 * /results:
 *   get:
 *     description: Get a ranked and enriched list of search results with basic information
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
 *         name: page
 *         schema:
 *           type: int
 *         required: false
 *         description: page
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '500':
 *         description: Internal Server Error
 */
router.get('/', validateKeywords, validateTarget, validateK, validateDisabledConnections, validatePage, resultsController, serverError);

export default router;
