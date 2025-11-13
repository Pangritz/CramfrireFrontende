import Vue from "vue"
import getInitState from "./init_states/account"
import http from "../http"
import ApiError, {handleApiError} from "../structs/ApiError"
import {setStorageData, getStorageData, removeStorageData} from "../helpers/storageHelpers"
import {setApiTokenCookie, getApiTokenCookie, deleteApiTokenCookie} from "../helpers/apiTokenCookieHelpers"

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;

export default {
    namespaced: true,

    state: {
        ...getInitState()
    },

    getters: {
        isLoggedIn(state){
            return (state.me !== false && 'api_token' in state.me);
        },

        loggedInUser(state){
            return state.me;
        },

        isPremium(state){
            if( state.me === false )
            {
                return false;
            }

            var expires_at_timestamp_in_ms = state.me.expires_at * 1000;

            return (expires_at_timestamp_in_ms >= Date.now());
        },

        api_token(state){
            if( state.me !== false && 'api_token' in state.me )
            {
                return state.me.api_token;
            }

            return null;
        }
    },

    mutations: {
        setLoggedInUser(state, data){
            state.me = data;
        },

        setCheckAuthRoute(state, route){
            state.checkauth_route = route;
        },

        resetState(state){
            var initState = getInitState();
            
            for(var key in initState)
            {
                Vue.set(state, key, initState[key]);
            }
        },

        setExpiresAt(state, new_expires_at){
            if( state.me !== false )
            {
                state.me.expires_at = new_expires_at;
            }
        },
    },

    actions: {
        login(context, data){
            return http.post(`${API_BASE_URL}/account/login`, {
                email: data.email,
                password: data.password,
            }).then(function(response){
                context.commit('setLoggedInUser', response.data.data);
                
                if( data.remember )
                {
                    setStorageData('remember_api_token', response.data.data.api_token, 'local');
                    // zur Sicherheit möglichen API Token als Cookie löschen
                    deleteApiTokenCookie();
                }
                else
                {
                    setApiTokenCookie(response.data.data.api_token);
                    // zur Sicherheit mögliche API Tokens aus dem localstorage löschen
                    removeStorageData('remember_api_token', 'local');
                }

                return response.data.data;
            }).catch(handleApiError);
        },

        logout(context){
            // für den Fall, dass der Nutzer "angemeldet bleiben" ausgewählt hatte
            removeStorageData('remember_api_token', 'local');
            // für den Fall, dass der Nutzer nicht "angemeldet bleiben" ausgewählt hatte
            deleteApiTokenCookie();

            // State resetten, damit alle Daten des vorher eingeloggten Benutzers entfernt werden 
            context.commit('resetState');

            // alle Daten aus dem anderen Modulen löschen, die dem vorher eingeloggten Nutzer zugeordnet werden
            context.commit('cardbox/resetState', null, {root:true});
            context.commit('options/resetState', null, {root:true});
        },

        checkLogin(context){
            return new Promise(function(resolve, reject){

                if( context.state.me !== false && 'api_token' in context.state.me )
                {
                    // Ob der Nutzer eingeloggt wurde, wurde bei diesem Besuch bereits überprüft. 
                    // Theoretisch könnte z.B. der API Token inzwischen ungültig sein, aber 
                    // der wird ja bei jedem Request an die API entsprechend überprüft und gegebenenfalls
                    // ein Error geliefert, wenn er nicht mehr gültig ist.
                    resolve(context.state.me);
                    return;
                }

                var api_token = null;

                if( context.state.me !== false && 'api_token' in context.state.me )
                {
                    // aktuell eingeloggt? 
                    api_token = context.state.me.api_token;
                }
                else if ( getApiTokenCookie() !== null )
                {
                    api_token = getApiTokenCookie();
                }
                else
                {
                    // noch mit "angemeldet bleiben" eingeloggt?
                    api_token = getStorageData('remember_api_token', 'local');
                }

                if( api_token === null || api_token === '' )
                {
                    // ohne API Token, kann der Nutzer auch nicht eingeloggt sein => den Request kann man sich sparen
                    reject(new ApiError('USER_NOT_LOGGED_IN', 401));
                    return;
                }

                // Prüfen, ob der API Token gültig ist und die Nutzerdaten laden
                context.dispatch('loadLoggedInUser', api_token).then(function(user){
                    resolve(user);
                }).catch(function(error){
                    reject(error);
                });
            });
        },

        loadLoggedInUser(context, api_token){

            if( typeof api_token === "undefined"
                && context.getters.isLoggedIn === true )
            {
                // Wenn kein API Token übergeben wurde, 
                // der Nutzer aber eingeloggt ist, 
                // wird der API Token aus den Daten im State verwendet
                api_token = context.getters.api_token;
            }

            return http.get(`${API_BASE_URL}/account/me`, {headers: { Authorization: 'Bearer ' + api_token }})
                        .then(function(response){
                            context.commit('setLoggedInUser', response.data.data);
                            return response.data.data;
                        })
                        .catch(function(error){
                            if( error.response )
                            {
                                if( error.response.status >= 500 )
                                {
                                    throw new ApiError('UNKNOWN_ERROR', error.response.status);
                                }

                                if( error.response.status == 401 )
                                {
                                    // der Nutzer ist nicht (mehr) eingeloggt
                                    context.dispatch('logout');
                                }

                                throw new ApiError(error.response.data.error, 
                                                    error.response.data.status_code,
                                                    error.response.data.data);
                            }

                            //TODO: Errorhandling verbessern 
                            throw new ApiError('NETWORK_ERROR', 0);
                        });
        },

        resetState(context){
            context.commit('resetState');
        },

        signup(context, data){
            return http.post(`${API_BASE_URL}/account/signup`, data).then(function(response){
                return response.data.success;
            }).catch(handleApiError);
        },

        email_confirmation(context, data){
            return http.post(`${API_BASE_URL}/account/email-confirmation`, data).then(function(response){
                return response.data.success;
            }).catch(handleApiError);
        },

        password_forgotten(context, data){
            return http.post(`${API_BASE_URL}/account/password-forgotten`, data)
                        .then(function(response){
                            return response.data.success;
                        })
                        .catch(handleApiError);
        },

        password_reset(context, data){
            return http.post(`${API_BASE_URL}/account/password-reset`, data)
                        .then(function(response){
                            return response.data.success;
                        })
                        .catch(handleApiError);
        },

        email_change(context, data){
            return http.post(`${API_BASE_URL}/account/email-change`, data)
                       .then((response) => {
                           return response.data.success;
                       })
                       .catch(handleApiError);
        },

        password_change(context, data)
        {
            return http.post(`${API_BASE_URL}/account/password-change`, data)
                       .then((response) => {
                           return response.data.success;
                       })
                       .catch(handleApiError);
        },

        delete_account(context, data){
            return http.post(`${API_BASE_URL}/account/delete`, data)
                       .then(() => {
                            context.dispatch('logout');
                       })
                       .catch(handleApiError);
        },

        setCheckAuthRoute(context, route){
            return new Promise(function(resolve){
                context.commit('setCheckAuthRoute', route);

                resolve(route);
            })            
        },

        clearCheckAuthRoute(context){
            context.commit('setCheckAuthRoute', null);
        },

        // Zum Beispiel für nach dem Einlösen eines Gutscheins
        setExpiresAt(context, new_expires_at){
            context.commit('setExpiresAt', new_expires_at);
        },
    },

}