import { Router } from 'express';
import connectionsController from '../controllers/connectionsController';
import serverError from '../middleware/errorHandler';
import { validateK, validateKeywords, validateTarget } from '../middleware/requestValidator';

const router = Router();

/**
 * @openapi
 * /connections:
 *   get:
 *     description: Get all subgraph templates
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
  *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '500':
 *         description: Internal Server Error
*/
router.get('/', validateKeywords, validateTarget, validateK, connectionsController, serverError);

export default router;
