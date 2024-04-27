import { Router } from 'express';
import targetsController from '../controllers/targetsController';
import serverError from '../middleware/errorHandler';

const router = Router();

/**
 * @openapi
 * /targets:
 *   get:
 *     description: Get a list of targets
 *     parameters:
 *       - in: query
 *         name: label
 *         schema:
 *           type: string
 *         required: false
 *         description: string to filter for labels and iris
 *       - in: query
 *         name: target
 *         schema:
 *           type: string
 *         required: false
 *         description: IRI
 *     responses:
 *       '200':
 *         description: OK
 *       '500':
 *         description: Internal Server Error
 */
router.get('/', targetsController, serverError);

export default router;
