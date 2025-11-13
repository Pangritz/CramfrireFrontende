<template>
<div>
    <PageTitle :text="$t('page_title')" icon="card_giftcard" />

    <v-card>
        <v-card-text>
            <p class="text-center title">{{$t('text')}}</p>

            <v-layout>
                <v-flex xs12 md6 offset-md3>

                    <ApiErrorMessage :error="error" 
                             :error_messages="$t('error_messages')"
                             v-if="error !== false && !loading" />

                    <v-alert :value="success && !loading" outlined color="success" icon="check">
                        {{$t('success_message', {value, new_expires_at})}}
                    </v-alert>

                    <v-text-field :label="$t('code_label')" 
                                  :placeholder="$t('code_placeholder')"
                                  v-model="code" />
                    
                    <div class="text-right">
                        <v-btn color="primary"
                            :loading="loading"
                            :disabled="loading || code.length === 0"
                            @click="submit">
                            <v-icon left>done</v-icon>
                            {{$t('submit')}}
                        </v-btn>
                    </div>
                </v-flex>
            </v-layout>
        </v-card-text>
    </v-card>
</div>
</template>

<script>
import PageTitle from "../components/PageTitle"
import ApiErrorMessage from "../components/ApiErrorMessage"
import http from "../http"
import { handleApiError } from '../structs/ApiError'

export default {
    
    components: {
        PageTitle,
        ApiErrorMessage,
    },

    data(){
        return {
            error: false,
            loading: false,
            success: false,

            code: '',
            value: 0,
            new_expires_at: null,
        }
    },

    methods: {
        submit(){
            if( this.code.length === 0 )
            {
                // Dürfte nicht vorkommen, weil der Submit-Button dann deaktiviert ist, aber zur Sicherheit den Fall abfangen
                return;
            }

            this.loading = true;

            http.post(`${process.env.VUE_APP_API_BASE_URL}/coupon`, {coupon: this.code})
                .then((response) => {
                    this.value = response.data.data.value;
                    
                    var new_date = new Date(response.data.data.new_expires_at * 1000);

                    var day = new_date.getDate();
                    if( day < 10 ){ day = '0'+day; }

                    var month = new_date.getMonth() + 1;
                    if( month < 10 ){ month = '0'+month; }

                    var year = new_date.getFullYear();

                    this.new_expires_at = day+'.'+month+'.'+year;

                    this.error = false;
                    this.loading = false;
                    this.success = true;

                    // Ablaufdatum des Benutzers updaten
                    this.$store.dispatch('account/setExpiresAt', response.data.data.new_expires_at);
                })
                .catch(handleApiError)
                .catch((error) => {
                    this.error = error;
                    this.success = false;
                    this.loading = false;
                })
        }
    }
}
</script>

<i18n>
{
    "de": {
        "page_title": "Gutscheine",
        "text": "Hier kannst du Gutscheine, Aktionscodes oder auch den Werbecode eines Freundes einlösen.",
        "code_label": "Code",
        "code_placeholder": "z.B. ABCD-1234-AB12",
        "submit": "Einlösen",

        "error_messages": {
            "COUPON_NOT_FOUND": "Der eingegebene Code ist ungültig.",
            "COUPON_ALREADY_USED": "Der eingegebene Code wurde bereits verwendet.",
            "COUPON_ALREADY_USED_BY_USER": "Du hast diesen Code bereits verwendet.",
            "COUPON_EXPIRED": "Der eingegebene Code ist bereits abgelaufen.",
            "COUPON_GROUP_ALREADY_USED": "Du kannst den eingegebenen Code nicht einlösen, da diese Gutschein mit einem anderen Gutschein verknüpft ist, den du bereits eingegeben hast.",
            "USER_ALREADY_LEAD": "Du kannst diesen Code nicht einlösen, da du bereits den Freunde-Bonus erhalten hast.",
            "USER_EXISTS_TOO_LONG": "Dieser Gutschein kann nur von neuen Nutzern eingegeben werden. Deine Registrierung liegt zu weit zurück.",
            "USER_IS_OWNER_OF_COUPON": "Du kannst nicht deinen eigenen Gutschein einlösen.",
            "ADVERTISER_ACCOUNT_IS_NEWER": "Du kannst nur den Gutschein eines Freundes einlösen, der länger bei uns registriert ist als du."
        },
        "success_message": "Der Gutschein wurde erfolgreich eingelöst. Deinem Konto wurden {value} Tage gutgeschrieben. Deine Premiumzeit läuft entsprechend nun am {new_expires_at} ab."
    }
}
</i18n>