// External dependencies
import async from 'async';
import compact from 'lodash/compact';
import fs from 'fs';
import path from 'path';
import request from 'superagent';

// Internal dependencies
import config from 'config';

const getLanguageUrl = locale => `https://widgets.wp.com/languages/delphin/${ locale }.json`;

const getLocaleFilePath = locale => path.resolve( __dirname, 'data', `${ locale }.json` );

const fetchLanguage = locale => {
	return callback => {
		if ( ! process.env.REFRESH_I18N_CACHE && fs.existsSync( getLocaleFilePath( locale ) ) ) {
			console.log( `Using cached locale data for ${ locale }` );
			callback();
			return;
		}

		console.log( 'fetching', getLanguageUrl( locale ) );
		request.get( getLanguageUrl( locale ) ).end( ( error, response ) => {
			if ( error ) {
				return callback( error );
			}
			const result = { locale, response: response.body };
			callback( null, result );
		} );
	};
};

export const get = locale => {
	const filePath = getLocaleFilePath( locale );

	if ( fs.existsSync( filePath ) ) {
		return JSON.parse( fs.readFileSync( filePath, 'utf8' ) );
	}
};

export const fetch = callback => {
	const fetchFunctions = config( 'languages' )
		.filter( language => language.langSlug !== config( 'i18n_default_locale_slug' ) )
		.map( language => fetchLanguage( language.langSlug ) );

	async.parallel( fetchFunctions, ( errors, results ) => {
		compact( results ).forEach( language => {
			if ( language.response ) {
				fs.writeFileSync( getLocaleFilePath( language.locale ), JSON.stringify( language.response ), 'utf8' );
			}
		} );

		callback && callback();
	} );
};

export default { get, fetch };
