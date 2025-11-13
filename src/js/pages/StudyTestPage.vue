<template>
<div>
    <v-layout wrap>
        <v-flex xs12 md8 offset-md2>
            <v-layout>
                <v-flex xs8 sm10>
                    <div class="grey--text mb-6" :class="{
                        'display-1': $vuetify.breakpoint.smAndUp,
                        'headline': $vuetify.breakpoint.xs
                    }">{{$t('page_title')}}</div>

                    <ApiError :error="error" v-if="error !== false && !loading" />
                    <CramfireLoadingIndicator v-if="loading" />
                </v-flex>
        
                <v-flex xs4 sm2 class="text-right">
                    <v-tooltip bottom>
                        <template v-slot:activator="{on}">
                            <v-btn text icon class="ma-0" v-on="on" v-if="!submitted"
                                   :to="{name: test_side == 'front' ? 'study.test_back' : 'study.test_front', params: { cardbox_id }}">
                            <v-icon large>swap_horiz</v-icon>
                            </v-btn>
                        </template>
                        <span>{{$t('tooltip.swap_sides')}}</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template v-slot:activator="{on}">
                            <v-btn text icon class="ma-0" v-on="on" @click="show_options_dialog = true">
                                <v-icon>settings</v-icon>
                            </v-btn>
                        </template>
                        <span>{{$t('tooltip.options')}}</span>
                    </v-tooltip>
                </v-flex>
            </v-layout>
        </v-flex>

        <v-flex xs12 md8 offset-md2 v-if="!loading && cardbox !== null && !error">
            <v-card>
                <v-card-text>
                    <v-layout wrap v-for="(card, index) in test_cards" :key="card.id">
                        <v-flex xs12 md6 :pr-2="!$vuetify.breakpoint.xs" py-2>
                            <div class="multiline-text black--text">{{test_side == 'front' ? card.back : card.front}}</div>
                            <div class="multiline-text grey--text pt-1">{{test_side == 'front' ? card.back_info : card.front_info}}</div>
                        </v-flex>

                        <v-flex xs10 md5 :pl-2="!$vuetify.breakpoint.xs" py-2>
                            <v-text-field class="ma-0 pa-0" 
                                          :disabled="submitted" 
                                          hint="Leerzeichen statt Zeilenumbrüche"
                                          v-model="test_cards[index].input"
                                          v-if="!submitted"
                                          spellcheck="false" 
                                          autocapitalize="off" 
                                          autocomplete="off" 
                                          autocorrect="off" 
                                          :ref="'input_'+index"
                                          @focus="focus_on = index" />

                            <SpecialCharsKeyboard :lowercase_chars="current_keyboard_language.special_chars_lowercase" 
                                          :uppercase_chars="current_keyboard_language.special_chars_uppercase"
                                          :size="5"
                                          :md_size="10"
                                          @charSelected="(char) => handleSpecialCharSelected(index, char)"
                                          v-if="current_keyboard_language.has_special_chars && focus_on == index" /> 
                            
                            <p v-if="submitted && card.right" class="success--text">
                                {{card.input}}
                            </p>

                            <p v-if="submitted && !card.right" class="error--text">{{card.input}}</p>
                            <p v-if="submitted && !card.right">{{card[test_side]}}</p>
                        </v-flex>

                        <v-flex xs2 md1 d-flex justify-center align-center>
                            <v-icon color="error" v-if="submitted && !card.right">clear</v-icon>
                            <v-icon color="success" v-if="submitted && card.right">check</v-icon>
                        </v-flex>

                        <v-flex xs12 mb-6 v-if="index < test_cards.length-1">
                            <v-divider />
                        </v-flex>
                    </v-layout>
                </v-card-text>

                <v-card-actions class="justify-center">
                    <v-btn block color="primary" @click="submit" v-if="!submitted">
                        <v-icon left>school</v-icon>
                        {{$t('submit')}}
                    </v-btn>

                    <v-alert color="info" outlined icon="school" :value="submitted" v-if="submitted" class="title mb-2">
                        {{percentage}}% - {{$t('grade_label')}}: {{grade}} ({{$t('grade.'+grade)}})
                    </v-alert>
                </v-card-actions>
            </v-card>
        </v-flex>
    </v-layout>

    <StudyOptionsDialog v-model="show_options_dialog" />

</div>
</template>

<script>
import {shuffle as shuffleArray} from "../helpers/arrayHelpers"
import ApiError, { handleApiError } from "../structs/ApiError"
import CramfireLoadingIndicator from "../components/CramfireLoadingIndicator"
import StudyOptionsDialog from '../components/dialogs/StudyOptionsDialog'
import InquiryValidator from '../classes/InquiryValidator'
import SpecialCharsKeyboard from '../components/SpecialCharsKeyboard'
import http from '../http'

export default {

    components: {
        ApiError,
        CramfireLoadingIndicator,
        StudyOptionsDialog,
        SpecialCharsKeyboard
    },

    props: {
        test_side: {
            required: true,
            type: String
        }
    },

    watch: {
        test_side(new_value, old_value){
            if( new_value !== old_value )
            {
                // Test neu laden, damit man nicht mogeln kann, indem man vor dem Abgeben die Seiten tauscht :D 
                this.init();
            }
        }
    },
    
    data(){
        return {
            loading: false,
            error: false,

            show_options_dialog: false,
            focus_on: null,

            cards_per_test: 12,
            test_cards: null,
            submitted: false,
            grade: null,
            percentage: 0,
        }
    },

    mounted(){
        if( this.cardbox === null || 'cards' in this.cardbox === false )
        {
            this.loadCardbox()
                .then(this.init);
        }
        else
        {
            this.init();
        }
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

        front_language(){
            if( this.cardbox === null ){ return null; }

            return this.$store.getters['language/languageById'](this.cardbox.front_language);
        },

        back_language(){
            if( this.cardbox === null ){ return null; }

            return this.$store.getters['language/languageById'](this.cardbox.back_language);
        },

        front_language_label(){
            if( this.front_language === null ){ return this.$t('front_language_label_default'); }

            return this.$t('global.languages.'+ this.front_language.shortcode);
        },

        back_language_label(){
            if( this.back_language === null ){ return this.$t('back_language_label_default'); }

            return this.$t('global.languages.'+ this.back_language.shortcode);
        },

        current_keyboard_language(){
            if( this.test_side === 'front' )
            {
                return this.front_language;
            }

            return this.back_language;
        },

        options_case_insensitive(){
            return this.$store.state.options.spelling.case_insensitive;
        },

        options_punctuation_chars_optional(){
            return this.$store.state.options.spelling.punctuation_chars_optional;
        },

        options_easy_special_chars(){
            return this.$store.state.options.spelling.easy_special_chars;
        },

        options_brackets_optional(){
            return this.$store.state.options.spelling.brackets_optional;
        },

        options_split_parts_on_comma(){
            return this.$store.state.options.spelling.split_parts_on_comma;
        },

        options_only_parts(){
            return this.$store.state.options.spelling.only_parts;
        }
    },

    methods: {
        init(){
            this.test_cards = this.getCardsForTest();
        },

        loadCardbox(){
            this.loading = true;

            return this.$store.dispatch('cardbox/loadCardbox', this.cardbox_id)
                              .then(() => {
                                  this.loading = false;
                                  this.error = false;
                              })
                              .catch((error) => {
                                  this.error = error;
                                  this.loading = false;
                              });
        },

        getCardsForTest(){
            var cards_copy = this.cards.slice();

            shuffleArray(cards_copy);

            // Damit input reactive wird, Karten entsprechend neu "zusammenbauen",
            // damit der Observer der Karten verschwindet und auch input reactive wird
            cards_copy = cards_copy.map(function(card){
                return {
                    ...card,
                    input: ''
                }
            });

            return cards_copy.slice(0, this.cards_per_test);
        },

        submit(){
            this.submitted = true;
            this.focus_on  = null;

            var cards_right = 0;
            var card_statistic_updates = [];

            for(var i=0; i < this.test_cards.length; i++)
            {
                var input = this.test_cards[i].input || '';
                var card  = this.test_cards[i][this.test_side];

                var right = InquiryValidator.compareCards(input, card,
                                                        this.options_case_insensitive,
                                                        this.options_punctuation_chars_optional,
                                                        this.options_easy_special_chars,
                                                        this.options_brackets_optional,
                                                        this.options_split_parts_on_comma,
                                                        this.options_only_parts);

                if( right === true )
                {
                    cards_right++;

                    card_statistic_updates.push({
                        card_id: this.test_cards[i].id,
                        state: 1
                    });
                }
                else
                {
                    card_statistic_updates.push({
                        card_id: this.test_cards[i].id,
                        state: 0
                    });
                }

                this.test_cards[i].right = right;
            }

            http.post(`${process.env.VUE_APP_API_BASE_URL}/card_statistics/test`, {updates: card_statistic_updates})
                .catch(handleApiError);

            this.percentage = Math.round( (cards_right / this.test_cards.length) * 100 );
            
            if( this.percentage >= 96 )
            {
                // sehr gut 
                this.grade = 1;
            }
            else if( this.percentage >= 80 )
            {
                // gut
                this.grade = 2;
            }
            else if( this.percentage >= 60 )
            {
                // befriedigend
                this.grade = 3;
            }
            else if( this.percentage >= 45 )
            {
                // ausreichend
                this.grade = 4;
            }
            else if( this.percentage >= 16 )
            {
                // mangelhaft
                this.grade = 5;
            }
            else if( this.percentage >= 0 )
            {
                // ungenügend
                this.grade = 6;
            }
        },

        insertChar(input, char, selectionStart, selectionEnd){
            return input.substr(0, selectionStart) + char + input.substr(selectionEnd, input.length);
        },

        handleSpecialCharSelected(index, char){
            var input = this.$refs['input_'+index][0].$el.querySelector('input[type=text]');
            var selectionStart = input.selectionStart,
                selectionEnd   = input.selectionEnd;

            if( this.test_cards !== null 
                && 'input' in this.test_cards[index]
                && this.test_cards[index].input !== null )
            {
                this.test_cards[index].input = this.insertChar( this.test_cards[index].input, 
                                                                char, 
                                                                input.selectionStart, 
                                                                input.selectionEnd);
            }
            else
            {
                this.test_cards[index].input = char;
            }

            this.$nextTick(() => {
                this.$refs['input_'+index][0].focus();
                input.selectionStart = selectionEnd+1 - (selectionEnd - selectionStart);
                input.selectionEnd   = selectionEnd+1 - (selectionEnd - selectionStart);
            });
        }
    }

}
</script>

<i18n>
{
    "de": {
        "page_title": "Vokabeltest",

        "back_language_label_default": "Rückseite",
        "front_language_label_default": "Vorderseite",

        "tooltip": {
            "swap_sides": "Seiten tauschen",
            "options": "Einstellungen"
        },

        "grade_label": "Note",
        "grade": {
            "1": "sehr gut",
            "2": "gut",
            "3": "befriedigend",
            "4": "ausreichend",
            "5": "mangelhaft",
            "6": "ungenügend"
        },

        "submit": "Abgeben"
    }
}
</i18n>