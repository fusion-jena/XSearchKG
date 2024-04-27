import { Router } from 'express';
import keywordsController from '../controllers/keywordsController';
import serverError from '../middleware/errorHandler';

const router = Router();

/**
 * @openapi
 * /keywords:
 *   get:
 *     description: Get a list of keywords
 *     parameters:
 *       - in: query
 *         name: label
 *         schema:
 *           type: string
 *         required: false
 *         description: string to filter for labels and iris
 *       - in: query
 *         name: keywords
 *         schema:
 *           type: JSON array
 *         required: false
 *         description: list of keywords with iri and type
 *     responses:
 *       '200':
 *         description: OK
 *       '500':
 *         description: Internal Server Error
 */
router.get('/', keywordsController, serverError);

export default router;
