<template>
    <CramfireLoadingIndicator :height="200" />
</template>

<script>
import CramfireLoadingIndicator from "../components/CramfireLoadingIndicator"
import {setStorageData} from "../helpers/storageHelpers"
import http from "../http"
import {handleApiError} from "../structs/ApiError"

export default {

    components: {
        CramfireLoadingIndicator
    },
    
    created(){
        // Ein Reflink wurde erkannt
        var ref_code = this.$route.params.ref_code.trim().replace(/[^A-Za-z0-9]/, '');

        if( ref_code !== null && ref_code.trim() !== '')
        {
            // Prüfen, ob der Code gültig/aktiv ist 
            http.post(`${process.env.VUE_APP_API_BASE_URL}/friendcode/check`, {code: ref_code})
                .then(() => { 
                    // Ref Code gültig und aktiv => speichern und weiterleiten
                    setStorageData('ref', ref_code, 'session');
                    this.$router.push({name: 'account.signup'}).catch(() => {});
                })
                .catch(handleApiError)
                .catch((error) => {
                    if( error.getName() === 'INVALID_CODE')
                    {
                        // der Code ist offenbar nicht (mehr) gültig
                        //TODO: Überlegen, ob wir diesen Fehler anzeigen sollten oder nicht
                    } 
                    
                    // Trotzdem weiterleiten, auch wenn es einen Fehler gab, damit der Nutzer sich wenigstebs
                    // ohne Freunde-Bonus anmelden kann
                    this.$router.push({name: 'account.signup'}).catch(() => {});
                });
        }
        
    },

}
</script>