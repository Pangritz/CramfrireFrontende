<template>
    <v-dialog v-model="show_options_dialog" max-width="500">
        <v-card>
            <v-card-title class="headline pb-0">{{$t('title')}}</v-card-title>
            <v-card-text>
                <SpeedlearningSettings />
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="show_options_dialog = false">{{$t('global.button.ok')}}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import SpeedlearningSettings from "../SpeedlearningSettings"

export default {

    components: {
        SpeedlearningSettings,
    },

    props: {
        value: {
            required: true,
            type: Boolean
        }
    },

    computed: {
        show_options_dialog: {
            get(){ return this.value; },

            set(value){ this.$emit('input', value); }
        },
    }
}
</script>

<i18n>
{
    "de": {
        "title": "Einstellungen"
    }
}
</i18n>