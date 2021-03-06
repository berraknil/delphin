// External dependencies
import { reduxForm } from 'redux-form';
import { goBack } from 'react-router-redux';

// Internal dependencies
import { addNotice } from 'actions/notices';
import { getAsyncValidateFunction } from 'lib/form';
import { redirect } from 'actions/routes';
import UpdateNameservers from 'components/ui/set-up-domain/update-nameservers';
import { isRequestingNameservers } from 'reducers/nameservers/selectors';
import { validateUpdateNameserversForm } from 'lib/domains/nameservers';
import { fetchNameservers, updateNameservers } from 'actions/nameservers';
import RequireLogin from 'components/containers/require-login';

export default reduxForm(
	{
		form: 'nameservers',
		fields: [
			'nameserver1',
			'nameserver2',
			'nameserver3',
			'nameserver4',
		],
		asyncValidate: getAsyncValidateFunction( validateUpdateNameserversForm ),
	},
	( state, { params: { domainName } } ) => ( {
		domainName,
		isRequestingNameservers: isRequestingNameservers( state ),
	} ),
	{
		addNotice,
		redirect,
		updateNameservers,
		fetchNameservers,
		goBack
	}
)( RequireLogin( UpdateNameservers ) );
