// Internal dependencies
import languages from './languages';
import { applyQueryStringToConfig } from 'lib/config';

const NODE_ENV = process.env.NODE_ENV,
	productionOnly = NODE_ENV === 'production';

let config = {
	available_tlds: [ 'blog' ],
	default_tld: 'blog',
	default_search_sort: 'recommended',
	env: NODE_ENV || 'development',
	staging_cdn_prefix: 'https://s0.wp.com/wp-content/themes/a8c/getdotblogstaging/public',
	production_cdn_prefix: 'https://s0.wp.com/wp-content/themes/a8c/getdotblog/public',
	google_conversion_id: 881304566,
	google_conversion_label: 'WLR1CIHt3WkQ9seepAM',
	hostname: 'get.blog',
	i18n_default_locale_slug: 'en',
	initial_number_of_search_results: 6,
	features: {
		ad_tracking: productionOnly,
		boom_analytics: productionOnly,
		google_analytics: productionOnly,
		mc_analytics: productionOnly,
		sentry: productionOnly,
		tracks: productionOnly
	},
	languages,
	sift_science_key: productionOnly ? 'a4f69f6759' : 'e00e878351',
	support_link: 'mailto:help@get.blog',
	tracks_event_prefix: 'delphin_',
	wordpress: {
		rest_api_oauth_client_id: 46199,
		rest_api_oauth_client_secret: '7FVcj4q9nDvX3ic812oAGDR2oZFjSk0woryR0rRmNIO5Gn7k6HibTIlhvC7Wmof9'
	},
	wordnik_api_key: '***REMOVED***',
	google_analytics_key: 'UA-10673494-28',
	google_translate_api_key: '***REMOVED***'
};

if ( typeof window !== 'undefined' && window.location && window.location.search ) {
	config = applyQueryStringToConfig( config, window.location.search );
}

export default function( key ) {
	return config[ key ];
}

export function isEnabled( feature ) {
	return config.features[ feature ];
}
