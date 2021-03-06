// External dependencies
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import get from 'lodash/get';

// Internal dependencies
import ConnectExistingBlog from 'components/ui/set-up-domain/connect-existing-blog';
import RequireLogin from 'components/containers/require-login';
import { extractHostName } from 'lib/domains';
import { redirect } from 'actions/routes';
import { getService } from 'reducers/service/selectors';
import { recordTracksEvent } from 'actions/analytics';
import { updateDomain } from 'actions/my-domains';

/**
 * Retrieves the host name from the url entered at the previous step.
 *
 * @param {object} state - state tree
 * @returns {string|null} - the host name or null if not found
 */
const getHostName = ( state ) => {
	const url = get( state, 'form.findExistingBlog.url.value' );

	return extractHostName( url );
};

export default connect(
	( state, ownProps ) => ( {
		hostName: getHostName( state ),
		domainName: ownProps.params.domainName,
		service: getService( state ),
	} ),
	dispatch => bindActionCreators( {
		recordTracksEvent,
		redirect,
		updateDomain
	}, dispatch )
)( RequireLogin( ConnectExistingBlog ) );
