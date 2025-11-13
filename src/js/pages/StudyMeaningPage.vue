<template>
<div>

    <v-layout wrap v-if="is_end === false">
        <v-flex xs12 sm10 offset-sm1 md6 offset-md3>
            <ApiErrorMessage :error="error" v-if="error !== false" />

            <CramfireLoadingIndicator v-if="loading" />

            <v-layout wrap v-if="!loading && !error">
                <v-flex xs7 sm8>
                    <div class="title grey--text mb-1">{{$t('page_title')}}</div>  
                </v-flex>
                <v-flex xs5 sm4 text-right>
                    <v-tooltip bottom>
                        <template v-slot:activator="{on}">
                            <v-btn text icon class="ma-0" v-on="on" @click="show_front = !show_front">
                                <v-icon large>swap_horiz</v-icon>
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
                </v-flex>
            </v-layout>
        </v-flex>

        <v-flex xs12 sm10 offset-sm1 md6 offset-md3>
            <Card :card="current_card" :show_front="show_card_front" v-if="current_card != null" />
        </v-flex>

        <v-flex xs12 sm10 offset-sm1 md6 offset-md3 :class="{'study-actions-bottom': $vuetify.breakpoint.xs}" v-if="!loading && !error">
            <v-layout wrap>
                <v-flex xs12 mt-2 v-if="!flipped">
                    <v-btn color="primary" block large @click="turnCard">
                        <v-icon left>undo</v-icon>
                        {{$t('button.turn_card')}}
                    </v-btn>
                </v-flex>
                <v-flex xs6 pr-1 mt-2 v-if="flipped">
                    <v-btn color="success" block large @click="answerRight">
                        <v-icon left>check</v-icon> {{$t('button.right')}}
                    </v-btn>
                </v-flex>
                <v-flex xs6 pl-1 mt-2 v-if="flipped">
                    <v-btn color="error" block large @click="answerWrong">
                        <v-icon left>close</v-icon> {{$t('button.wrong')}}
                    </v-btn>        
                </v-flex>

                <v-flex xs12>
                    <v-progress-linear
                        color="info"
                        height="20"
                        :value="progress"
                        class="mt-4 mb-2"
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

    <CardEditDialog v-model="show_card_edit_dialog" :card="current_card" v-if="current_card !== null" />
</div>
</template>

<script>
import CramfireLoadingIndicator from '../components/CramfireLoadingIndicator';
import ApiErrorMessage from '../components/ApiErrorMessage';
import Card from '../components/Card'
import Inquiry from '../classes/Inquiry'
import { handleApiError } from '../structs/ApiError';
import CardEditDialog from '../components/dialogs/CardEditDialog'

export default {
    components: {
        CramfireLoadingIndicator,
        ApiErrorMessage,
        Card,
        CardEditDialog
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

            show_front: false,
            flipped: false,
            progress: 0,
            is_end: false,
            inquiry: null,
            current_card_id: null,
            remaining_cards_count: null,

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

        window.addEventListener('keydown', this.handleKeyDown);
    },

    destroyed(){
        window.removeEventListener('keydown', this.handleKeyDown);
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
        }
    },

    methods: {
        init(){
            var data = {
                type: 1,
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

        handleKeyDown(event)
        {
            var key = event.which || event.keyCode;

            if( key === 38 && this.flipped === false ) // Pfeiltaste "hoch"
            {
                this.turnCard();
            }
            else if( key === 37 && this.flipped === true ) // Pfeiltaste "links"
            {
                this.answerRight();
            }
            else if( key === 39 && this.flipped === true ) // Pfeiltaste "rechts"
            {
                this.answerWrong();
            }
        },

        nextCard(){
            this.current_card_id = this.inquiry.nextCard();

            this.is_end = this.inquiry.isEnd();
            this.progress = this.inquiry.getProgress();
            this.remaining_cards_count = this.inquiry.getRemainingCardsCount();
            this.flipped = false;
        },

        turnCard(){
            this.flipped = true;
        },

        answerRight()
        {
            this.inquiry.answer(true);
            this.nextCard();
        },

        answerWrong()
        {
            this.inquiry.answer(false);
            this.nextCard();
        },

        goBack(){ 
            this.$router.back(); 
        }
    }
}
</script>

<i18n>
{
    "de": {
        "page_title": "Bedeutung",

        "button": {
            "turn_card": "Aufdecken",
            "right": "Richtig",
            "wrong": "Falsch",

            "replay": "Abfrage wiederholen"
        },

        "tooltip": {
            "swap_sides": "Seiten tauschen",
            "edit": "Karte bearbeiten"
        },

        "remaining_cards": "Fertig! | Noch eine Karte | Noch <strong class='black--text'>{count}</strong> Karten",

        "end_title": "Fertig!",
        "end_text": "Du bist wirklich fleißig. Weiter so!"
    }
}
</i18n>