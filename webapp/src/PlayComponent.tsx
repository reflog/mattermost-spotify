import {GlobalState} from 'mattermost-redux/types/store';
import * as React from 'react';
import {connect} from 'react-redux';

import {PlayPauseIcon} from './Icons';
import {id as pluginId} from './manifest';
import {SpotifyPlayerState} from './model';

function PlayComponent({status}:{ status: SpotifyPlayerState | null }) {
    return <PlayPauseIcon playing={status ? status.is_playing : false}/>;
}
const mapStateToProps = (state: GlobalState) => {
    return ({
        status: state['plugins-' + pluginId].spotifyStatus,
    });
};
export default connect(mapStateToProps)(PlayComponent);
