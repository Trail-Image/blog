'use strict';

const is = require('../is');
const log = require('../logger');
const config = require('../config');
const format = require('../format');
const cache = require('../cache');
const { icon, httpStatus} = require('../enum');
const request = require('request');
const fs = require('fs');
const cacheKey = 'spam-referer';
// last time in milliseconds that black list was downloaded
let lastUpdate = 0;
let blackList = [];
// pending black list lookup callbacks
let pending = [];
let isDownloading = false;

module.exports.filter = function(req, res, next) {
	let referer = req.get('referer');

	if (is.value(referer)) {
		isSpam(format.topDomain(referer), yes => {
			if (yes) {
				log.warnIcon(icon.target, 'Spam blocked %s referer', referer);
				res.status(httpStatus.NOT_FOUND).end();
			} else {
				next();
			}
		});
	} else {
		next();
	}
};

function isSpam(domain, callback) {
	if (blackList.length === 0) {
		loadBlackList(list => {
			blackList = list;
			callback(blackList.indexOf(domain) !== -1);
		});
	} else {
		callback(blackList.indexOf(domain) !== -1);
		if (isStale()) { downloadBlackList(); }
	}
}

// load list from cache or remote provider
function loadBlackList(callback) {
	cache.getObject(cacheKey, value => {
		if (is.array(value)) {
			callback(value);
			if (isStale()) { downloadBlackList(); }
		} else {
			downloadBlackList(callback);
		}
	});
}

// hether black list needs to be refreshed
function isStale() {
	return lastUpdate === 0 || (new Date().getTime() - lastUpdate  > config.referralSpam.updateFrequency);
}

function downloadBlackList(callback) {
	if (isDownloading) {
		if (is.callable(callback)) {
			log.info('Spam referral black list is already downloading');
			pending.push(callback);
		}
	} else {
		isDownloading = true;
		log.infoIcon(icon.cloudDownload, 'Downloading spam referral black list');

		request(config.referralSpam.listUrl, (error, response, body) => {
			let list = null;

			if (error !== null) {
				log.error('Failed to download referer blacklist: %s', error.toString());
			} else if (response.statusCode != httpStatus.OK) {
				log.error('%s returned status %s', config.referralSpam.listUrl, response.statusCode);
			} else {
				// list of non-empty lines
				list = blackList = body.split('\n').filter(i => !is.empty(i));
				lastUpdate = new Date().getTime();
				log.infoIcon(icon.banned, 'Downloaded %d blocked domains', list.length);
				cache.add(cacheKey, list);
			}

			if (is.array(list)) {
				if (is.callable(callback)) { callback(list); }
				// execute pending callbacks
				for (let c of pending) { c(list); }
				pending = [];
			}
			isDownloading = false;
		});
	}
}