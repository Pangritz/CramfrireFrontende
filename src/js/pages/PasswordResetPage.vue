<template>
    <v-container fill-height fluid>
    <v-layout justify-center align-center>
        <v-flex xs12 sm8 md7 lg4>
            <v-card class="elevation-4">
                <v-toolbar dark color="primary">
                    <v-toolbar-title>{{$t('toolbar_title')}}</v-toolbar-title>
                </v-toolbar>
                <v-card-text class="text-center" v-if="!success">
                    <p class="heading">{{$t('info_text')}}</p>

                    <v-alert :value="true"
                             v-if="error"
                             color="error"
                             icon="error"
                             outlined>
                        {{errorMessage}}
                    </v-alert>
                    
                    <v-form ref="password_reset_form" v-model="password_reset_form.valid" @submit.prevent>
                        <v-text-field :type="show_password ? 'text' : 'password'" 
                                      :label="$t('global.label.password')" 
                                      prepend-inner-icon="lock"
                                      :rules="[rules.required, rules.password]" 
                                      :append-icon="show_password ? 'visibility_off' : 'visibility'"
                                      @click:append="show_password = !show_password"
                                      v-model="password_reset_form.password" />
                        
                        <v-text-field :type="show_password ? 'text' : 'password'" 
                                      :label="$t('global.label.password_confirmation')" 
                                      prepend-inner-icon="lock"
                                      :rules="[rules.required, rules.password]" 
                                      :append-icon="show_password ? 'visibility_off' : 'visibility'"
                                      @click:append="show_password = !show_password"
                                      v-model="password_reset_form.password_confirmation" />
                    </v-form>                   
                </v-card-text>

                <v-card-actions v-if="!success">
                    <v-spacer />
                    <v-btn color="primary"
                           :loading="loading"
                           :disabled="success"
                           @click="submit">{{$t('global.button.forward')}}</v-btn>
                </v-card-actions>

                <v-card-text class="text-center" v-if="success">
                    <v-layout column v-if="success">
                        <v-flex>
                            <v-icon large color="success">check_circle</v-icon>
                        </v-flex>
                        <v-flex subheading>{{$t('message.success')}}</v-flex>
                        <v-flex justify-center pt-6>
                            <v-btn color="primary" :to="{name: 'account.login'}">{{$t('button.login')}}</v-btn>
                            <v-btn text :to="{name: 'dashboard'}">{{$t('global.button.dashboard')}}</v-btn>
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

export default {
    data(){
        return {
            show_password: false,
            error: false,
            success: false,
            loading: false,
            rules,
            password_reset_form: {
                valid: false,
                password: '',
                password_confirmation: '',
            }
        }
    },

    computed: {
        errorMessage(){
            if( this.error === false )
            {
                return '';
            }

            if( typeof this.error == 'string' )
            {
                return this.$t('message.'+this.error.toLowerCase());
            }

            return this.$t('message.'+ this.error.getName().toLowerCase());
        },
    },

    methods: {
        submit(){
            this.error = false;

            if( this.$refs.password_reset_form.validate() === false )
            {
                // Formular nicht einmal richtig ausgefüllt...
                return;
            }

            if( this.password_reset_form.password !== this.password_reset_form.password_confirmation )
            {
                this.error = 'password_confirmation_wrong';
                return;
            }

            this.loading = true;

            var data = {
                public_id: this.$route.params.public_id,
                token: this.$route.params.token,
                password: this.password_reset_form.password,
            }

            this.$store.dispatch('account/password_reset', data)
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
        "toolbar_title": "Passwort zurücksetzen",

        "info_text": "Hier kannst du dein neues Passwort festlegen, mit dem du dich anschließend direkt in dein Benutzerkonto einloggen kannst.",

        "message": {
            "success": "Dein Passwort wurde erfolgreich geändert! Du kannst dich jetzt mit deinem neuen Passwort einloggen.",
            "validation_failed": "Bitte überprüfe deine Eingabe. Etwas scheint mit deiner Eingabe nicht zu stimmen.",
            "password_confirmation_wrong": "Das Passwort wurde nicht korrekt wiederholt. Bitte überprüfe deine Eingabe.",
            "link_invalid": "Der Link scheint nicht (mehr) gültig zu sein. Bitte stelle sicher, dass der Link mit dem Link aus der Email übereinstimmt.",
            "link_expired": "Der von dir verwendete Link ist bereits abgelaufen. Ein Link zum zurücksetzen des Passworts eines Benutzerkontos ist aus Sicherheitsgründen nur eine begrenzte Zeit lang gültig. Du kannst jederzeit einen neuen Link anfordern.",
            "unknown_error": "Es ist ein unerwarteter Fehler aufgetreten. Bitte kontaktiere uns oder versuche es später erneut."
        },

        "button": {
            "login": "Jetzt einloggen"
        }
    }
}
</i18n>