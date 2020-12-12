import {combineReducers} from 'redux';

import ActionTypes from './action_types';

function spotifyStatus(state = {}, action) {
    switch (action.type) {
    case ActionTypes.RECEIVED_STATUS: {
        return action.data;
    }
    default:
        return state;
    }
}

export default combineReducers({
    spotifyStatus,
});
