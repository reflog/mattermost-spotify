package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/mattermost/mattermost-server/v5/model"
	"github.com/mattermost/mattermost-server/v5/plugin"
	"github.com/zmb3/spotify"
	"golang.org/x/oauth2"
)

// Plugin implements the interface expected by the Mattermost server to communicate between the server and plugin processes.
type Plugin struct {
	plugin.MattermostPlugin

	// configurationLock synchronizes access to the configuration.
	configurationLock sync.RWMutex

	// configuration is the active plugin configuration. Consult getConfiguration and
	// setConfiguration for usage.
	configuration *configuration
	auth          *spotify.Authenticator
}

func (p *Plugin) handleSpotify(w http.ResponseWriter, r *http.Request, userId string, clientCode func(client *spotify.Client) (interface{}, error)) {
	tData, _ := p.API.KVGet("token-" + userId)
	if tData == nil {
		http.Error(w, "no token for uid "+userId, http.StatusBadRequest)
		return
	}
	var tok oauth2.Token
	if err := json.Unmarshal(tData, &tok); err != nil {
		http.Error(w, "cannot unmarshal token", http.StatusBadRequest)
		return
	}

	client := p.auth.NewClient(&tok)
	if m, _ := time.ParseDuration("5m30s"); time.Until(tok.Expiry) < m {
		newToken, _ := client.Token()
		tokS, _ := json.Marshal(newToken)
		p.API.KVSet("token-"+userId, tokS)
	}

	ps, err := clientCode(&client)
	if err != nil {
		http.Error(w, "cannot perform spotify commands: "+err.Error(), http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(ps)
}

// ServeHTTP demonstrates a plugin that handles HTTP requests by greeting the world.
func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	if strings.HasPrefix(r.URL.Path, "/callback") {
		if st := r.FormValue("state"); st != "123" {
			http.NotFound(w, r)
			log.Printf("State mismatch: %s != %s\n", st, "123")
			return
		}
		tok, err := p.auth.Token("123", r)
		if err != nil {
			http.Error(w, "Couldn't get token", http.StatusForbidden)
			log.Println(err)
			return
		}
		cli := p.auth.NewClient(tok)
		cu, err := cli.CurrentUser()
		if err != nil {
			http.Error(w, "Couldn't get user", http.StatusForbidden)
			log.Println(err)
			return
		}
		uidRaw, _ := p.API.KVGet("email-" + cu.Email)
		if uidRaw == nil {
			http.Error(w, "no email key for "+cu.Email, http.StatusForbidden)
			return
		}
		emailRaw, _ := p.API.KVGet("uid-" + string(uidRaw))
		if emailRaw == nil {
			http.Error(w, "no uid key for "+string(uidRaw), http.StatusForbidden)
			return
		}
		// TODO: validate email/uid pair
		tokS, _ := json.Marshal(tok)
		p.API.KVSet("token-"+string(uidRaw), tokS)
		w.WriteHeader(http.StatusOK)
		return
	} else if strings.HasPrefix(r.URL.Path, "/status") {
		parts := strings.Split(r.URL.Path, "/")
		userId := parts[len(parts)-1]
		if userId == "" {
			http.Error(w, "invalid url", http.StatusBadRequest)
			return
		}
		p.handleSpotify(w, r, userId, func(client *spotify.Client) (interface{}, error) { return client.PlayerState() })
		return
	} else if strings.HasPrefix(r.URL.Path, "/me") {
		cookie, _ := r.Cookie("MMUSERID")
		if cookie == nil || cookie.Value == "" {
			http.Error(w, "invalid cookie", http.StatusBadRequest)
			return
		}
		p.handleSpotify(w, r, cookie.Value, func(client *spotify.Client) (interface{}, error) { return client.PlayerState() })
		return
	} else if strings.HasPrefix(r.URL.Path, "/command") {
		cookie, _ := r.Cookie("MMUSERID")
		if cookie == nil || cookie.Value == "" {
			http.Error(w, "invalid cookie", http.StatusBadRequest)
			return
		}
		if command := r.FormValue("command"); command != "" {
			p.handleSpotify(w, r, cookie.Value, func(client *spotify.Client) (interface{}, error) {
				var err error
				oldStatus, err := client.PlayerState()
				if err != nil {
					return nil, err
				}
				if command == "play/pause" {
					if oldStatus.Playing {
						err = client.Pause()
					} else {
						err = client.Play()
					}
				} else if command == "prev" {
					err = client.Previous()
				} else if command == "next" {
					err = client.Next()
				}
				if err != nil {
					return nil, err
				}
				return client.PlayerState()
			})
		}
		return
	}
	http.NotFound(w, r)
}

// See https://developers.mattermost.com/extend/plugins/server/reference/

func getAutocompleteData() *model.AutocompleteData {
	command := model.NewAutocompleteData("spotify", "", "Enables or disables spotify intgeration.")
	command.AddStaticListArgument("", true, []model.AutocompleteListItem{
		{
			Item:     "enable",
			HelpText: "Enable Spotify integration",
		}, {
			Item:     "disable",
			HelpText: "Disable Spotify integration",
		},
	})

	return command
}

func (p *Plugin) returnHelp() (*model.CommandResponse, *model.AppError) {
	return &model.CommandResponse{
		ResponseType: model.COMMAND_RESPONSE_TYPE_EPHEMERAL,
		Text:         "Only enable/disable commands are supported!",
	}, nil
}

func (p *Plugin) ExecuteCommand(c *plugin.Context, args *model.CommandArgs) (*model.CommandResponse, *model.AppError) {
	parts := strings.Fields(args.Command)
	trigger := strings.TrimPrefix(parts[0], "/")
	if trigger == "spotify" {
		if len(parts) < 2 {
			return p.returnHelp()
		}

		if parts[1] == "enable" {
			if len(parts) != 3 {
				return &model.CommandResponse{
					ResponseType: model.COMMAND_RESPONSE_TYPE_EPHEMERAL,
					Text:         "Syntax: /spotify enable your@spotifyemail.com",
				}, nil
			}
			email := parts[2]
			p.API.KVSet("email-"+email, []byte(args.UserId))
			p.API.KVSet("uid-"+args.UserId, []byte(email))
			// get the user to this URL - how you do that is up to you
			// you should specify a unique state string to identify the session
			url := p.auth.AuthURLWithOpts("123")
			return &model.CommandResponse{
				ResponseType: model.COMMAND_RESPONSE_TYPE_EPHEMERAL,
				GotoLocation: url,
				Text:         "Enabled!",
			}, nil
		} else if parts[1] == "disable" {
			if v, _ := p.API.KVGet("uid-" + args.UserId); v != nil {
				p.API.KVDelete("email-" + string(v))
			}
			p.API.KVDelete("uid-" + args.UserId)
			return &model.CommandResponse{
				ResponseType: model.COMMAND_RESPONSE_TYPE_EPHEMERAL,
				Text:         "Disabled!",
			}, nil
		} else {
			return p.returnHelp()
		}
	}
	return &model.CommandResponse{}, nil
}

func (p *Plugin) OnActivate() error {
	p.API.RegisterCommand(&model.Command{
		Trigger:          "spotify",
		AutoComplete:     true,
		AutoCompleteHint: "(enable|disable)",
		AutoCompleteDesc: "Spotify integration",
		AutocompleteData: getAutocompleteData(),
	})
	return nil
}
