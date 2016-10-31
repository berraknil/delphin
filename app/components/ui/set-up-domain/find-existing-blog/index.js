// External dependencies
import { bindHandlers } from 'react-bind-handlers';
import i18n from 'i18n-calypso';
import { Link } from 'react-router';
import React, { Component, PropTypes } from 'react';

// Internal dependencies
import Button from 'components/ui/button';
import DocumentTitle from 'components/ui/document-title';
import { extractHostName } from 'lib/domains';
import { getPath } from 'routes';
import Form from 'components/ui/form';
import Input from 'components/ui/form/input';
import SunriseStep from 'components/ui/sunrise-step';
import ValidationError from 'components/ui/form/validation-error';
import { canConnectToService } from 'lib/services';

class FindExistingBlog extends Component {
	componentWillMount() {
		const { hasAnsweredPreviousQuestion, domainName, redirect } = this.props;

		if ( ! hasAnsweredPreviousQuestion ) {
			redirect( 'selectBlogType', { pathParams: { domainName } } );
		}
	}

	handleSubmit( values ) {
		const hostName = extractHostName( values.url );

		this.props.fetchService( hostName ).then( result => {
			let slug;

			if ( canConnectToService( result.service ) ) {
				slug = 'connectExistingBlog';
			} else {
				slug = 'contactUsExistingBlog';
			}

			this.props.redirect( slug, { pathParams: {
				domainName: this.props.domainName,
				hostName,
			} } );
		} );
	}

	isSubmitButtonDisabled() {
		return [
			'asyncValidating',
			'invalid',
			'pristine',
			'submitting',
			'isRequestingService',
		].some( prop => this.props[ prop ] );
	}

	render() {
		const { domainName, fields, handleSubmit } = this.props;

		return (
			<SunriseStep>
				<DocumentTitle title={ i18n.translate( 'Set up domain' ) } />

				<SunriseStep.Header>
					<h1>{ i18n.translate( 'Connect to your blog' ) }</h1>
				</SunriseStep.Header>

				<Form onSubmit={ handleSubmit( this.handleSubmit ) }>
					<Form.FieldArea>
						<label>{ i18n.translate( 'Enter your blog\'s address:' ) }</label>

						<Input
							prefix={ 'http://' }
							autoFocus
							field={ fields.url }
							placeholder={ i18n.translate( 'e.g. www.yourblog.com' ) }
							type="text" />

						<ValidationError field={ fields.url } />
					</Form.FieldArea>

					<Form.SubmitArea>
						<Button disabled={ this.isSubmitButtonDisabled() }>
							{ i18n.translate( 'Next' ) }
						</Button>
					</Form.SubmitArea>

					<Form.Footer>
						{ i18n.translate( 'We\'ll scan your blog and find the right settings to connect it to %(domainName)s.', {
							args: { domainName }
						} ) }
					</Form.Footer>
				</Form>

				<SunriseStep.Footer>
					<Link to={ getPath( 'selectBlogType', { domainName } ) }>
						{ i18n.translate( 'Back' ) }
					</Link>
				</SunriseStep.Footer>
			</SunriseStep>
		);
	}
}

FindExistingBlog.propTypes = {
	asyncValidating: PropTypes.bool.isRequired,
	domainName: PropTypes.string.isRequired,
	fetchService: PropTypes.func.isRequired,
	fields: PropTypes.object.isRequired,
	handleSubmit: PropTypes.func.isRequired,
	hasAnsweredPreviousQuestion: PropTypes.bool.isRequired,
	invalid: PropTypes.bool.isRequired,
	isRequestingService: PropTypes.bool.isRequired,
	pristine: PropTypes.bool.isRequired,
	redirect: PropTypes.func.isRequired,
	submitting: PropTypes.bool.isRequired
};

export default bindHandlers( FindExistingBlog ) ;