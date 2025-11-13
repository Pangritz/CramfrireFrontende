<template>
<div>
    <v-layout>
        <v-flex xs12 md8 offset-md2>
            <PageTitle :text="$t('title')" />

            <v-card class="mb-6">
                <v-card-title class="title">
                    <v-icon left>shopping_cart</v-icon> {{$t('title_premium')}}
                </v-card-title>
                <v-card-text class="subtitle-1">
                    {{$t( is_premium ? 'premium_expires_at_message' : 'premium_expired_message')}} 
                    <span class="font-weight-bold" :class="{
                        'error--text': !is_premium,
                        'success--text': is_premium
                    }">{{premium_expires_at}}</span>
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn color="primary" :to="{name: 'premium.buy'}">
                        <v-icon left>shopping_cart</v-icon>
                        {{$t('label.buy_premium')}}
                    </v-btn>
                </v-card-actions>
            </v-card>

            <v-form ref="email_change_form" @submit="handleEmailChangeSubmit">
                <v-card class="mb-6">
                    <v-card-title class="title">
                        <v-icon left>email</v-icon> {{$t('title_email_change')}}
                    </v-card-title>
                    <v-card-text>
                        <ApiErrorMessage v-if="email_change_error" 
                                         :error="email_change_error"
                                         :error_messages="{
                                            'PASSWORD_WRONG': $t('password_wrong_error'),
                                            'VALIDATION_FAILED': $t('email_change_validation_error')
                                         }"
                                         class="mb-6" />
                        
                        <v-alert color="success" outlined :value="email_change_success">
                            {{$t('email_change_success')}}
                        </v-alert>

                        <v-text-field :label="$t('label.password')"
                                    type="password"
                                    :rules="[rules.required]"
                                    validate-on-blur 
                                    v-model="email_change_form.password" />

                        <v-text-field :label="$t('label.new_email')"
                                    type="email"
                                    :rules="[rules.required, rules.email]"
                                    validate-on-blur 
                                    v-model="email_change_form.new_email" />

                        <div class="text-right">
                            <v-btn color="primary"
                                   :loading="email_change_loading"
                                   :disabled="email_change_loading"
                                   type="submit">
                                {{$t('label.change_submit')}}
                            </v-btn>
                        </div>
                    </v-card-text>
                </v-card>
            </v-form>

            <v-form ref="password_change_form" @submit="handlePasswordChangeSubmit">
                <v-card class="mb-6">
                    <v-card-title class="title">
                        <v-icon left>lock</v-icon> {{$t('title_password_change')}}
                    </v-card-title>
                    <v-card-text>
                        <ApiErrorMessage v-if="password_change_error" 
                                         :error="password_change_error"
                                         :error_messages="{'PASSWORD_WRONG': $t('password_wrong_error')}"
                                         class="mb-6" />
                        
                        <v-alert color="success" outlined :value="password_change_success">
                            {{$t('password_change_success')}}
                        </v-alert>

                        <v-text-field :label="$t('global.label.password')"
                                    type="password"
                                    :rules="[rules.required]"
                                    validate-on-blur 
                                    v-model="password_change_form.password" />

                        <v-text-field :label="$t('label.new_password')"
                                    :hint="$t('global.hint.password')"
                                    type="password"
                                    :rules="[rules.required, rules.minLength(8)]"
                                    validate-on-blur 
                                    v-model="password_change_form.new_password" />

                        <v-text-field :label="$t('label.new_password_confirmation')"
                                    type="password" 
                                    :error-messages="password_confirmation_error"
                                    :rules="[rules.required, rules.minLength(8)]"
                                    validate-on-blur 
                                    v-model="password_change_form.new_password_confirmation" />

                        <div class="text-right">
                            <v-btn color="primary"
                                   :loading="password_change_loading"
                                   :disabled="password_change_loading"
                                   type="submit">
                                {{$t('label.change_submit')}}
                            </v-btn>
                        </div>
                    </v-card-text>
                </v-card>
            </v-form>

            <v-form ref="account_delete_form" @submit="handleAccountDeleteSubmit">
                <v-card class="mb-6">
                    <v-card-title class="title">
                        <v-icon left>delete</v-icon> {{$t('title_account_delete')}}
                    </v-card-title>
                    <v-card-text>
                        <ApiErrorMessage v-if="account_delete_error" 
                                         :error="account_delete_error"
                                         :error_messages="{'PASSWORD_WRONG': $t('password_wrong_error')}"
                                         class="mb-6" />

                        <v-text-field :label="$t('label.password')"
                                    type="password"
                                    :rules="[rules.required]"
                                    validate-on-blur 
                                    v-model="account_delete_form.password" />

                        <v-checkbox v-model="account_delete_form.confirmation" 
                                    :label="$t('label.account_delete_conformation')" 
                                    :rules="[rules.required]"
                                    true-value="yes" 
                                    false-value="no" />

                        <div class="text-right">
                            <v-btn color="error"
                                   :loading="account_delete_loading"
                                   :disabled="account_delete_loading"
                                   type="submit">
                                   <v-icon left>delete</v-icon>
                                {{$t('label.delete_submit')}}
                            </v-btn>
                        </div>
                    </v-card-text>
                </v-card>
            </v-form>
        </v-flex>
    </v-layout>
</div>

</template>

<script>
import ApiErrorMessage from "../components/ApiErrorMessage"
import rules from "../validation_rules"
import PageTitle from "../components/PageTitle"

export default {
    components: {
        ApiErrorMessage,
        PageTitle,
    },

    data(){
        return {
            rules,

            email_change_loading: false, // Ajax Request Status zum ändern des Passwortes
            email_change_success: false,
            email_change_error: false,
            email_change_form: {
                password: '',
                new_email: '',
            },

            password_change_loading: false, // Ajax Request Status zum ändern des Passwortes
            password_change_success: false,
            password_change_error: false,
            
            password_confirmation_error: '',
            password_change_form: {
                password: '',
                new_password: '',
                new_Password_confirmation: '',
            },

            account_delete_loading: false,
            account_delete_error: false, 
            account_delete_form: {
                password: '',
                confirmation: false,
            }
        }
    },

    computed: {
        is_premium(){
            return this.$store.getters['account/isPremium'];
        },

        premium_expires_at(){
            var user = this.$store.getters['account/loggedInUser'];
            var date = new Date(user.expires_at * 1000);

            var day = date.getDate(),
                month = date.getMonth() +1,
                year = date.getFullYear();

            if( day < 10 ){ day = '0' + day; }
            if( month < 10 ){ month = '0' + month; }
            
            return day + '.' + month + '.' + year;
        },

        email(){
            return this.$store.getters['account/me'].email;
        },
    },

    methods: {

        handleEmailChangeSubmit(event){
            event.preventDefault();

            if( this.$refs.email_change_form.validate() === false )
            {
                // Formular nicht einmal richtig ausgefüllt...
                return;
            }

            this.email_change_loading = true;

            this.$store.dispatch('account/email_change', {
                password: this.email_change_form.password,
                new_email: this.email_change_form.new_email,
            })
            .then(() => {
                this.email_change_loading = false;
                this.email_change_error = false;
                this.email_change_success = true;

                this.$refs.email_change_form.reset();
            })
            .catch((error) => {
                this.email_change_loading = false;
                this.email_change_success = false;
                this.email_change_error = error;
            });
        },

        handlePasswordChangeSubmit(event){
            event.preventDefault();

            if( this.$refs.password_change_form.validate() === false )
            {
                // Formular nicht einmal richtig ausgefüllt...
                return;
            }

            if( this.password_change_form.new_password !== this.password_change_form.new_password_confirmation )
            {
                this.password_confirmation_error = this.$t('password_confirmation_error');
                return;
            }
            else
            {
                this.password_confirmation_error = '';
            }

            this.password_change_loading = true;

            this.$store.dispatch('account/password_change', {
                password: this.password_change_form.password,
                new_password: this.password_change_form.new_password,
            })
            .then(() => {
                this.password_change_loading = false;
                this.password_change_error = false;
                this.password_change_success = true;

                this.$refs.password_change_form.reset();
            })
            .catch((error) => {
                this.password_change_loading = false;
                this.password_change_success = false;
                this.password_change_error = error;
            });
        },

        resetPasswordChangeForm(){
            this.password_change_form.password = '';
            this.password_change_form.new_password = '';
            this.password_change_form.new_password_confirmation = '';
        },

        handleAccountDeleteSubmit(event){
            event.preventDefault();

            if( this.$refs.account_delete_form.validate() === false )
            {
                // Formular nicht einmal richtig ausgefüllt...
                return;
            }

            var data = {
                password: this.account_delete_form.password, 
                confirmation: this.account_delete_form.confirmation
            };

            this.account_delete_loading = true;

            this.$store.dispatch('account/delete_account', data)
                       .then(() => {
                           this.account_delete_error   = false;
                           this.account_delete_loading = false;
                       })
                       .catch((error) => {
                           this.account_delete_error   = error;
                           this.account_delete_loading = false;
                       });
        },
    }
}
</script>

<i18n>
{
    "de": {
        "title": "Mein Konto",
        "title_premium": "Premiumzeit",
        "title_email_change": "E-Mail-Adresse ändern",
        "title_password_change": "Passwort ändern",
        "title_account_delete": "Benutzerkonto löschen",

        "label": {
            "buy_premium": "Premiumzeit kaufen",
            "new_email": "Neue E-Mail-Adresse",
            "password": "Aktuelles Passwort",
            "new_password": "Neues Passwort",
            "new_password_confirmation": "Neues Passwort wiederholen",
            "change_submit": "Ändern",

            "account_delete_conformation": "Ich bin mir bewusst, dass mein Benutzerkonto vollständig und unwiderruflich gelöscht wird.",
            "delete_submit": "Löschen"
        },

        "premium_expires_at_message": "Deine Premiumzeit läuft ab am: ",
        "premium_expired_message": "Deine Premiumzeit ist abgelaufen am: ",

        "email_change_success": "Es wurde eine Bestätigungs-Email an deine neue E-Mail-Adresse geschickt. Deine E-Mail-Adresse wird erst dann geändert, wenn du auf den Link in dieser Email geklickt hast, um deine neue E-Mail-Adresse zu bestätigen.",
        "email_change_validation_error": "Die von dir angegebene E-Mail-Adresse ist keine gültige E-Mail-Adresse oder ist bereits mit einem anderen Benutzerkonto verknüpft.",

        "password_confirmation_error": "Das neue Passwort wurde nicht korrekt wiederholt.",
        "password_wrong_error": "Das aktuelle Passwort ist falsch.",

        "password_change_success": "Dein Passwort wurde erfolgreich geändert!"
    }    
}
</i18n>