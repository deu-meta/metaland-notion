declare module 'express-cache-middleware' {
	import { Cache } from 'cache-manager';
	import { Express } from 'express';

	export default class ExpressCache {
		constructor(cache: Cache, options?: Record<string, string>);

		attach(app: Express): void;
	}
}
