import axios from "axios"
import store from './store'

const http = axios.create ();

http.interceptors.request.use (
    function (config) {
        if( store.getters['account/isLoggedIn'] )
        {
            config.headers.Authorization = 'Bearer '+store.getters['account/loggedInUser'].api_token;
        }

        // Bei jedem Ajax Request mitschicken, da dies der CSRF Schutz darstellt, 
        // da ein Angreifer nicht von einer anderen Seite aus Header in einem Request setzen kann
        config.headers['X-Cramfire-Request'] = 'Web App';

        return config;
    },
    
    function (error) {
        return Promise.reject (error);
    }
);

export default http;