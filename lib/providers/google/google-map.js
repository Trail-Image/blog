'use strict';

const is = require('../../is.js');
const MapBase = require('../../map/map-base');
const extend = require('extend');
const Google = require('googleapis');
const OAuth2 = Google.auth.OAuth2;
const OAuthOptions = require('../../auth/oauth-options.js');
const request = require('request');
const log = require('../../config.js').provider.log;

/**
 * @extends {MapBase}
 * @extends {OAuthBase}
 * @see https://developers.google.com/drive/v2/reference/
 * @see https://developers.google.com/drive/v2/reference/files/get#examples
 * @see https://github.com/google/google-api-nodejs-client/
 * @see https://developers.google.com/apis-explorer/#p/
 */
class GoogleMap extends MapBase {
	constructor(options) {
		super();

		/** @type {defaultGoogleOptions} */
		this.options = extend(true, defaultGoogleOptions, options);
		/** @type {OAuthOptions} */
		let oa = this.options.auth;
		/** @type {OAuth2} */
		this.oauth = new OAuth2(oa.clientID, oa.clientSecret, oa.callback);

		if (oa.needsAuth) {
			this.needsAuth = true;
		} else {
			this.oauth.setCredentials({
				access_token: oa.accessToken,
				refresh_token: oa.refreshToken
			});
		}

		this.drive = Google.drive({ version: 'v2', auth: this.oauth });
	}

	/**
	 * @param {Post} post
	 * @param {function(String)} callback Return GPX string
	 * @see https://developers.google.com/drive/v2/reference/children/list
	 */
	_loadGeoFromSource(post, callback) {
		let options = {
			folderId: this.options.tracksFolder,
			q: `title contains '${post.title}' and mimeType = 'text/xml'`
		};

		this.drive.children.list(options, (err, list) => {
			if (err != null) {
				log.error(err.toString());
				callback(null);
			} else if (list.items.length == 0) {
				// no matches
				callback(null)
			} else {
				//list.items[0].childLink
				//list.items[0].id
				//list.items[0].selfLink
				//this.drive.files.get(
				this._downloadFile(list.items[0].childLink, callback);
			}
		});
	}

	/**
	 * @param {String} url
	 * @param {function(String)} callback Return GPX
	 * @see https://developers.google.com/drive/v2/reference/files/get
	 * @see https://developers.google.com/drive/web/manage-downloads
	 * @private
	 */
	_downloadFile(url, callback) {
		let options = {
			url: url + '?alt=media',
			headers: {
				'User-Agent': 'node.js',
				'Authorization': 'Bearer ' + this.options.auth.accessToken
			}
		};

		if (!is.empty(this.options.proxy)) { options.proxy = this.options.proxy; }

		request(options, (err, response, body) => {
			if (err == null) {
				callback(body);
			} else {
				log.error(err.toString());
				callback(null);
			}
		});
	}

	/**
	 * Retrieve access and refresh tokens
	 * @param {String|Object} code
	 * @param {function(String, String)} callback
	 */
	getAccessToken(code, callback) {
		this.oauth.getToken(code, (err, tokens) => {
			if (err != null) {

			} else {
				this.oauth.setCredentials(tokens);
				callback(tokens);
			}
		});
	};
}

module.exports = GoogleMap;

// - Private static members ---------------------------------------------------

const defaultGoogleOptions = {
	/** @type {String} */
	apiKey: null,
	/** @type {String} */
	tracksFolder: null,
	/** @type {OAuthOptions} */
	auth: new OAuthOptions(2)
};