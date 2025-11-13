<template>
<v-container fluid>
    <v-row>
        <v-col cols="12" class="px-0">
            <v-select :label="$t('label.first_side')"
                      :hint="$t('hint.first_side')"
                      persistent-hint
                      :items="first_side_options"
                      v-model="options_first_side" />
        </v-col>
        <v-col cols="12" class="px-0">                    
                <NumberInput v-model="options_front_display_duration"
                            :min="1" 
                            :max="30"
                            :step="1"
                            :label="$t('label.front_display_duration')"
                            :hint="$t('hint.front_display_duration')" />
        </v-col>
        <v-col cols="12" class="px-0">
                <NumberInput v-model="options_back_display_duration"
                            :min="1" 
                            :max="30"
                            :step="1"
                            :label="$t('label.back_display_duration')"
                            :hint="$t('hint.back_display_duration')" />
        </v-col>
    </v-row>
</v-container>
</template>

<script>
import NumberInput from "./NumberInput"

export default {

    components: {
        NumberInput,
    },

    data(){
        return {
            first_side_options: [
                {
                    text: this.$t('option.front'),
                    value: 'front',    
                },
                {
                    text: this.$t('option.back'),
                    value: 'back',    
                },
            ],
        }
    },
    
    computed: {
        options_first_side: {
            get(){ return this.$store.state.options.speedlearning.first_side; },
            set(value){ 
                this.$store.dispatch('options/setOption', {
                    namespace: 'speedlearning', 
                    key: 'first_side', 
                    value
                }); 
            }
        },

        options_front_display_duration: {
            get(){ return this.$store.state.options.speedlearning.front_display_duration; },
            set(value){ 
                this.$store.dispatch('options/setOption', {
                    namespace: 'speedlearning', 
                    key: 'front_display_duration', 
                    value
                });
            }
        },

        options_back_display_duration: {
            get(){ return this.$store.state.options.speedlearning.back_display_duration; },
            set(value){
                this.$store.dispatch('options/setOption', {
                    namespace: 'speedlearning', 
                    key: 'back_display_duration', 
                    value
                });
            }
        },
    },
}
</script>

<i18n>
{
    "de": {
        
        "label": {
            "first_side": "Erste Seite der Karte",
            "front_display_duration": "Vorderseiten Anzeigedauer",
            "back_display_duration": "Rückseiten Anzeigedauer"
        },

        "hint": {
            "first_side": "Welche Seite der Karte soll zuerst angezeigt werden?",
            "front_display_duration": "in Sekunden",
            "back_display_duration": "in Sekunden"
        },

        "option": {
            "front": "Vorderseite",
            "back": "Rückseite"
        }
    }
}
</i18n>