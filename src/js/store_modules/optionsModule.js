import Vue from "vue"
import getInitState from "./init_states/options"
import http from "../http"
import { handleApiError } from "../structs/ApiError";

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;

export default {
    namespaced: true,

    state: {
        ...getInitState()
    },

    getters: {
        
    },

    mutations: {
        setAllOptions(state, data){
            for(var namespace in data)
            {
                for(var key in data[namespace])
                {
                    Vue.set(state[namespace], key, data[namespace][key]);
                }
            }
        },

        setOption(state, data){
            Vue.set(state[data.namespace], data.key, data.value);
        },

        resetState(state){
            var initState = getInitState();
            
            for(var namespace in initState)
            {
                for(var key in initState[namespace])
                {
                    Vue.set(state[namespace], key, initState[namespace][key]);
                }
            }
        }
    },

    actions: {
        loadOptions(context){
            http.get(`${API_BASE_URL}/user_settings`)
                .then((response) => {
                    context.commit('setAllOptions', response.data.data);
                })
                .catch(handleApiError);
        },

        setOption(context, data){
            var settings = {};
            settings[data.namespace] = {};
            settings[data.namespace][data.key] = data.value; 

            http.post(`${API_BASE_URL}/user_settings`, settings)
                .then(() => context.commit('setOption', data) )
                .catch(handleApiError)
                .catch(() => { }); 
        },

        resetState(context){
            context.commit('resetState');
        }
    },

}