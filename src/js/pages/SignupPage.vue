<template>
    <v-container fill-height fluid>
    <v-layout justify-center align-center>
        <v-flex xs12 md11 lg9>
            <v-card class="elevation-4">
                <v-toolbar dark color="primary">
                    <v-toolbar-title>{{$t('toolbar_title')}}</v-toolbar-title>
                </v-toolbar>
                <v-card-text>

                    <v-layout wrap class="pa-2" :column="$vuetify.breakpoint.smAndDown" :row="$vuetify.breakpoint.mdAndUp">

                        <v-flex md6 order-md3 class="py-2" :class="{'pl-4': $vuetify.breakpoint.smAndUp}">
                            <ul>
                                <li>{{$t('advantage_A')}}</li>
                                <li>{{$t('advantage_B')}}</li>
                                <li>{{$t('advantage_C')}}</li>
                                <li>{{$t('advantage_D')}}</li>
                                <li>{{$t('advantage_E')}}</li>
                            </ul>
                        </v-flex>

                        <v-flex xs12 order-md1 v-if="signup_form.ref_code !== null && !success">
                            <v-alert :value="true" outlined color="info" icon="info">
                                <h3 class="title">{{$t('ref_code_title')}}</h3>
                                <p>{{$t('ref_code_hint')}}</p>
                            </v-alert>
                        </v-flex>

                        <v-flex md6 order-md2 class="py-2">
                            <v-alert :value="true"
                                     v-if="success"
                                     color="success"
                                     icon="info"
                                     outlined mb-6>
                                {{$t('message.success')}}
                            </v-alert>

                            <v-alert :value="true"
                                     v-if="error !== false"
                                     color="warning"
                                     icon="info"
                                     outlined mb-6>
                                {{$t('message.validation_failed')}} 
                                <router-link :to="{name:'account.password_forgotten'}">{{$t('global.button.password_forgotten')}}</router-link>
                            </v-alert>

                            <v-form ref="signup_form" v-model="signup_form.valid" @submit.prevent v-if="!success">
                                <v-text-field :label="$t('global.label.email')" 
                                              prepend-inner-icon="mail"
                                              validate-on-blur
                                              :rules="[rules.required, rules.email]"
                                              v-model="signup_form.email" />

                                <v-text-field :type="show_password ? 'text' : 'password'" 
                                              :label="$t('global.label.password')" 
                                              prepend-inner-icon="lock"
                                              :hint="$t('global.hint.password')"
                                              :rules="[rules.required, rules.password]" 
                                              :append-icon="show_password ? 'visibility_off' : 'visibility'"
                                              @click:append="show_password = !show_password" 
                                              @keyup="handlePasswordChange" 
                                              v-model="signup_form.password" />

                                <v-text-field :type="show_password ? 'text' : 'password'" 
                                              :label="$t('global.label.password_confirmation')" 
                                              prepend-inner-icon="lock"
                                              :rules="[rules.required, rules.password]" 
                                              :append-icon="show_password ? 'visibility_off' : 'visibility'"
                                              @click:append="show_password = !show_password" 
                                              v-model="signup_form.password_confirmation"
                                              :error-messages="password_confirmation_error ? $t('message.password_confirmation_error') : ''"
                                              @blur="validatePasswordConfirmation" 
                                              @keyup="handlePasswordChange" />

                                <v-checkbox v-model="signup_form.accept_privacy" 
                                            :error-messages="accept_privacy_error ? $t('accept_privacy_error') : []"
                                            :false-value="false"
                                            :true-value="true">
                                    <template v-slot:label>
                                        <i18n path="accept_privacy">
                                            <a href="https://www.cramfire.com/datenschutz" target="_blank" @click.stop>{{ $t('privacy') }}</a>
                                        </i18n>
                                    </template>
                                </v-checkbox>

                                <div class="text-right mt-3">
                                    <v-btn text :to="{name:'dashboard'}">{{$t('global.button.back')}}</v-btn>
                                                                    
                                    <v-btn color="primary" 
                                           :loading="signup_loading"
                                           :disabled="signup_loading || success"
                                           @click="signup">{{$t('submit')}}</v-btn>
                                </div>
                            </v-form>

                            <div class="mt-4 text-center" v-if="success">
                                <v-btn :to="{name: 'account.login'}">
                                    {{$t('login_button')}}
                                </v-btn>
                            </div>
                        </v-flex>
                    </v-layout>
                    
                </v-card-text>
            </v-card>
        </v-flex>
    </v-layout>
    </v-container>
</template>

<script>
import rules from "../validation_rules"
import {getStorageData} from "../helpers/storageHelpers"


export default {
    data(){
        return {
            show_password: false,
            rules,
            signup_form: {
                valid: false, 
                email: '',
                password: '',
                password_confirmation: '',
                accept_privacy: false,
                ref_code: null,
            },
            password_confirmation_error: false,
            accept_privacy_error: false,
            error: false,
            success: false,
            signup_loading: false,
        }
    },

    created(){
        var ref_code = getStorageData('ref', 'session');

        if( ref_code !== null && ref_code.trim() !== '')
        {
            this.signup_form.ref_code = ref_code;
        }
    },

    methods: {
        signup(){
            this.accept_privacy_error = false;
            this.validatePasswordConfirmation();

            if( this.$refs.signup_form.validate() === false 
                || this.password_confirmation_error )
            {
                // Formular nicht einmal richtig ausgefüllt...
                return;
            }

            if( this.signup_form.accept_privacy === false )
            {
                this.accept_privacy_error = true;
                return;
            }

            this.signup_loading = true;

            this.$store.dispatch('account/signup', this.signup_form).then(() => {
                this.success = true;
                this.error = false;
                
                // Event tracken
                this.$matomo.trackEvent('User', 'signup');
            }).catch((error) => {
                this.error = error;
                this.success = false;
            }).finally(() => this.signup_loading = false);
        },

        validatePasswordConfirmation(){
            var password_confirmed = (this.signup_form.password === this.signup_form.password_confirmation);
            this.password_confirmation_error = !password_confirmed;            
        },

        handlePasswordChange(){
            if( this.password_confirmation_error 
                && this.signup_form.password === this.signup_form.password_confirmation )
            {
                this.password_confirmation_error = false;
            }
        }
    }
}
</script>

<i18n>
{
    "de": {
        "toolbar_title": "Registrierung",

        "ref_code_title": "Freunde-Bonus ist aktiv!",
        "ref_code_hint": "Du hast offenbar den \"Werbe einen Freund\" Link eines Cramfire Nutzers verwendet. Dafür erhältst du zusätzliche 14 Tage kostenlos zum Testen, wenn du dich jetzt registrierst.",

        "message": {
            "success": "Registrierung fast abgeschlossen! Wir haben dir eine Bestätigungsmail geschickt. Durch das Klicken auf den Link bestätigst du deine E-Mail Adresse und schließt die Registration ab.",

            "password_confirmation_error": "Das Passwort stimmt nicht überein.",
            "validation_failed": "Die von dir gewählte E-Mail wird bereits genutzt."
        },

        "submit": "Jetzt registrieren",
        "login_button": "Zum Login",

        "advantage_A": "völlig unverbindlich testen",
        "advantage_B": "14 Tage kostenloser Premium-Account",
        "advantage_C": "danach automatisch kostenlose Free-Version",
        "advantage_D": "Kein Abo! Reines PrePaid-Prinzip",
        "advantage_E": "Bei Nichtgefallen keine Kündigung erforderlich",

        "accept_privacy": "Ich habe die {0} gelesen und stimme dieser zu.",
        "privacy": "Datenschutzerklärung",
        "accept_privacy_error": "Du musst der Datenschutzerklärung zustimmen, um fortfahren zu können."
    }
}
</i18n>