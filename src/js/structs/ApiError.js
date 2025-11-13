import Vue from "vue"
import store from "../store"
import http from "../http"

export default class ApiError {
    constructor(error_name, status_code = 400, data = null){
        if( typeof error_name !== 'string'
            || error_name.trim().length === 0 )
        {
            error_name = 'UNKNOWN_ERROR';
        }

        this.error_name = error_name;
        this.status_code = status_code;
        this.data = data; 
    }

    getName(){
        return this.error_name;
    }

    getStatusCode()
    {
        return this.status_code;
    }

    getData(){
        return this.data;
    }

    /**
     * Prüft, ob es sich beidem Fehler um den angegebenen Fehler handelt
     * 
     * @param string error_name Der Name des Fehlers, auf den geprüft werden soll
     * @return bool Liefert true, wenn es sich um den angegebenen Fehler handel, ansonsten false
     */
    is(error_name){
        return this.error_name === error_name;
    }
}

export function handleApiError(error)
{
    if( error.response )
    {
        if( error.response.status >= 500 )
        {
            throw new ApiError('UNKNOWN_ERROR', error.response.status);
        }

        // Benutzer nicht (mehr) eingeloggt?
        if( error.response.data.error === 'UNAUTHORIZED' )
        {
            store.dispatch('account/logout');
        }

        throw new ApiError(error.response.data.error, 
                            error.response.data.status_code,
                            error.response.data.data);
    }
    else if( error.request )
    {
        //TODO: Errorhandling verbessern 
        throw new ApiError('NETWORK_ERROR', 0);
    }

    if( Vue.config.devtools )
    { 
        console.error(error); 
    }

    // JavaScript Errors in asynchronen Funktionen an den Server schicken
    try {
        var data = {
            name: error.name,
            message: error.message,
            source: 'handleApiError',
            location: window.location.href
        };

        if( "stack" in error ){ data.stack = error.stack; }
        if( "fileName" in error ){ data.source = error.fileName; }
        if( "lineNumber" in error ){ data.line = error.lineNumber; }

        http.post(`${process.env.VUE_APP_API_BASE_URL}/error_log`, data);
    }
    catch(e){ 
        //TODO: Error-Handling für den Error-Handler
    }

    throw new ApiError('UNKNOWN_ERROR');
}