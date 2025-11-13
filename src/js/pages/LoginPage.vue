<template>
    <v-container fill-height fluid>
    <v-layout justify-center align-center>
        <v-flex xs12 sm9 md6 lg4>
            <v-card class="elevation-4">
                <v-toolbar dark color="primary">
                    <v-toolbar-title>{{$t('login_toolbar_title')}}</v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                    <v-alert
                        :value="true"
                        v-if="error !== false"
                        color="error"
                        icon="warning"
                        outlined mb-6>
                        {{errorMessage}}
                    </v-alert>

                    <v-form ref="login_form" v-model="login_form.valid" @submit.prevent>
                        <v-text-field :label="$t('global.label.email')" 
                                        prepend-inner-icon="mail"
                                        validate-on-blur
                                        :rules="[rules.required, rules.email]"
                                        v-model="login_form.email" />

                        <v-text-field :type="show_password ? 'text' : 'password'" 
                                        :label="$t('global.label.password')" 
                                        prepend-inner-icon="lock"
                                        :rules="[rules.required]" 
                                        :append-icon="show_password ? 'visibility_off' : 'visibility'"
                                        @click:append="show_password = !show_password"
                                        v-model="login_form.password"
                                        @keyup.enter.native="login" />

                    </v-form>

                    <v-layout wrap>
                        <v-flex xs12 sm8>
                            <v-checkbox :label="$t('global.label.remember_login')"
                                        class="mt-0"
                                        v-model="login_form.remember"></v-checkbox>
                        </v-flex>
                        <v-flex xs12 sm4 text-right mb-2>
                            <v-btn color="primary"
                                   :loading="login_loading"
                                   :disabled="login_loading"
                                   @click="login">{{$t('global.button.login')}}</v-btn>
                        </v-flex>
                    </v-layout>

                    <v-divider class="mt-1" />

                    <div class="text-center">
                        <v-btn text color="primary" :to="{name:'account.password_forgotten'}">{{$t('global.button.password_forgotten')}}</v-btn>
                    </div>
                </v-card-text>

            </v-card>

            <v-card class="mt-6 elevation-4">
                <v-toolbar dark color="secondary">
                    <v-toolbar-title>{{$t('signup_toolbar_title')}}</v-toolbar-title>
                </v-toolbar>

                <v-card-text>
                    <p>{{$t('signup_info_text')}}</p>

                    <v-btn :to="{name:'account.signup'}" block color="warning">{{$t('button.signup')}}</v-btn>
                </v-card-text>
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
            show_password: false,
            rules,
            login_form: {
                valid: false,
                email: '',
                password: '',
                remember: false,
            },
            error: false,
            login_loading: false,
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
        login(){
            if( this.$refs.login_form.validate() === false )
            {
                // Formular nicht einmal richtig ausgefüllt...
                return;
            }

            this.login_loading = true;
            this.error = false;

            this.$store.dispatch('account/login', this.login_form).then(() => {
                if( this.$store.state.account.checkauth_route !== null )
                {
                    var route = this.$store.state.account.checkauth_route;
                    this.$router.push(route);
                    this.$store.dispatch('account/clearCheckAuthRoute');
                }
                else 
                {
                    this.$router.push({name: 'dashboard'});
                }
            }).catch((error) => {
                this.login_loading = false;
                this.error = error;
            });
        },
    }
}
</script>

<i18n>
{
    "de": {
        "login_toolbar_title": "Einloggen",
        "signup_toolbar_title": "Noch kein Konto?",

        "signup_info_text": "Erstelle dir in wenigen Augenblicken dein eigenes Benutzerkonto und leg direkt los!",

        "message": {
            "user_inactive": "Bitte bestätige deine E-Mail durch einen Klick auf den Link in der Bestätigungsmail, bevor du dich anmelden kannst.",
            "login_failed": "E-Mail oder/und Passwort nicht korrekt.",
            "validation_failed": "@:message.login_failed",
            "network_error": "Es scheint Probleme mit deiner Anfrage zu geben. Gibt es vielleicht Probleme mit deiner Internetverbindung?",
            "unknown_error": "Sorry! Es ist ein unerwarteter Fehler aufgetaucht. Bitte kontaktiere uns und teile uns mit, was du gerade gemacht hast, als der Fehler aufgetreten ist, damit wir diesen so schnell es geht beheben können. Vielen Dank!"
        },

        "button": {
            "signup": "Jetzt registrieren"
        }
    }
}
</i18n>