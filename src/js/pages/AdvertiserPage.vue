<template>
<div>
    <PageTitle :text="$t('page_title')" icon="person_add" />

    <v-card>
        <v-card-text>
            <p class="body-2">
                Empfehle Cramfire deinen Freunden, Mitschülern oder Kommilitonen und verdiene dir damit ganz leicht und kostenlos zusätzliche Premiumzeit!
            </p>

            <p class="body-2">
                Du und dein Freund erhalten jeweils 14 Tage zusätzlich gutgeschrieben, wenn sich dein Freund über deinen Link bei uns registriert 
                oder innerhalb von 1-2 Tagen nach seiner Registrierung deinen Freunde-Code als Gutschein eingibt.
            </p>

            <p class="body-2">
                Zusätzlich erhältst du immer eine Gutschrift in Höhe von 10% der Premiumzeit, die ein von dir geworbener Freund kauft!
            </p>

            <CramfireLoadingIndicator v-if="loading" height="200" />

            <ApiErrorMessage :error="error" v-if="error && !loading" />

            <div class="text-center" v-if="!loading && !error && !active && code === null">
                <v-checkbox v-model="terms_accepted"
                            :false-value="false"
                            :true-value="true"
                            class="justify-center">
                    <template v-slot:label>
                        <i18n path="terms_accepted_label">
                            <template v-slot:terms_link>
                                <a :href="terms_link" :title="$t('terms_link_title')" @click.stop>{{$t('terms_caption')}}</a>
                            </template>
                        </i18n>
                    </template>
                </v-checkbox>

                <v-btn color="primary" @click="submit" :loading="loading_create" :disabled="loading_create || !terms_accepted">
                    {{$t('submit')}}
                </v-btn>
            </div>

            <v-alert :value="!loading && !error && !active && code !== null" outlined color="warning" icon="warning">
                {{$t('advertiser_inactive')}}
            </v-alert>

            <v-container v-if="!loading && !error && active === true">
                <v-row class="justify-center">
                    <v-col cols="12" md="6">
                        <v-text-field :label="$t('code_label')"
                                    v-model="code"
                                    outlined
                                    readonly 
                                    append-icon="file_copy"
                                    @click:append="copy('code_input')"
                                    ref="code_input" />
                                            
                        <v-text-field :label="$t('link_label')"
                                    v-model="link"
                                    outlined
                                    readonly 
                                    append-icon="file_copy"
                                    @click:append="copy('link_input')"
                                    ref="link_input" />

                        <p class="body-1 text-center">{{$tc('active_leads_count_text', active_leads_count)}}</p>                
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
    </v-card>
</div>
</template>

<script>
import PageTitle from "../components/PageTitle"
import CramfireLoadingIndicator from "../components/CramfireLoadingIndicator"
import ApiErrorMessage from "../components/ApiErrorMessage"
import http from "../http"
import { handleApiError} from '../structs/ApiError'

export default {
    
    components: {
        PageTitle,
        ApiErrorMessage,
        CramfireLoadingIndicator,
    },

    data(){
        return {
            error: false,
            loading: true,

            error_create: false,
            loading_create: false,

            terms_link: "https://www.cramfire.com/freunde-werben-bedingungen",
            terms_accepted: false,

            code: null,
            active_leads_count: 0,
            active: false,
        }
    },

    created(){
        http.get(`${process.env.VUE_APP_API_BASE_URL}/friendcode`)
            .then((response) => {
                this.code = response.data.data.code;
                this.active = response.data.data.active;
                this.active_leads_count = response.data.data.active_leads_count;

                this.loading = false;
                this.error = false;
            })
            .catch(handleApiError)
            .catch((error) => {
                if( error.getName() !== 'NO_ADVERTISER' )
                {
                    this.error = error;
                }

                this.loading = false;
            });
    },

    computed: {
        link(){
            if( this.code === null)
            {
                return null;
            }

            var port = '';

            if( window.location.port.length > 0 )
            {
                port = ':'+window.location.port;
            }

            return window.location.protocol+'//'+window.location.hostname+port+'/ref/'+this.code;
        }
    },

    methods: {
        submit(){
            if( this.terms_accepted !== true )
            {
                return;
            }

            this.loading_create = true;

            http.post(`${process.env.VUE_APP_API_BASE_URL}/friendcode/create`, {
                terms_accepted: this.terms_accepted
            })
            .then((response) => {
                this.loading_create = false;
                this.error_create = false;

                this.code = response.data.data.code;
                this.active = response.data.data.active;
                this.active_leads_count = response.data.data.active_leads_count;
            })
            .catch(handleApiError)
            .catch((error) => {
                this.error_create = error;
                this.loading_create = false;
            });
        },

        copy(ref_name){
            this.$nextTick(() => {
                var input = this.$refs[ref_name].$el.querySelector('input[type=text]');
                input.select();
                input.setSelectionRange(0, 99999); /*For mobile devices*/

                document.execCommand("copy");
            })
        },
    }
}
</script>

<i18n>
{
    "de": {
        "page_title": "Freunde werben",

        "code_label": "Gutscheincode",
        "link_label": "Link",
        "terms_caption": "Teilnahmebedingungen",
        "terms_link_title": "Zu den @:terms_caption",
        "terms_accepted_label": "Ich akzeptiere die {terms_link}",
        "submit": "Meinen Freunde-Code anzeigen",

        "active_leads_count_text": "Du hast noch keine Freunde geworben. | Du hast einen Freund geworben | Du hast {count} Freunde geworben",

        "advertiser_inactive": "Dein Freunde-Code und Link wurde deaktiviert! Für weitere Informationen kannst du uns jederzeit über die im Impressum stehende E-Mail-Adresse kontaktieren."
    }
}
</i18n>