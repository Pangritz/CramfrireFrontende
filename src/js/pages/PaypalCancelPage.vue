<template>
<div>
    <ApiErrorMessage v-if="error && !loading" :error="error" :error_messages="{
        PAYPAL_TRANSACTION_NOT_FOUND: $t('PAYPAL_TRANSACTION_NOT_FOUND')      
    }" />

    <CramfireLoadingIndicator v-if="loading" height="300" />

    <v-alert :value="!loading && !error" icon="warning" outlined color="error">
        {{$t('message')}}
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
        }
    },

    mounted(){
        http.post(`${process.env.VUE_APP_API_BASE_URL}/paypal/cancel`, {order_id: this.$route.query.token})
            .then(() => {
                this.loading = false;
                this.error = false;
            })
            .catch(handleApiError)
            .catch((error) => {
                this.error = error; 
                this.loading = false;
            });
    },

}
</script>

<i18n>
{
    "de": {
        "message": "Die Transaktion wurde abgebrochen.",

        "PAYPAL_TRANSACTION_NOT_FOUND": "Die aufgerufene Paypal-Transaktion konnte nicht gefunden werden."
    }
}
</i18n>