// Internal dependencies
import {
	NOTICE_ADD,
	NOTICE_REMOVE
} from 'reducers/action-types';

export function notices( state = [], action ) {
	const { notice, type } = action;

	switch ( type ) {
		case NOTICE_ADD:
			return [
				...state,
				notice
			];

		case NOTICE_REMOVE:
			state = state.filter( stateNotice => {
				return stateNotice.id !== notice.id;
			} );

			return [ ...state ];

		default:
			return state;
	}
}
