import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {GlobalState} from 'mattermost-redux/types/store';
import * as React from 'react';
import {connect} from 'react-redux';

import {id as pluginId} from './manifest';
import {SpotifyPlayerState} from './model';

type Props = { SiteURL?: string, UID?: string };
class SpotifyInfo extends React.PureComponent<Props, { status: SpotifyPlayerState | null }> {
    constructor(props: Props) {
        super(props);
        this.state = {status: null};
    }
    componentDidMount() {
        if (this.props.SiteURL && this.props.UID) {
            fetch(`${this.props.SiteURL}/plugins/${pluginId}/status/${this.props.UID}`).then((r) => r.json()).then((data: SpotifyPlayerState) => {
                this.setState({status: data});
            });
        }
    }

    render() {
        if (!this.state.status) {
            return (<span>{'Spotify: Not connected'}</span>);
        }
        if (!this.state.status.is_playing) {
            return (<span>{'Spotify: Not playing'}</span>);
        }
        return (<span>{'Spotify Playing: '}{this.state.status.Item.name}{' by '}{this.state.status.Item.artists[0].name}</span>);
    }
}
const mapStateToProps = (state: GlobalState, ownProps: any) => {
    const id = ownProps.user ? ownProps.user.id : '';
    return ({
        SiteURL: getConfig(state).SiteURL,
        UID: id,
    });
};
export default connect(mapStateToProps)(SpotifyInfo);
