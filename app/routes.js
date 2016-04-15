// Internal dependencies
import About from 'components/ui/about';
import Checkout from 'components/ui/checkout';
import NotFound from 'components/ui/not-found';
import paths from 'paths';
import Root from 'components/ui/root';
import SearchContainer from 'components/containers/search';
import Success from 'components/ui/success';

export default {
	path: paths.home(),
	component: Root,
	indexRoute: {
		component: SearchContainer
	},
	childRoutes: [
		{
			path: paths.about(),
			component: About
		},
		{
			path: paths.checkout(),
			component: Checkout
		},
		{
			path: paths.success(),
			component: Success
		},
		{
			path: '*',
			component: NotFound
		}
	]
};

export const serverRedirectRoutes = [
	{
		from: paths.checkout(),
		to: paths.search()
	},
	{
		from: paths.success(),
		to: paths.search()
	}
];
