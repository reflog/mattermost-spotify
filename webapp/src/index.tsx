
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {GlobalState} from 'mattermost-redux/types/store';

import * as React from 'react';
import {Action, Store} from 'redux';

import {SpotifyPlayerState} from 'model';
import {NextIcon, PrevIcon} from 'Icons';
import StatusComponent from 'StatusComponent';

import ActionTypes from './action_types';
import manifest, {id as pluginId} from './manifest';
import PlayComponent from './PlayComponent';
import Reducer from './reducers';
// eslint-disable-next-line import/no-unresolved
import {PluginRegistry} from './types/mattermost-webapp';

export const getPluginServerRoute = (state: GlobalState) => {
    const config = getConfig(state);

    let basePath = '/';

    if (config && config.SiteURL) {
        basePath = new URL(config.SiteURL).pathname;

        if (basePath && basePath[basePath.length - 1] === '/') {
            basePath = basePath.substr(0, basePath.length - 1);
        }
    }

    return basePath + '/plugins/' + pluginId;
};

function getMyStatus(state: GlobalState) {
    return new Promise((resolve, reject) => fetch(getPluginServerRoute(state) + '/me').then((r) => r.json()).then(resolve).catch(reject));
}

function sendSpotifyCommand(state: GlobalState, command: string) {
    const url = getPluginServerRoute(state) + '/command';
    const formData = new FormData();
    formData.append('command', command);
    return new Promise((resolve, reject) => fetch(url, {
        method: 'PUT',
        body: formData,
    }).then((r) => r.json()).then(resolve).catch(reject));
}

export default class Plugin {
    public async initialize(registry: PluginRegistry, store: Store<GlobalState, Action<Record<string, unknown>>>) {
        registry.registerPopoverUserAttributesComponent(StatusComponent);
        const state = store.getState();
        let status: SpotifyPlayerState | null = null;
        const disable = () => {
            status = null;
        };
        const handleConfigChange = (c: SpotifyPlayerState | null) => {
            status = c;
            store.dispatch({
                type: ActionTypes.RECEIVED_STATUS,
                data: c,
            });
            if (status) {
                tryRegister();
            } else {
                tryUnregister();
            }
        };
        let registeredComponents: any[] = [];
        const onPlayPause = () => {
            sendSpotifyCommand(state, 'play/pause').then(handleConfigChange).catch(disable);
        };
        const onNext = () => {
            sendSpotifyCommand(state, 'next').then(handleConfigChange).catch(disable);
        };
        const onPrev = () => {
            sendSpotifyCommand(state, 'prev').then(handleConfigChange).catch(disable);
        };
        const tryRegister = () => {
            if (!registeredComponents.length) {
                registeredComponents.push(
                    registry.registerChannelHeaderButtonAction(<PrevIcon/>, onPrev, 'prev', 'Previous Song'),
                    registry.registerChannelHeaderButtonAction(<PlayComponent/>, onPlayPause, 'Play/Pause', 'Play/Pause'),
                    registry.registerChannelHeaderButtonAction(<NextIcon/>, onNext, 'next', 'Next Song'));
            }
        };
        const tryUnregister = () => {
            const old = [...registeredComponents];
            registeredComponents = [];
            old.forEach((c) => registry.unregisterComponent(c));
        };

        const updateState = () => {
            getMyStatus(state).then(handleConfigChange).catch(disable);
        };
        registry.registerReducer(Reducer);
        setInterval(() => {
            updateState();
        }, 10 * 1000);
        updateState();
    }
}

declare global {
    interface Window {
        registerPlugin(id: string, plugin: Plugin): void
    }
}

window.registerPlugin(manifest.id, new Plugin());
