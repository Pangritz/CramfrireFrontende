<template>
<div>
    <PageTitle :text="$t('page_title')" icon="settings" />

    <v-card>
        <v-card-title class="headline pb-0">{{$t('spelling_title')}}</v-card-title>
        <v-card-text>
            <v-switch v-model="options_case_insensitive" 
                        :false-value="false"
                        :true-value="true"
                        :label="$t('label.case_insensitive')"
                        hide-details
                        class="mb-3" />
            <p class="mb-5">{{$t('hint.case_insensitive')}}</p>

            <v-switch v-model="options_punctuation_chars_optional" 
                        :false-value="false"
                        :true-value="true"
                        :label="$t('label.punctuation_chars_optional')"
                        hide-details
                        class="mb-3"  />
            <p class="mb-5">{{$t('hint.punctuation_chars_optional')}}</p>
        
            <v-switch v-model="options_easy_special_chars" 
                        :false-value="false"
                        :true-value="true"
                        :label="$t('label.easy_special_chars')"
                        hide-details
                        class="mb-3" />
            <p class="mb-5">{{$t('hint.easy_special_chars')}}</p>
        
            <v-switch v-model="options_brackets_optional" 
                        :false-value="false"
                        :true-value="true"
                        :label="$t('label.brackets_optional')"
                        hide-details
                        class="mb-3"  />
            <p class="mb-5">{{$t('hint.brackets_optional')}}</p>
        
            <v-switch v-model="options_split_parts_on_comma" 
                        :false-value="false"
                        :true-value="true"
                        :label="$t('label.split_parts_on_comma')"
                        hide-details
                        class="mb-3" />
            <p class="mb-5">{{$t('hint.split_parts_on_comma')}}</p>
        
            <v-switch v-model="options_only_parts" 
                        :false-value="false"
                        :true-value="true"
                        :label="$t('label.only_parts')"
                        hide-details
                        class="mb-3" />
            <p class="mb-5">{{$t('hint.only_parts')}}</p>
        </v-card-text>
    </v-card>

    <v-card class="mt-5">
        <v-card-title class="headline">{{$t('speedlearning_title')}}</v-card-title>
        <v-card-text>
            <v-container>
                <v-row>
                    <v-col cols="12" sm="8" md="4" class="pa-0">
                        <SpeedlearningSettings />
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
    </v-card>
</div>
</template>

<script>
import PageTitle from "../components/PageTitle"
import SpeedlearningSettings from "../components/SpeedlearningSettings"

export default {

    components: {
        PageTitle,
        SpeedlearningSettings,
    },

    computed: {
        options_case_insensitive: {
            get(){ return this.$store.state.options.spelling.case_insensitive; },
            set(value){ this.$store.dispatch('options/setOption', {namespace: 'spelling', key: 'case_insensitive', value}); }
        },

        options_punctuation_chars_optional: {
            get(){ return this.$store.state.options.spelling.punctuation_chars_optional; },
            set(value){ this.$store.dispatch('options/setOption', {namespace: 'spelling', key: 'punctuation_chars_optional', value}); }
        },

        options_easy_special_chars: {
            get(){ return this.$store.state.options.spelling.easy_special_chars; },
            set(value){ this.$store.dispatch('options/setOption', {namespace: 'spelling', key: 'easy_special_chars', value}); }
        },

        options_brackets_optional: {
            get(){ return this.$store.state.options.spelling.brackets_optional; },
            set(value){ this.$store.dispatch('options/setOption', {namespace: 'spelling', key: 'brackets_optional', value}); }
        },

        options_split_parts_on_comma: {
            get(){ return this.$store.state.options.spelling.split_parts_on_comma; },
            set(value){ this.$store.dispatch('options/setOption', {namespace: 'spelling', key: 'split_parts_on_comma', value}); }
        },

        options_only_parts: {
            get(){ return this.$store.state.options.spelling.only_parts; },
            set(value){ this.$store.dispatch('options/setOption', {namespace: 'spelling', key: 'only_parts', value}); }
        }
    }
}
</script>

<i18n>
{
    "de": {
        "page_title": "Einstellungen",
        "spelling_title": "Schreibweise lernen",
        "speedlearning_title": "Schnelllernen",

        "label": {
            "case_insensitive": "Groß- und Kleinschreibung ignorieren", 
            "punctuation_chars_optional": "Satzzeichen sind optional", 
            "easy_special_chars": "Vereinfachte Schreibweise von Sonderzeichen", 
            "brackets_optional": "Klammern und deren Inhalt sind optional", 
            "split_parts_on_comma": "Mehrere Begriffe werden durch Kommata (,) getrennt", 
            "only_parts": "Es müssen nicht immer alle Begriffe genannt werden"
        },

        "hint": {
            "case_insensitive": "z.B. \"baum\" statt \"Baum\"", 
            "punctuation_chars_optional": "z.B. \"Wie gehts\" statt \"Wie gehts?\"", 
            "easy_special_chars": "z.B. \"Hauser\" statt \"Häuser\" und \"espanol\" statt \"español\"" , 
            "brackets_optional": "z.B. \"Auto\" statt \"(das) Auto\"", 
            "split_parts_on_comma": "z.B. \"sehr klein, winzig\"", 
            "only_parts": "z.B. \"sehr klein\" statt \"sehr klein, winzig\""
        }
    }
}
</i18n>