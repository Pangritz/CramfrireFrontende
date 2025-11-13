<template>
    <v-container fill-height fluid>
    <v-layout justify-center align-center>
        <v-flex xs12 sm8 md6>
            <v-card class="elevation-4">
                <v-toolbar dark color="primary">
                    <v-toolbar-title>{{$t('toolbar_title')}}</v-toolbar-title>
                </v-toolbar>
                <v-card-text class="text-center">

                    <v-layout justify-center v-if="loading">
                        <v-flex>
                            <v-progress-circular
                                indeterminate
                                color="primary"
                            ></v-progress-circular>
                        </v-flex>
                    </v-layout>

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
                    
                    <v-layout column v-if="error">
                        <v-flex>
                            <v-icon large color="error">error</v-icon>
                        </v-flex>
                        <v-flex subheading>{{errorMessage}}</v-flex>
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

export default {
    data(){
        return {
            error: false,
            success: false,
            loading: false,
        }
    },

    created(){
        this.loading = true;

        this.$store.dispatch('account/email_confirmation', {
            public_id: this.$route.params.public_id,
            token: this.$route.params.token,
        })
        .then(() => this.success = true)
        .catch((error) => this.error = error)
        .finally(() => this.loading = false);
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
}

</script>

<i18n>
{
    "de": {
        "toolbar_title": "E-Mail-Adresse bestätigen",

        "message": {
            "success": "Deine E-Mail-Adresse wurde erfolgreich bestätigt. Du kannst dich jetzt mit dieser E-Mail Adresse einloggen.",
            "link_already_used": "Der Link wurde bereits benutzt, um die E-Mail-Adresse zu bestätigen.",
            "link_invalid": "Der Link ist ungültig. Bitte überprüfe, ob der Link in der Adressleiste deines Browsers mit dem Link aus der Bestätigungsmail übereinstimmt. Sollte das Problem trotzdem weiterhin bestehen, zögere nicht uns zu kontaktieren. Wir helfen dir gerne weiter!",
            "validation_failed": "Der Link ist ungültig. Bitte kontrolliere, ob der Link vollständig mit dem Link aus der E-Mail übereinstimmt."
        },

        "button": {
            "login": "Jetzt einloggen"
        }
    }
}
</i18n>