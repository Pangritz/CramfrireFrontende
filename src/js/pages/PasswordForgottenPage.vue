<template>
    <v-container fill-height fluid>
    <v-layout justify-center align-center>
        <v-flex xs12 sm8 md6>
            <v-card class="elevation-4">
                <v-toolbar dark color="primary">
                    <v-toolbar-title>{{$t('toolbar_title')}}</v-toolbar-title>
                </v-toolbar>
                <v-card-text class="text-center">
                    <p class="heading">{{$t('info_text')}}</p>

                    <v-alert :value="true"
                             v-if="success"
                             color="info"
                             icon="info"
                             outlined mb-6>
                        {{$t('message.success')}}
                    </v-alert>

                    <v-alert :value="true"
                             v-if="error"
                             color="error"
                             icon="error"
                             outlined mb-6>
                        {{errorMessage}}
                    </v-alert>
                    
                    <v-form ref="password_forgotten_form" v-model="password_forgotten_form.valid" @submit.prevent>
                        <v-text-field :label="$t('global.label.email')" 
                                      prepend-inner-icon="mail"
                                      validate-on-blur
                                      :rules="[rules.required, rules.email]"
                                      v-model="password_forgotten_form.email" />
                    </v-form>                   
                </v-card-text>
                <v-card-actions class="justify-center">
                    <v-btn text :to="{name:'dashboard'}">{{$t('global.button.dashboard')}}</v-btn>

                    <v-btn color="primary"
                           :loading="loading"
                           :disabled="success"
                           @click="submit">{{$t('global.button.forward')}}</v-btn>
                </v-card-actions>
            </v-card>
        </v-flex>
    </v-layout>
    </v-container>
</template>

<script>
import rules from "../validation_rules"

export default {
    data(){
        return {
            error: false,
            success: false,
            loading: false,
            rules,
            password_forgotten_form: {
                valid: false,
                email: '',
            }
        }
    },

    computed: {
        errorMessage(){
            if( this.error === false )
            {
                return '';
            }

            return this.$t('message.'+ this.error.getName().toLowerCase());
        },
    },

    methods: {
        submit(){
            
            if( this.$refs.password_forgotten_form.validate() === false )
            {
                // Formular nicht einmal richtig ausgefüllt...
                return;
            }

            this.loading = true;

            this.$store.dispatch('account/password_forgotten', this.password_forgotten_form)
                       .then(() => {
                            this.success = true; 
                            this.error = false;
                        })
                       .catch((error) => {
                           this.error = error;
                           this.success = false;
                        })
                       .finally(() => this.loading = false)
        }
    }
 
}

</script>

<i18n>
{
    "de": {
        "toolbar_title": "Passwort vergessen",

        "info_text": "Wenn du dein Passwort vergessen hast, kannst du hier die mit deinem Benutzerkonto verknüpfte E-Mail Adresse eingeben und wir schicken dir eine E-Mail mit einem Link, über den du dann dein Passwort ganz einfach neu festlegen kannst.",

        "message": {
            "success": "Du hast es fast geschafft! Die E-Mail mit dem Link zum Festlegen eines neuen Passworts für dein Benutzerkonto ist bereits auf dem Weg zu dir.",

            "user_not_found": "Es konnte kein Benutzerkonto gefunden werden, mit dem die von dir angegebene E-Mail Adresse verknüpft ist.",
            "validation_failed": "@:message.user_not_found",
            "user_inactive": "Bitte bestätige zuerst deine E-Mail-Adresse durch den Klick auf den entsprechenden Link in der Bestätigungsmail, damit du dein Passwort zurücksetzen kannst.",
            "unknown_error": "Es ist ein unerwarteter Fehler aufgetreten. Bitte kontaktiere uns oder versuche es später erneut."
        }
    }
}
</i18n>