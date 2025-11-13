<template>

    <v-container fill-height>   

        <v-layout column>
            <v-flex class="text-center">
                <v-icon large color="error">error_outline</v-icon>
            </v-flex>
            <v-flex class="text-center">
                <h1 class="grey--text">{{$t('heading')}}</h1>
                    
                <div class="text-center mt-6">
                    <v-btn :to="{name: 'dashboard'}">{{$t('global.button.dashboard')}}</v-btn>
                </div>
            </v-flex>
        </v-layout>

    </v-container>

</template>

<i18n>
{
    "de": {
        "heading": "Fehler 404 - Seite nicht gefunden"
    }
}
</i18n>