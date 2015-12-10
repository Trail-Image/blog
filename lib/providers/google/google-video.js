'use strict';

const config = require('../../config.js');
const app = require('../../index.js');
const is = app.is;
const format = app.format;
const GpxBase = require('../file-base.js');
const extend = require('extend');
const Google = require('googleapis');
const OAuth2 = Google.auth.OAuth2;
const OAuthOptions = require('../../auth/oauth-options.js');
const ServerResponse = require('http').ServerResponse;
const Enum = app.enum;
const request = require('request');
const db = app.provider;
const removeHeaders = ['x-goog-hash','x-guploader-uploadid','expires','cache-control','alt-svc','via','server'];

/**
 * Retrieve GPS file for post
 * @extends {FileBase}
 * @extends {OAuthBase}
 * @see https://developers.google.com/drive/v2/reference/
 * @see https://developers.google.com/drive/v2/reference/files/get#examples
 * @see https://github.com/google/google-api-nodejs-client/
 * @see https://developers.google.com/apis-explorer/#p/
 */
class GoogleVideo extends GpxBase {
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
}

module.exports = GoogleVideo;

// - Private static members ---------------------------------------------------

const defaultGoogleOptions = {
	/** @type {String} */
	apiKey: null,
	/** @type {String} */
	tracksFolder: null,

	/** @type {OAuthOptions} */
	auth: new OAuthOptions(2)
};