import cors from 'cors';
import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import config from './config/config';
import connectionsRoute from './routes/connectionsRoute';
import keywordsRoute from './routes/keywordsRoute';
import resultRoute from './routes/resultRoute';
import resultsRoute from './routes/resultsRoute';
import targetsRoute from './routes/targetsRoute';
import cacheHeader from './middleware/cacheHeader';

process.on('unhandledRejection', (reason, p) => {
	console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

const app = express();
app.use(cors());
app.use(cacheHeader);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(config.openApi)));
app.use('/connections', connectionsRoute);
app.use('/keywords', keywordsRoute);
app.use('/result', resultRoute);
app.use('/results', resultsRoute);
app.use('/targets', targetsRoute);
app.listen(config.server.port, () => {
	console.log(`Server is running on port ${config.server.port}`);
});
