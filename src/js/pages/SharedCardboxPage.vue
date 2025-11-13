<template>
    <div>

        <ApiErrorMessage :error="error" v-if="error !== false" :error_messages="$t('error_messages')" />

        <CramfireLoadingIndicator v-if="loading" />

        <v-card v-if="cardbox !== null" class="mb-6">
            <v-card-title primary-title class="pt-0">
                <v-layout wrap>
                
                    <v-flex xs12 md8 lg9 mt-2 :pr-5="$vuetify.breakpoint.mdAndUp">
                        <h1 class="headline font-weight-bold">{{cardbox.name}}</h1>
                        <div class="body-1 word-break-normal">{{cardbox.description}}</div>
                        <div>
                            <span class="grey--text body-2">
                                {{$t('global.languages.'+front_language.shortcode)}} / {{$t('global.languages.'+back_language.shortcode)}}
                            </span>
                        </div>
                    </v-flex>

                    <v-flex xs12 md4 lg3 mt-2>
                        <v-btn color="primary" class="ma-0" :block="!$vuetify.breakpoint.sm"
                               :disabled="loading_import" 
                               :loading="loading_import"
                               @click="importButtonClick">
                                    <v-icon left>add</v-icon>
                                    {{$t('import_button')}}
                        </v-btn>

                        <v-dialog v-model="show_login_dialog" max-width="450px" class="text-center">
                            <v-card>
                                <v-card-title>{{$t('not_logged_in_title')}}</v-card-title>
                                <v-card-text>
                                    <p>{{$t('not_logged_in_message')}}</p>

                                    <div class="d-flex justify-space-around flex-wrap">
                                        <LoginButton class="mb-2" />
                                        <v-btn class="mb-2" color="primary" :to="{name: 'account.signup'}">{{$t('global.button.signup')}}</v-btn>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-dialog>
                    </v-flex>
                
                </v-layout>
            </v-card-title>
        </v-card>

        <CardList :cards="cards" 
                  :toolbar="false" 
                  :cardbox="cardbox" 
                  item_type="simple"
                  v-if="cardbox !== null && 'cards' in cardbox" />

    </div>
</template>

<script>
import ApiErrorMessage from "../components/ApiErrorMessage"
import CramfireLoadingIndicator from '../components/CramfireLoadingIndicator'
import CardList from "../components/CardList"
import LoginButton from "../components/LoginButton"

export default {
    components: {
        ApiErrorMessage,
        CramfireLoadingIndicator,
        CardList,
        LoginButton,
    },

    data(){
        return {
            error: false,
            loading: true,
            loading_import: false,
            show_login_dialog: false,
        }
    },

    mounted(){
        if( this.cardbox === null )
        {
            this.loading = true;
        }

        // Auf jeden Fall im Hintergrund updaten
        this.loadSharedCardbox();
    },

    computed: {
        share_token(){
            return this.$route.params.token;
        },

        cardbox(){
            return this.$store.getters['cardbox/sharedCardboxByToken'](this.share_token);
        },

        front_language(){
            return this.$store.getters['language/languageById'](this.cardbox.front_language);
        },

        back_language(){
            return this.$store.getters['language/languageById'](this.cardbox.back_language);
        },

        cards(){
            if( this.cardbox === null )
            {
                return [];
            }

            return this.$store.getters['cardbox/cardsOfCardbox'](this.cardbox.id);
        },

        is_logged_in(){
            return this.$store.getters['account/isLoggedIn'];
        }
    },

    methods: {
        loadSharedCardbox(){
            this.$store.dispatch('cardbox/loadSharedCardbox', this.share_token)
                       .then(() => {
                           this.loading = false;
                           this.error   = false;
                       })
                       .catch((error) => {
                           this.error   = error;
                           this.loading = false;
                       });
        },

        importButtonClick(){
            if( this.is_logged_in )
            {
                this.show_login_dialog = false;
                this.importSharedCardbox();
            }
            else 
            {
                this.show_login_dialog = true;
            }    
        },

        importSharedCardbox(){
            this.loading_import = true;

            this.$store.dispatch('cardbox/importSharedCardbox', this.share_token)
                       .then((cardbox) => {
                           this.loading_import = false;
                           this.error = false;

                           this.$router.push({
                               name: 'cardbox.show', 
                               params: {
                                   cardbox_id: cardbox.id
                               }
                           });
                       })
                       .catch((error) => {
                           this.error = error;
                           this.loading_import = false;
                       });
        },
    }
}
</script>

<i18n>
{
    "de": {
        "import_button": "Karteikasten kopieren",

        "not_logged_in_title": "Benutzerkonto erforderlich",
        "not_logged_in_message": "Du musst eingeloggt sein, um den Karteikasten kopieren zu können.",
        
        "error_messages": {
                "DATA_NOT_FOUND": "Dieser Link ist ungültig oder wurde von dem Besitzer deaktiviert."
        }
    }
}
</i18n>