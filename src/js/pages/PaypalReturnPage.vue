<template>
<div>
    <ApiErrorMessage v-if="error && !loading" :error="error" :error_messages="{
        PAYPAL_TRANSACTION_NOT_FOUND: $t('PAYPAL_TRANSACTION_NOT_FOUND')      
    }" />

    <CramfireLoadingIndicator v-if="loading" height="300" />

    <v-alert :value="!loading && !error && success" icon="check" outlined color="success">
        {{$t('success_message')}}
    </v-alert>
</div>
</template>

<script>
import http from "../http"
import ApiErrorMessage from "../components/ApiErrorMessage"
import CramfireLoadingIndicator from "../components/CramfireLoadingIndicator"
import { handleApiError } from '../structs/ApiError'

export default {
    components: {
        CramfireLoadingIndicator,
        ApiErrorMessage
    },

    data(){
        return {
            loading: true,
            error: false,
            success: false,
        }
    },

    mounted(){
        http.post(`${process.env.VUE_APP_API_BASE_URL}/paypal/return`, {order_id: this.$route.query.token})
            .then(() => {
                this.loading = false;
                this.error = false;
                this.success = true;


                // das neue Ablaufdatum des Nutzers laden, 
                // indem die Daten des eingeloggten Nutzers allgemein neu geladen werden,
                // wenn der Nutzer eingeloggt ist
                if( this.$store.getters['account/isLoggedIn'] )
                {
                    this.$store.dispatch('account/loadLoggedInUser');
                }
            })
            .catch(handleApiError)
            .catch((error) => {
                this.error = error; 
                this.loading = false;
                this.success = false;
            });
    },

}
</script>

<i18n>
{
    "de": {
        "success_message": "Der Kauf wurde erfolgreich abgeschlossen und die Premiumzeit wurde deinem Konto gutgeschrieben. Vielen Dank!",

        "PAYPAL_TRANSACTION_NOT_FOUND": "Die aufgerufene Paypal-Transaktion konnte nicht gefunden werden."
    }
}
</i18n>