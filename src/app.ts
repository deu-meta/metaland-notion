import express, { RequestHandler } from 'express';
import cors from 'cors';
import logger from 'morgan';
import ExpressCache from 'express-cache-middleware';
import cacheManager from 'cache-manager';
import { NotionAPI } from 'notion-client';

const CORS_HOST = process.env.MTL_NOTION_CORS_HOST || '*';
const PORT = Number(process.env.MTL_NOTION_PORT || 8002);

const app = express();
const notionAPI = new NotionAPI();

app.use(
	cors({
		origin: CORS_HOST,
		optionsSuccessStatus: 200,
		methods: ['GET', 'OPTIONS'],
	})
);

app.use(logger('combined'));

const cacheMiddleware = new ExpressCache(
	cacheManager.caching({
		store: 'memory',
		max: 10000,
		ttl: 60, // seconds
	})
);
cacheMiddleware.attach(app);

const crashSafeWrapper: (handler: RequestHandler) => RequestHandler =
	(handler: RequestHandler) => async (req, res, next) => {
		try {
			return await handler(req, res, next);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: error });
		}
	};

app.get(
	'/page/:pageId',
	crashSafeWrapper(async (req, res) => {
		try {
			const page = await notionAPI.getPage(req.params.pageId);
			res.send(page);
		} catch (e) {
			res.status(404).json({ message: String(e) });
		}
	})
);

app.get('*', (req, res) =>
	res.status(200).json({
		message: 'OK',
		routes: ['/page/:pageId'],
	})
);

const server = app.listen(PORT, '0.0.0.0', () => {
	console.log(`App is now running on port ${PORT}.`);
});

function shutdownHandler() {
	console.log('Shutdown server ...');
	server.close();
	process.exit(0);
}

process.on('SIGTERM', shutdownHandler);
process.on('SIGINT', shutdownHandler);
