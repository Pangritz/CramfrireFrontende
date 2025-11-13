export var storageAvailable = (function(){
    var cached_result = {
        'local': null,
        'session': null
    };    
    
    return function(type){
        type = type.toLowerCase();

        if( cached_result[type] !== null ){ return cached_result[type]; }

        var storage;
        try {
            storage = window[type+'Storage'];
            var x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);

            cached_result[type] = true
            return cached_result[type];
        }
        catch(e) {
            cached_result[type] = e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // acknowledge QuotaExceededError only if there's something already stored
                (storage && storage.length !== 0);    

            return cached_result[type];
        }
    }
})();

// Speichert nur etwas im Local- bzw. SessionStorage, wenn dies auch wirklich möglich ist
export function setStorageData(key, value, type){
    if( storageAvailable(type) )
    {
        // Storage vorhanden und verwendbar
        window[type+'Storage'].setItem(key, value);
    }
}

export function getStorageData(key, type){
    if( storageAvailable(type) )
    {
        // Storage vorhanden und verwendbar
        return window[type+'Storage'].getItem(key);
    }

    return null;
}

export function removeStorageData(key, type){
    if( storageAvailable(type) )
    {
        // Storage vorhanden und verwendbar
        window[type+'Storage'].removeItem(key);
    }
}