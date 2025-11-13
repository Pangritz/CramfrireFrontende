<template>
<div>

    <v-layout wrap>
        <v-flex xs12 sm10 offset-sm1 md6 offset-md3>
            <v-layout wrap>
                <v-flex xs6 sm8>
                    <div class="title grey--text mb-1">{{$t('page_title')}}</div>   
                </v-flex>
                <v-flex xs6 sm4 text-right v-if="!loading && !error">
                    <v-tooltip bottom>
                        <template v-slot:activator="{on}">
                            <v-btn text icon class="ma-0" v-on="on" @click="show_front = !show_front">
                                <v-icon>swap_horiz</v-icon>
                            </v-btn>
                        </template>
                        <span>{{$t('tooltip.swap_sides')}}</span>
                    </v-tooltip>

                    <v-tooltip bottom>
                        <template v-slot:activator="{on}">
                            <v-btn text icon class="ma-0" v-on="on" @click="show_card_edit_dialog = true">
                                <v-icon>edit</v-icon>
                            </v-btn>
                        </template>
                        <span>{{$t('tooltip.edit')}}</span>
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

            <ApiErrorMessage :error="error" v-if="error !== false" />

            <CramfireLoadingIndicator v-if="loading" />
        </v-flex>

        <v-flex xs12 sm10 offset-sm1 md6 offset-md3>
            <Card :card="current_card" :show_front="show_card_front" v-if="current_card != null" />
        </v-flex>

        <v-flex xs12 sm10 offset-sm1 md6 offset-md3 v-if="!loading && !error && current_card !== null && is_end === false">
            <v-layout wrap>
                <v-flex xs12 d-flex>
                    <v-text-field solo class="mt-2" 
                                  :label="$t('label.answer')"
                                  :error-messages="answer_is_wrong ? $t('wrong_answer_hint') : ''"
                                  v-model="answer"
                                  append-icon="send"
                                  @keydown.enter="checkAnswer"
                                  @click:append="checkAnswer"
                                  :class="answer_input_classes"
                                  autofocus
                                  ref="answer_input"
                                  spellcheck="false" 
                                  autocapitalize="off" 
                                  autocomplete="off" 
                                  autocorrect="off"
                                  :key="current_card.id" />
                </v-flex>

                <v-flex xs12 mb-4>
                    <SpecialCharsKeyboard :lowercase_chars="current_keyboard_language.special_chars_lowercase" 
                                          :uppercase_chars="current_keyboard_language.special_chars_uppercase"
                                          :size="5"
                                          :md_size="10"
                                          @charSelected="handleSpecialCharSelected"
                                          v-if="current_keyboard_language.has_special_chars" />   
                </v-flex>

                <v-flex xs12>
                    <v-progress-linear
                        color="info"
                        height="20"
                        :value="progress"
                    ></v-progress-linear>

                    <div class="text-center grey--text text--darken-1" 
                         v-html="$tc('remaining_cards', remaining_cards_count)"
                         v-if="remaining_cards_count !== null" ></div>
                </v-flex>
            </v-layout>   
        </v-flex>   
    </v-layout>

    <v-layout v-if="is_end" wrap>
        <v-flex mt-6 xs12 sm10 offset-sm1 md6 offset-md3>
            <div class="display-1 text-center"><v-icon large left color="success">check_circle</v-icon> {{$t('end_title')}}</div>
            <p class="title mt-6 text-center">{{$t('end_text')}}</p>
        </v-flex>
        <v-flex mt-6 xs12 sm10 offset-sm1 md6 offset-md3 text-center>
            <v-btn color="primary" @click="goBack">
                {{$t('global.button.back')}}
            </v-btn>
            <v-btn @click="init"> 
                <v-icon left>replay</v-icon> {{$t('button.replay')}}
            </v-btn>
        </v-flex>
    </v-layout>

    <StudyOptionsDialog v-model="show_options_dialog" />

    <CardEditDialog v-model="show_card_edit_dialog" :card="current_card" v-if="current_card !== null" />
</div>
</template>

<script>
import CramfireLoadingIndicator from '../components/CramfireLoadingIndicator'
import ApiErrorMessage from '../components/ApiErrorMessage'
import StudyOptionsDialog from '../components/dialogs/StudyOptionsDialog'
import CardEditDialog from '../components/dialogs/CardEditDialog'
import SpecialCharsKeyboard from '../components/SpecialCharsKeyboard'
import { handleApiError } from '../structs/ApiError'
import Card from '../components/Card'
import Inquiry from '../classes/Inquiry'

export default {
    components: {
        CramfireLoadingIndicator,
        ApiErrorMessage,
        Card,
        StudyOptionsDialog,
        CardEditDialog,
        SpecialCharsKeyboard
    },

    props: {
        cardbox_ids: {
            default: () => [],
            type: Array
        }
    },

    data(){
        return {
            loading: true,
            error: false,

            answer: '',
            answer_correction: false,
            answer_is_wrong: null,
            answer_input_classes: '',
            show_front: false,
            flipped: false,
            progress: 0,
            is_end: false,
            inquiry: null,
            current_card_id: null,
            remaining_cards_count: null,

            show_options_dialog: false,
            show_card_edit_dialog: false,
        }
    },

    mounted(){  
        // Karteikasten/Karteikästen im State?
        var load_poromises = [];

        for(var index in this.study_cardbox_ids)
        {
            var cardbox_id = this.study_cardbox_ids[index];
            var cardbox = this.$store.getters['cardbox/cardboxById'](cardbox_id);

            if( cardbox === null || 'cards' in cardbox === false )
            {
                load_poromises.push(this.$store.dispatch('cardbox/loadCardbox', cardbox_id));
            }
        }

        if( load_poromises.length !== 0 )
        {
            Promise.all(load_poromises)
                   .then(() => this.init())
                   .catch(handleApiError)
                   .catch((error) => {
                       this.loading = false;
                       this.error = error;
                   });
        }
        else
        {
            // Alle Karteikästen bereits vorhanden
            this.init();
        }
    },

    computed: {
        study_cardbox_ids(){
            if( 'cardbox_id' in this.$route.params )
            {
                return [this.$route.params.cardbox_id];
            }

            return this.cardbox_ids;
        },

        current_card(){
            return this.$store.getters['cardbox/cardById'](this.current_card_id);
        },

        show_card_front(){
            return this.show_front != this.flipped;
        },

        current_keyboard_language(){
            var cardbox_id = this.current_card.cardbox_id;

            var cardbox = this.$store.getters['cardbox/cardboxById'](cardbox_id);

            if( this.show_front )
            {
                return this.$store.getters['language/languageById'](cardbox.back_language);
            }
             
            return this.$store.getters['language/languageById'](cardbox.front_language);
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
            var data = {
                type: 2,
                cardbox: this.study_cardbox_ids
            };

            this.loading = true;

            this.$store.dispatch('study/loadTraining', data)
                .then((training) => {
                    this.loading = false;
                    this.inquiry = new Inquiry(training.training_id, training.cards_order.slice());

                    this.current_card_id = this.inquiry.getCurrentCard();
                    this.is_end = this.inquiry.isEnd();
                    this.progress = this.inquiry.getProgress();
                    this.remaining_cards_count = this.inquiry.getRemainingCardsCount();
                    this.flipped = false;
                })
                .catch((error) => {
                    this.error = error;
                    this.loading = false;
                });
        },

        nextCard(){
            this.current_card_id = this.inquiry.nextCard();
            this.flipped = false;
            this.answer_is_wrong = false;
            this.answer_correction = false;
            this.answer = '';

            this.is_end = this.inquiry.isEnd();
            this.progress = this.inquiry.getProgress();
            this.remaining_cards_count = this.inquiry.getRemainingCardsCount();
        },

        checkAnswer(){

            if( this.answer_correction )
            {
                // Die Antwort war falsch, also muss erst einmal die korrekte Antwort eingegeben werden, 
                // bevor es weiter geht
                if( this.inquiry.checkAnswer(this.answer, this.show_front, 
                                             this.options_case_insensitive,
                                             this.options_punctuation_chars_optional,
                                             this.options_easy_special_chars,
                                             this.options_brackets_optional,
                                             this.options_split_parts_on_comma,
                                             this.options_only_parts) )
                {
                    this.playRightAnswerAnimation();
                    this.nextCard();
                    return;
                }
                
                // Noch nicht richtig eingegeben... 
                return;
            }

            if( this.inquiry.checkAnswer(this.answer, this.show_front, 
                                         this.options_case_insensitive,
                                         this.options_punctuation_chars_optional,
                                         this.options_easy_special_chars,
                                         this.options_brackets_optional,
                                         this.options_split_parts_on_comma,
                                         this.options_only_parts) )
            {
                this.playRightAnswerAnimation();
                this.inquiry.spellingAnswer(true);
                this.nextCard();
            }
            else
            {
                this.playWrongAnswerAnimation();
                this.inquiry.spellingAnswer(false);
                this.answer_correction = true;
                this.answer_is_wrong = true;
                this.flipped = true;
            }
        },

        playRightAnswerAnimation(){
            this.answer_input_classes = 'right-answer';

            setTimeout(() => this.answer_input_classes = '', 400);
        },

        playWrongAnswerAnimation(){
            this.answer_input_classes = 'wrong-answer';

            setTimeout(() => this.answer_input_classes = '', 400);
        },

        handleSpecialCharSelected(char){
            var input_el = this.$refs.answer_input.$el.querySelector('input');
               
            var selectionStart = input_el.selectionStart,
                selectionEnd   = input_el.selectionEnd;

            this.answer = this.answer.substr(0, selectionStart) + char + this.answer.substr(selectionEnd, this.answer.length);

            this.$nextTick(() => {
                this.$refs.answer_input.focus();
                input_el.selectionStart = selectionEnd+1 - (selectionEnd - selectionStart);
                input_el.selectionEnd   = selectionEnd+1 - (selectionEnd - selectionStart);
            });
            
        },

        goBack(){ 
            this.$router.back(); 
        }
    }
}
</script>

<style lang="scss">
.wrong-answer .v-input__slot {
    border: 1px solid #F44336;
    box-shadow: 0px 3px 1px -2px #EF9A9A, 0px 2px 2px 0px #EF9A9A, 0px 1px 5px 0px #EF9A9A !important;
    animation: 0.5s wrong-answer;
}

.right-answer .v-input__slot { animation: 0.5s right-answer; }

@keyframes wrong-answer {
    0% { background: #fff; }
    50% { background: #FFCDD2; }
    100% { background: #fff; }
}

@keyframes right-answer {
    0% { background: #fff; }
    50% { background: #C8E6C9; }
    100% { background: #fff; }
}
</style>

<i18n>
{
    "de": {
        "page_title": "Schreibweise",

        "button": {
            "turn_card": "Aufdecken",
            "right": "Richtig",
            "wrong": "Falsch",

            "replay": "Abfrage wiederholen"
        },

        "label": {
            "answer": "Antwort (ohne Zeilenumbrüche)"
        },

        "hint": {
            "answer": "Die richtige Antwort, mit Leerzeichen statt Zeilenumbrüche"
        },

        "tooltip": {
            "swap_sides": "Seiten tauschen",
            "edit": "Karte bearbeiten",
            "options": "Einstellungen"
        },

        "options_dialog": {
            "title": "Einstellungen",

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
        },

        "wrong_answer_hint": "Falsche Antwort. Bitte gib einmal die korrekte Schreibweise ein.",

        "remaining_cards": "Fertig! | Noch eine Karte | Noch <strong class='black--text'>{count}</strong> Karten",

        "end_title": "Fertig!",
        "end_text": "Du bist wirklich fleißig. Weiter so!"
    }
}
</i18n>