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

                        <v-select :label="$t('label.test_side')"
                                  :items="test_sides"
                                  v-model="test_side" />
                    </v-flex>

                    <v-flex xs12 md3 offset-md1>
                        <h3>{{$t('options_title')}}</h3>

                        <v-switch :label="$t('label.with_solution')"
                                  v-model="with_solution" />
                        <v-switch :label="$t('label.with_info')"
                                  v-model="with_info" />
                        <v-switch :label="$t('label.info_color_light')"
                                  v-model="info_color_light"
                                  :disabled="!with_info" />

                        <v-text-field :label="$t('label.cards_count')" 
                                      type="number"
                                      v-model="cards_count" />
                    </v-flex>
                </v-layout>
            </v-card-text>

            <v-card-actions>
                <v-btn color="primary" @click="print">
                    <v-icon left>print</v-icon>
                    {{$t('label.print')}}
                </v-btn>

                <v-btn @click="shuffleCards">
                    <v-icon :left="!$vuetify.breakpoint.xs">loop</v-icon>
                    <span v-show="!$vuetify.breakpoint.xs">{{$t('label.shuffle')}}</span>
                </v-btn>
            </v-card-actions>
        </v-card>

        <h2 class="grey--text mt-6 mb-6 not-printable">{{$t('preview_title')}}</h2>

        <PrintableTest :cards="test_cards" 
                       v-if="cards !== null && cards.length > 0 " 
                       :only_on_print="!show_preview"
                       :with_info="with_info"
                       :info_color_light="info_color_light"
                       :with_solution="with_solution"
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
import PrintableTest from "../components/PrintableTest"
import {shuffle as shuffleArray} from "../helpers/arrayHelpers"
import PageTitle from "../components/PageTitle"

export default {
    components: {
        ApiErrorMessage,
        CramfireLoadingIndicator,
        PrintableTest,
        PageTitle,
    },

    data(){
        return {
            loading: false,
            error: false,

            with_info: true,
            info_color_light: true,
            with_solution: true,
            title: "",
            text: "",
            test_side: 'back',
            cards_count: 10,
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

        cards_count(new_value){
            if( new_value == '' )
            {
                return; // der Nutzer möchte sehr wahrscheinlich eine neue Zahl eingeben
            }

            new_value = Math.floor(new_value);

            if( new_value <= 0 )
            {
                this.cards_count = 1;
            }
            else if( new_value > this.cards.length )
            {
                this.cards_count = this.cards.length;
            }
            
            if( new_value > 100 )
            {
                this.cards_count = 100;
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

        test_cards(){
            if( this.cards.length === 0 ){ return []; }

            var cards = this.cards.map((card) => {
                if( this.test_side == 'back' )
                {
                    return {
                        id: card.id,
                        question: card.front,
                        question_info: card.front_info,
                        solution: card.back,
                        solution_info: card.back_info,
                    }
                }

                return {
                    id: card.id,
                    question: card.back,
                    question_info: card.back_info,
                    solution: card.front,
                    solution_info: card.front_info,
                }
            });

            shuffleArray(cards);

            return cards.slice(0, this.cards_count);
        },

        show_preview(){
            return !this.$vuetify.breakpoint.xs;
        },

        test_sides(){
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

        shuffleCards(){
            var current_cards_count = this.cards_count;
            
            // erzwingen, dass test_cards neu "berechnet" wird
            this.cards_count = 1;
            this.cards_count = current_cards_count;
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
        "page_title": "Vokabeltest drucken",
        "preview_title": "Vorschau",
        "options_title": "Optionen",

        "default_title": "Vokabeltest: {cardbox_name}",

        "label": {
            "title": "Titel",
            "text": "Text",
            "test_side": "Was soll abgefragt werden?",
            "with_solution": "Lösungen mit drucken",
            "with_info": "Zusatzinformationen anzeigen",
            "info_color_light": "Zusatzinformationen ausgrauen",
            "cards_count": "Vokabelanzahl",
            "print": "Drucken",
            "shuffle": "Vokabeln mischen"
        },

        "test_side_front_default": "Vorderseite",
        "test_side_back_default": "Rückseite",

        "no_preview_hint": "Die Vorschau ist nur auf größeren Bildschirmen vorhanden."
    }
}
</i18n>