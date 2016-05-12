// External dependencies
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { browserHistory } from 'react-router';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import { routerMiddleware, routerReducer, syncHistoryWithStore } from 'react-router-redux';
import thunk from 'redux-thunk';

// Internal dependencies
import { analyticsMiddleware } from './analytics-middleware';
import App from 'app';
import { fetchUser } from 'actions';
import { getTokenFromBearerCookie } from './bearer-cookie';
import config from 'config';
import reducers from 'reducers';
import i18n from 'i18n-calypso';
import Stylizer, { insertCss } from 'lib/stylizer';
import switchLocale from './switch-locale';
import { userMiddleware } from './user-middleware';

const store = createStore(
	combineReducers( {
		...reducers,
		routing: routerReducer
	} ),
	window.devToolsExtension ? window.devToolsExtension() : f => f,
	applyMiddleware(
		routerMiddleware( browserHistory ),
		thunk,
		analyticsMiddleware,
		userMiddleware
	)
);

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore( browserHistory, store );

function init() {
	i18n.configure( {
		defaultLocaleSlug: config( 'i18n_default_locale_slug' )
	} );
	i18n.initialize( window.localeData );

	const bearerToken = getTokenFromBearerCookie();

	if ( bearerToken ) {
		store.dispatch( fetchUser( bearerToken ) );
	}

	injectTapEventPlugin();
}

function render() {
	var containerElement = document.getElementById( 'content' );
	ReactDOM.unmountComponentAtNode( containerElement );
	ReactDOM.render(
		<Provider store={ store }>
			<Stylizer onInsertCss={ insertCss }>
				<App history={ history } />
			</Stylizer>
		</Provider>,
		containerElement
	);
}

function boot() {
	init();

	render();
	i18n.stateObserver.on( 'change', render );

	window.switchLocale = switchLocale;
}

boot();
