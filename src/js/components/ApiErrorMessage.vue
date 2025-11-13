<template>
    <v-alert
      :value="true"
      color="error"
      icon="warning"
      outlined
    >
      {{error_message}}
    </v-alert>
</template>

<script>
import Vue from "vue"

export default {
    props: {
        error: {
            required: true,
            type: Object
        },

        error_messages: {
            default: () => { return {} },
            type: Object
        }
    },

    computed: {
        error_message(){
            if( typeof this.error.getName === 'undefined' )
            {
                if( Vue.config.devtools )
                { 
                    console.error(this.error); 
                }
                
                return this.$t('UNKNOWN_ERROR');
            }

            if( typeof this.error_messages[this.error.getName()] !== 'undefined' )
            {
                return this.error_messages[this.error.getName()];
            }

            return this.$t(this.error.getName())
        }
    }


}
</script>

<i18n>
{
    "de": {
        "NETWORK_ERROR": "Du scheinst im Moment keine oder nur eine sehr langsame Internetverbindung zu haben.",
        "VALIDATION_FAILED": "Bitte überprüfe deine Eingaben noch einmal auf Korrektheit. Sollte deine Eingabe korrekt sein und der Fehler weiterhin bestehen, so melde uns dies bitte.",
        "DATA_NOT_FOUND": "Die angeforderten Daten können nicht (mehr) gefunden werden.",
        "UNAUTHORIZED": "Du bist nicht eingeloggt. Bitte melde dich zunächst an, um fortfahren zu können.",
        "UNAUTHORIZED_ACCESS": "Zugriff verweigert! Du hast nicht die erforderlichen Berechtigungen.",
        "PREMIUM_EXPIRED": "Die Premiumzeit von deinem Benutzerkonto ist abgelaufen. Für diese Funktion ist jedoch ein Premium Benutzerkonto erforderlich. Bitte erwerbe neue Premiumzeit, um diese Funktion nutzen zu können.",
        "CSRF_PROTECTION": "Es ist ein Fehler aufgetreten, der wohlmöglich durch das Neuladen der Seite behoben werden kann.",
        "UNKNOWN_ERROR": "Sorry! Es ist ein unerwarteter Fehler aufgetaucht. Bitte kontaktiere uns und teile uns mit, was du gerade gemacht hast, als der Fehler aufgetreten ist, damit wir diesen so schnell es geht beheben können. Vielen Dank!",
        "ROUTE_NOT_FOUND": "@:UNKNOWN_ERROR"
    }
}
</i18n>