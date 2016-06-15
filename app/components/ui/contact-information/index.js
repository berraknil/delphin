// External dependencies
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import i18n from 'i18n-calypso';
import isEmpty from 'lodash/isEmpty';
import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

// Internal dependencies
import Form from 'components/ui/form';
import State from 'components/ui/contact-information/state';
import Input from 'components/ui/form/input';
import styles from './styles.scss';
import CheckoutProgressbar from 'components/ui/checkout-progressbar';
import ValidationError from 'components/ui/form/validation-error';

class ContactInformation extends React.Component {
	constructor( props ) {
		super( props );

		this.validateBound = this.validate.bind( this );
		this.handleBlurBound = this.handleBlur.bind( this );
		this.debouncedValidateBound = debounce( this.validateBound, 500 );
		this.validateAndSubmitBound = this.validateAndSubmit.bind( this );
	}

	componentWillMount() {
		if ( ! this.props.domain ) {
			this.props.redirectToHome();
		}

		this.redirectIfLoggedOut();

		if ( ! this.props.location.isRequesting && ! this.props.location.hasLoadedFromServer ) {
			this.props.fetchLocation();
		}

		if ( ! this.props.contactInformation.isRequesting && ! this.props.contactInformation.hasLoadedFromServer ) {
			this.props.fetchContactInformation();
		}

		if ( this.props.contactInformation.hasLoadedFromServer ) {
			this.initializeContactInformation();
		}

		if ( this.canUpdateCountryFromLocation() ) {
			this.setCountryCode();
		}

		this.props.resetInputVisibility();

		if ( ! this.props.countries.isRequesting && ! this.props.countries.hasLoadedFromServer ) {
			this.props.fetchCountries();
		}
	}

	componentWillReceiveProps( nextProps ) {
		this.redirectIfLoggedOut( nextProps );

		if ( this.isDataLoading() && ! this.isDataLoading( nextProps ) ) {
			this.initializeContactInformation( nextProps );
		}

		if ( ! this.canUpdateCountryFromLocation() && this.canUpdateCountryFromLocation( nextProps ) ) {
			this.setCountryCode( nextProps );
		}

		if ( this.props.fields.countryCode.value !== nextProps.fields.countryCode.value ) {
			this.props.fetchStates( nextProps.fields.countryCode.value );

			// Resets the state field every time the user selects a different country
			this.props.fields.state.onChange( '' );
		}
	}

	initializeContactInformation( props = this.props ) {
		const form = Object.keys( props.fields ).reduce( ( result, fieldName ) => {
			return Object.assign( result, { [ fieldName ]: props.contactInformation.data[ fieldName ] || '' } );
		}, {} );

		props.initializeForm( form );
	}

	setCountryCode( props = this.props ) {
		let countryCode;

		// Use the GEO location
		if ( props.location.hasLoadedFromServer ) {
			countryCode = props.location.data.countryCode;
		}

		if ( props.contactInformation.hasLoadedFromServer && props.contactInformation.data.countryCode ) {
			// Over-ride the GEO location if the user has contact information.
			countryCode = props.contactInformation.data.countryCode;
		}

		if ( countryCode ) {
			props.fields.countryCode.onChange( countryCode );
		}
	}

	canUpdateCountryFromLocation( props = this.props ) {
		return ! this.isDataLoading( props ) &&
			( props.location.hasLoadedFromServer || props.location.hasFailedToLoad );
	}

	isDataLoading( props = this.props ) {
		return ! props.contactInformation.hasLoadedFromServer ||
			! props.countries.hasLoadedFromServer;
	}

	redirectIfLoggedOut( props = this.props ) {
		if ( props.isLoggedOut ) {
			props.redirectToHome();
		}
	}

	address2InputIsVisible() {
		const { inputVisibility: { address2InputIsVisible }, fields: { address2 } } = this.props;

		return address2InputIsVisible || address2.initialValue;
	}

	organizationInputIsVisible() {
		const { inputVisibility: { organizationInputIsVisible }, fields: { organization } } = this.props;

		return organizationInputIsVisible || organization.initialValue;
	}

	validate( onComplete = () => {} ) {
		const contactInformation = Object.keys( this.props.fields ).reduce( ( result, fieldName ) => {
			return Object.assign( result, { [ fieldName ]: this.props.fields[ fieldName ].value } );
		}, {} );

		this.props.validateContactInformation(
			this.props.domain,
			contactInformation
		).then( onComplete );
	}

	validateAndSubmit() {
		this.validate( () => {
			if ( isEmpty( this.props.errors ) ) {
				this.props.redirectToCheckout();
			}
		} );
	}

	handleBlur( event ) {
		this.debouncedValidateBound();

		this.props.fields[ event.target.name ].onBlur();
	}

	render() {
		const { fields, handleSubmit, countries, untouch } = this.props;

		return (
			<div>
				<CheckoutProgressbar currentStep={ 2 } />

				<div className={ styles.header }>
					<h2 className={ styles.heading }>
						{ i18n.translate( 'Registration Profile' ) }
					</h2>

					<h3 className={ styles.text }>
						{ i18n.translate( 'We need your contact information to claim {{strong}}%(domain)s{{/strong}}.',
							{
								args: { domain: this.props.domain },
								components: { strong: <strong /> }
							}
						) }
					</h3>
				</div>

				<Form
					onSubmit={ handleSubmit( this.validateAndSubmitBound ) }
					fieldArea={
						<div>
							<fieldset className={ styles.row }>
								<label>{ i18n.translate( 'Name' ) }</label>

								<Input
									disabled={ this.isDataLoading() }
									field={ fields.firstName }
									autoFocus
									untouch={ untouch }
									onBlur={ this.handleBlurBound }
									className={ styles.firstName }
									placeholder={ i18n.translate( 'First Name' ) }
								/>

								<Input
									disabled={ this.isDataLoading() }
									field={ fields.lastName }
									untouch={ untouch }
									onBlur={ this.handleBlurBound }
									className={ styles.lastName }
									placeholder={ i18n.translate( 'Last Name' ) }
								/>
								<ValidationError fields={ [ fields.firstName, fields.lastName ] } />
							</fieldset>

							{ ! this.organizationInputIsVisible() && (
								<a className={ styles.showOrganizationLink } onClick={ this.props.showOrganizationInput }>
									{ i18n.translate( 'Registering for a company? Add Organization name' ) }
								</a>
							) }

							{ this.organizationInputIsVisible() && (
								<fieldset>
									<label>{ i18n.translate( 'Organization' ) }</label>
									<Input
										field={ fields.organization }
										untouch={ untouch }
										onBlur={ this.handleBlurBound }
										className={ styles.organization }
										disabled={ this.isDataLoading() }
										placeholder={ i18n.translate( 'Organization' ) }
									/>
									<ValidationError field={ fields.organization } />
								</fieldset>
							) }

							<fieldset className={ classNames( { [ styles.addressTwoIsVisible ]: this.address2InputIsVisible() } ) }>
								<label>{ i18n.translate( 'Address' ) }</label>

								<Input
									field={ fields.address1 }
									untouch={ untouch }
									onBlur={ this.handleBlurBound }
									className={ styles.address1 }
									disabled={ this.isDataLoading() }
									placeholder={ i18n.translate( 'Address Line 1' ) }
								/>

								{ this.address2InputIsVisible() && (
									<Input
										field={ fields.address2 }
										untouch={ untouch }
										onBlur={ this.handleBlurBound }
										className={ styles.address2 }
										disabled={ this.isDataLoading() }
										placeholder={ i18n.translate( 'Address Line 2' ) }
									/>
								) }

								<ValidationError fields={ [ fields.address1, fields.address2 ] } />

								{ ! this.address2InputIsVisible() && (
									<a className={ styles.showAddressTwoLink } onClick={ this.props.showAddress2Input }>
										{ i18n.translate( '+ Add Address Line 2' ) }
									</a>
								) }

								<div className={ styles.row }>
									<Input
										disabled={ this.isDataLoading() }
										untouch={ untouch }
										field={ fields.city }
										onBlur={ this.handleBlurBound }
										className={ styles.city }
										placeholder={ i18n.translate( 'City' ) }
									/>

									<State
										disabled={ this.isDataLoading() }
										field={ fields.state }
										untouch={ untouch }
										onBlur={ this.handleBlurBound }
										states={ this.props.states } />

									<Input
										disabled={ this.isDataLoading() }
										untouch={ untouch }
										field={ fields.postalCode }
										onBlur={ this.handleBlurBound }
										className={ styles.postalCode }
										placeholder={ i18n.translate( 'Zip' ) }
									/>
									<ValidationError
										fields={ [
											fields.city,
											fields.state,
											fields.postalCode
										] }
									/>
								</div>

								<select
									{ ...fields.countryCode }
									disabled={ this.isDataLoading() }
									className={ styles.countryCode }>
									<option value="" disabled>{ i18n.translate( 'Select Country' ) }</option>
									<option disabled />
									{ countries.hasLoadedFromServer && countries.data.map( ( country, index ) => (
										country.name
										? <option value={ country.code } key={ country.code }>{ country.name }</option>
										: <option value=" " key={ index } disabled />
									) ) }
								</select>
								<ValidationError field={ fields.countryCode } />
							</fieldset>

							<fieldset>
								<label>{ i18n.translate( 'Phone' ) }</label>
								<Input
									disabled={ this.isDataLoading() }
									field={ fields.phone }
									untouch={ untouch }
									onBlur={ this.handleBlurBound }
									className={ styles.phone }
									placeholder={ i18n.translate( 'Phone' ) }
								/>
								<ValidationError field={ fields.phone } />
							</fieldset>
						</div>
					}
					submitArea={
						<div>
							<p className={ styles.disclaimer }>
								{ i18n.translate( 'Some providers charge a fee to keep this information private, but we protect your privacy free of charge.' ) }
							</p>

							<button disabled={ this.props.submitting }>
								{ i18n.translate( 'Continue to Checkout' ) }
							</button>
						</div>
					} />
			</div>
		);
	}
}

ContactInformation.propTypes = {
	contactInformation: PropTypes.object.isRequired,
	countries: PropTypes.object.isRequired,
	domain: PropTypes.string,
	fetchCountries: PropTypes.func.isRequired,
	fetchLocation: PropTypes.func.isRequired,
	fields: PropTypes.object.isRequired,
	handleSubmit: PropTypes.func.isRequired,
	inputVisibility: PropTypes.object.isRequired,
	isLoggedIn: PropTypes.bool.isRequired,
	isLoggedOut: PropTypes.bool.isRequired,
	location: PropTypes.object.isRequired,
	redirectToCheckout: PropTypes.func.isRequired,
	redirectToHome: PropTypes.func.isRequired,
	resetInputVisibility: PropTypes.func.isRequired,
	showAddress2Input: PropTypes.func.isRequired,
	showOrganizationInput: PropTypes.func.isRequired,
	states: PropTypes.object.isRequired,
	submitting: PropTypes.bool.isRequired,
	user: PropTypes.object.isRequired,
	validateContactInformation: PropTypes.func.isRequired
};

export default withStyles( styles )( ContactInformation );
