import Cookies from "js-cookie"
import Vue from "vue"

var api_token_name = 'api_token';

export function setApiTokenCookie(api_token){
    Cookies.set(api_token_name, api_token, {
        secure: !Vue.config.devtools  // HTTPS nicht erforderlich, wenn sich die Anwendung nicht im production Mode befindet
    });
}

export function getApiTokenCookie(){
    var value =  Cookies.get(api_token_name);

    if( typeof value === 'undefined' )
    {
        return null;
    }

    return value;
}

export function deleteApiTokenCookie(){
    Cookies.remove(api_token_name);
}