'use strict';

const TI = require('../../');
const config = TI.config;
const is = TI.is;
const mocha = require('mocha');
const expect = require('chai').expect;
const RedisCache = TI.Provider.Cache.Redis;
const success = 'OK';
const key = 'test-key';

describe('Redis Cache', ()=> {
	if (is.empty(config.proxy)) {
		let redis = new RedisCache(config.env('REDISCLOUD_URL'));

		it('stores a key and value', done => {
			redis.add(key, 'test-value', (err, result) => {
				expect(err).is.null;
				expect(result).equals(success);
				done();
			});
		});

		it('removes a key and its value', done => {
			redis.remove(key, err => {
				expect(err).is.null;
				done();
			});
		});

		after(done => { redis.disconnect(); done(); });
	} else {
		// can't reach Redis through proxy
		it.skip('stores a key and value');
		it.skip('removes a key and its value');
	}
});