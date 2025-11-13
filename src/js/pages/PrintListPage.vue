<template>
<div>
        <ApiErrorMessage :error="error" v-if="error !== false" />

        <CramfireLoadingIndicator v-if="loading" />

        <PageTitle class="not-printable" :text="$t('page_title')" icon="print" />

        <v-card class="not-printable" v-if="cardbox">      
            <v-card-text>
                <v-layout wrap>
                    <v-flex xs12 md6>
                        <v-text-field :label="$t('label.title')" v-model="title" />

                        <v-textarea :label="$t('label.text')" v-model="text" />

                    </v-flex>

                    <v-flex xs12 md3 offset-md1>
                        <h3>{{$t('options_title')}}</h3>

                        <v-switch :label="$t('label.with_info')"
                                  v-model="with_info" />
                        <v-switch :label="$t('label.info_color_light')"
                                  v-model="info_color_light"
                                  :disabled="!with_info" />

                        <v-select :label="$t('label.test_side')"
                                  :items="card_sides"
                                  v-model="first_column" />
                    </v-flex>
                </v-layout>
            </v-card-text>

            <v-card-actions>
                <v-btn color="primary" @click="print">
                    <v-icon left>print</v-icon>
                    {{$t('label.print')}}
                </v-btn>
            </v-card-actions>
        </v-card>

        <h2 class="grey--text mt-6 mb-6 not-printable">{{$t('preview_title')}}</h2>

        <PrintableList :cards="list_cards" 
                       v-if="cards !== null && cards.length > 0 " 
                       :only_on_print="!show_preview"
                       :with_info="with_info"
                       :info_color_light="info_color_light"
                       :title="title"
                       :text="text" />
        
        <v-alert :value="!show_preview" icon="info" color="info" outlined class="not-printable">
            {{$t('no_preview_hint')}}
        </v-alert>
</div>
</template>

<script>
import ApiErrorMessage from "../components/ApiErrorMessage"
import CramfireLoadingIndicator from "../components/CramfireLoadingIndicator"
import PrintableList from "../components/PrintableList"
import {shuffle as shuffleArray} from "../helpers/arrayHelpers"
import PageTitle from "../components/PageTitle"

export default {
    components: {
        ApiErrorMessage,
        CramfireLoadingIndicator,
        PrintableList,
        PageTitle,
    },

    data(){
        return {
            loading: false,
            error: false,

            with_info: true,
            info_color_light: true,
            title: "",
            text: "",
            first_column: 'front',
        }
    },

    mounted(){
        if( this.cardbox !== null )
        {
            this.loading = false;
            this.title = this.$t('default_title', {cardbox_name: this.cardbox.name});
        }

        this.loadCardbox() // Auf jeden fall updaten
    },

    watch: {
        cardbox(new_value, old_value){
            if(old_value === null && new_value !== null && 'name' in new_value)
            {
                this.title = this.$t('default_title', {cardbox_name: new_value.name});
            }
        },

        with_info(new_value){
            if( new_value === false )
            {
                this.info_color_light = false;
            }
        },
    },

    computed: {
        cardbox_id(){
            return this.$route.params.cardbox_id;
        },

        cardbox(){
            return this.$store.getters['cardbox/cardboxById'](this.cardbox_id);
        },

        cards(){
            return this.$store.getters['cardbox/cardsOfCardbox'](this.cardbox_id);
        },

        list_cards(){
            if( this.cards.length === 0 ){ return []; }

            var cards = this.cards.map((cards) => {
                if( this.first_column == 'front' )
                {
                    return {
                        question: cards.front,
                        question_info: cards.front_info,
                        solution: cards.back,
                        solution_info: cards.back_info,
                    }
                }

                return {
                    question: cards.back,
                    question_info: cards.back_info,
                    solution: cards.front,
                    solution_info: cards.front_info,
                }
            });

            shuffleArray(cards);

            return cards;
        },

        show_preview(){
            return !this.$vuetify.breakpoint.xs;
        },

        card_sides(){
            return [
                {value: "front", text: this.front_language_label},
                {value: "back", text: this.back_language_label},
            ];
        },

        front_language_label(){
            if( this.cardbox === null ){ return this.$t('test_side_front_default'); }

            var language = this.$store.getters['language/languageById'](this.cardbox.front_language);

            return this.$t('global.languages.'+language.shortcode);
        },

        back_language_label(){
            if( this.cardbox === null ){ return this.$t('test_side_back_default'); }

            var language = this.$store.getters['language/languageById'](this.cardbox.back_language);

            return this.$t('global.languages.'+language.shortcode);
        }
    },

    methods: {
        loadCardbox(){
            return this.$store.dispatch('cardbox/loadCardbox', this.cardbox_id)
                              .then(() => {
                                  this.error = false;
                                  this.loading = false;
                              })
                              .catch((error) => {
                                  this.error = error;
                                  this.loading = false;
                              });
        },

        print(){
            window.print();
        }
    }

}
</script>

<style>
@media print {
    @page { margin: 20px 10px; }
    @page:first { margin: 10px; margin-bottom: 20px; }

    * { background: transparent !important; }
   
    html, body { background: #FFF !important; }

    header, aside, nav, footer, .not-printable { display: none !important; }
    main { margin: 0 !important; padding: 0 !important; }
    .container { max-width: 100% !important; }
}
</style>

<i18n>
{
    "de": {
        "page_title": "Vokabelliste drucken",
        "preview_title": "Vorschau",
        "options_title": "Optionen",

        "default_title": "Vokabelliste: {cardbox_name}",

        "label": {
            "title": "Titel",
            "text": "Text",
            "test_side": "Erste Spalte",
            "with_info": "Zusatzinformationen anzeigen",
            "info_color_light": "Zusatzinformationen ausgrauen",
            "print": "Drucken"
        },

        "test_side_front_default": "Vorderseite",
        "test_side_back_default": "Rückseite",

        "no_preview_hint": "Die Vorschau ist nur auf größeren Bildschirmen vorhanden."
    }
}
</i18n>