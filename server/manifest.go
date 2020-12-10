// This file is automatically generated. Do not modify it manually.

package main

import (
	"strings"

	"github.com/mattermost/mattermost-server/v5/model"
)

var manifest *model.Manifest

const manifestStr = `
{
  "id": "com.kodermonkeys.spotify",
  "name": "Mattermost Spotify Integration",
  "description": "This plugin integrates Spotify into Mattermost.",
  "version": "0.1.0",
  "min_server_version": "5.12.0",
  "server": {
    "executables": {
      "linux-amd64": "server/dist/plugin-linux-amd64",
      "darwin-amd64": "server/dist/plugin-darwin-amd64",
      "windows-amd64": "server/dist/plugin-windows-amd64.exe"
    },
    "executable": ""
  },
  "webapp": {
    "bundle_path": "webapp/dist/main.js"
  },
  "settings_schema": {
    "header": "Set your Spotify Developer settings",
    "footer": "",
    "settings": [
      {
        "key": "ClientId",
        "display_name": "Client ID",
        "type": "text",
        "help_text": "Client ID from your Spotify Application",
        "placeholder": "",
        "default": null
      },
      {
        "key": "ClientSecret",
        "display_name": "Client Secret",
        "type": "text",
        "help_text": "Client Secret from your Spotify Application",
        "placeholder": "",
        "default": null
      }
    ]
  }
}
`

func init() {
	manifest = model.ManifestFromJson(strings.NewReader(manifestStr))
}