import http from "../http"
import {handleApiError} from "../structs/ApiError"
import i18n from "../i18n"

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;

export default {
    namespaced: true,

    state: {
        languages: {},

        // Wurden bereits alle Sprachen geladen?
        all_languages_loaded: false,
    },

    getters: {
        allLanguagesLoaded(state){
            return state.all_languages_loaded;
        },

        allLoadedLanguages(state){
            return state.languages;
        },

        allUsedLanguages(state, getters, globalState, globalGetters){
            var cardboxes = globalGetters['cardbox/user_cardboxes'];
            var languages = {};

            for(var cardbox_id in cardboxes)
            {
                var cardbox = cardboxes[cardbox_id];
                var front_language_id = cardbox.front_language;
                var back_language_id  = cardbox.back_language;

                if( front_language_id in state.languages )
                {
                    languages[front_language_id] = state.languages[front_language_id];
                }

                if( back_language_id in state.languages )
                {
                    languages[back_language_id] = state.languages[back_language_id];
                }
            }

            return languages;
        },

        allUsedLanguagesAsList(state, getters){
            var used_languages = getters.allUsedLanguages;
            var language_list = [];

            for(var id in used_languages)
            {
                var language = used_languages[id];

                language_list.push({
                    "id": language.id,
                    "name": i18n.t('global.languages.'+language.shortcode),
                    "shortcode": language.shortcode, 
                    "position": language.position
                });
            }

            // 1. nach Position und 2. alphabetisch sortieren 
            return language_list.sort(function(a, b){
                if( a.position === b.position)
                {
                    return a.name.localeCompare(b.name);
                }
                
                return a.position - b.position;
            });
        },

        allLoadedLanguagesAsList(state){
            var list = [];
            
            for(var id in state.languages)
            {
                var language = state.languages[id];

                list.push({
                    "id": language.id,
                    "name": i18n.t('global.languages.'+language.shortcode),
                    "shortcode": language.shortcode, 
                    "position": language.position
                });
            }

            // 1. nach Position und 2. alphabetisch sortieren 
            list.sort(function(a, b){
                if( a.position === b.position)
                {
                    return a.name.localeCompare(b.name);
                }
                
                return a.position - b.position;
            });

            return list;
        },

        languageById(state){
            return function(language_id){
                if( language_id in state.languages)
                {
                    return state.languages[language_id];
                }

                return null;
            }
        },

    },

    mutations: {
        setLanguages(state, languages){
            state.languages = languages;
        },

        addLanguages(state, languages){
            state.languages = {
                ...state.languages,
                ...languages
            };
        },

        setAllLanguagesLoaded(state, value){
            state.all_languages_loaded = value;
        }
    },

    actions: {
        setLanguages(context, languages){
            context.commit('setLanguages', languages);
        },

        addLanguages(context, languages){
            context.commit('addLanguage', languages);
        },

        loadAllLanguages(context){
            return http.get(`${API_BASE_URL}/language`)
                       .then(function(response){
                            context.commit('setLanguages', response.data.data);
                            context.commit('setAllLanguagesLoaded', true);
                            return response.data.data;
                       })
                       .catch(handleApiError);
        }
    },

}