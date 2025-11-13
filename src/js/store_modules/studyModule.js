import http from "../http"
import {handleApiError} from "../structs/ApiError"

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;

export default {
    namespaced: true,

    state: {
    },

    getters: {
        
    },

    mutations: {
        
    },

    actions: {
        loadTraining(context, data)
        {
            return http.post(`${API_BASE_URL}/study`, data)
                       .then((response) => {
                           if( 'cards' in response.data )
                           {
                                context.commit('cardbox/addCards', response.data.cards, {root:true});
                           }
                            
                           return response.data.data;
                       })
                       .catch(handleApiError);
        }
    },

}