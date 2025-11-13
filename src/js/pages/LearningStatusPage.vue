<template>
<div>
    <PageTitle :text="$t('page_title')" icon="spellcheck" />

    <v-card class="mb-6">
        <v-card-title class="headline justify-space-between" v-if="cardbox !== null">
            {{cardbox.name}}

            <v-btn color="red" class="d-none" outlined @click="resetCardboxLearningStatus(cardbox_id)">
                <v-icon left>school</v-icon> {{$t('reset_learning_status')}}
            </v-btn>
        </v-card-title>
        <v-card-text>
            <CramfireLoadingIndicator height="100" v-if="loading_cardbox" />
            <ApiError :error="error_cardbox" v-if="error_cardbox !== false && !loading_cardbox" />

            <v-layout wrap v-if="!loading_cardbox && !error_cardbox">
                <v-flex xs12 sm5 mb-6>
                    <p class="title">{{$t('meaning')}}</p>
                    <LearningStatus :known="cardbox.learning_status.meaning_known" 
                                    :unknown="cardbox.learning_status.meaning_unknown" />
                </v-flex>

                <v-flex xs12 sm5 offset-sm2>
                    <p class="title">{{$t('spelling')}}</p>
                    <LearningStatus :known="cardbox.learning_status.spelling_known" 
                                    :unknown="cardbox.learning_status.spelling_unknown" />
                </v-flex>

                <v-flex xs12 sm10 offset-sm1 md8 offset-md2 lg6 offset-lg3 mt-2>
                    <v-layout wrap justify-center align-center>
                        <v-flex xs12 sm4 text-center>
                            <v-icon color="success">lens</v-icon> 
                            <span class="py-2">{{$t('known')}}</span>
                        </v-flex>
                        <v-flex xs12 sm4 text-center>
                            <v-icon color="error">lens</v-icon> 
                            <span class="py-2">{{$t('unknown')}}</span>
                        </v-flex>
                        <v-flex xs12 sm4 text-center>
                            <v-icon color="gray">lens</v-icon> 
                            <span class="py-2">{{$t('unseen')}}</span>
                        </v-flex>
                    </v-layout>
                </v-flex>
                <v-flex xs12 sm5 offset-sm7 offset-lg9 lg3 class="mt-5 d-flex justify-end">
                    <v-dialog v-model="show_reset_dialog" persistent max-width="330">
                        <template v-slot:activator="{ on }">
                            <v-btn color="red" outlined v-on="on">
                                <v-icon left>school</v-icon> {{$t('reset_learning_status')}}
                            </v-btn>
                        </template>
                        <v-card>
                            <v-card-title class="headline pb-0">Lernstand zurücksetzen</v-card-title>
                            <v-card-text>Soll der Lernstand wirklich unwiderruflich zurückgesetzt werden?</v-card-text>
                            <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="red darken-1" text @click="show_reset_dialog = false">Nein</v-btn>
                            <v-btn color="green darken-1" text @click="handleReset">Ja</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-flex>
            </v-layout>
        </v-card-text>
    </v-card>

    <div class="headline grey--text">{{$t('cards')}}</div>

    <CramfireLoadingIndicator height="200" v-if="loading_cards_learning_status" />    
    <ApiError :error="error_cards_learning_status" v-if="error_cards_learning_status !== false && !loading_cards_learning_status" />
    
    <div v-if="!loading_cards_learning_status && !error_cards_learning_status">
        <CardLearningStatus v-for="card in current_cards" 
                            :key="card.id" 
                            :front="card.front" 
                            :back="card.back"
                            :learning_status="getCardLearningStatus(card.id)" />

        <div class="text-center" v-if="page_count > 1">
            <v-btn v-if="current_page > 1" @click="handlePageBack">
                <v-icon>keyboard_arrow_left</v-icon>
            </v-btn>

            <span class="title font-weight-bold px-6">{{current_page}}</span>

            <v-btn v-if="current_page < page_count" @click="handlePageForward">
                <v-icon>keyboard_arrow_right</v-icon>
            </v-btn>
        </div>

        <div v-if="cards.length === 0" class="grey--text text-center">
            {{$t('no_cards_hint')}}
        </div>
    </div>
</div>
</template>

<script>
import http from "../http"
import ApiError, {handleApiError} from "../structs/ApiError"
import CramfireLoadingIndicator from "../components/CramfireLoadingIndicator"
import LearningStatus from "../components/LearningStatus"
import CardLearningStatus from "../components/CardLearningStatus"
import PageTitle from "../components/PageTitle"

export default {
    components: {
        ApiError,
        CramfireLoadingIndicator,
        LearningStatus,
        CardLearningStatus,
        PageTitle
    },

    data(){
        return {
            error_cardbox: false,
            loading_cardbox: true,
            
            error_cards_learning_status: false,
            loading_cards_learning_status: false,

            cards_learning_status: null,

            cards_per_page: 60,
            current_page: 1,
            show_reset_dialog: false,
        }
    },

    mounted(){
        if( this.cardbox === null || 'cards' in this.cardbox === false )
        {
            this.loadCardbox();
        }
        else
        {
            // Karteikasten wurde bereits geladen => muss nicht geladen werden
            this.loading_cardbox = false;
        }

        this.loadCardsLearningStatus();
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

        current_cards(){
            var index = (this.current_page * this.cards_per_page) - this.cards_per_page;

            return this.cards.slice(index, index + this.cards_per_page);
        },

        page_count(){
            return Math.ceil(this.cards.length / this.cards_per_page);
        }
    },

    methods: {
        loadCardbox(){
            this.loading_cardbox = true;

            this.$store.dispatch('cardbox/loadCardbox', this.cardbox_id)
                       .then(() => {
                           this.loading_cardbox = false;
                           this.error_cardbox = false;
                       })
                       .catch((error) => {
                           this.loading_cardbox = false;
                           this.error_cardbox = error;
                       });
        },

        loadCardsLearningStatus(){
            this.loading_cards_learning_status = true;

            return http.get(`${process.env.VUE_APP_API_BASE_URL}/card/learning_statuses/${this.cardbox_id}`)
                .then((response) => {
                    this.cards_learning_status = response.data.data;
                    this.loading_cards_learning_status = false;
                    this.error_cards_learning_status = false;
                })
                .catch(handleApiError)
                .catch((error) => {
                    this.error_cards_learning_status = error;
                    this.loading_cards_learning_status = false;
                });
        },

        getCardLearningStatus(card_id){
            if( this.cards_learning_status === null )
            {
                return null;
            }

            if( card_id in this.cards_learning_status )
            {
                return this.cards_learning_status[card_id];
            }

            return null;
        },

        resetCardboxLearningStatus(cardbox_id){
            this.loading_cardbox = true;
            this.loading_cards_learning_status = true;

            this.$store.dispatch('cardbox/resetCardboxLearningStatus', cardbox_id)
                       .then(() => {
                           return this.loadCardbox(cardbox_id);
                       })
                       .catch((error) => {
                           this.loading_cardbox = false;
                           this.error_cardbox = error;
                       })
                       .then(() => {
                           this.loading_cardbox = false;
                           this.error_cardbox = false;

                           return this.loadCardsLearningStatus();
                       })
                       .then(() => {
                           this.loading_cards_learning_status = false;
                           this.error_cards_learning_status = false;
                       })
                       .catch((error) => {
                           this.loading_cards_learning_status = false;
                           this.error_cards_learning_status = error;
                       });
        },

        handleReset(){
            this.show_reset_dialog = false;
            this.resetCardboxLearningStatus(this.cardbox_id);
        },

        handlePageBack(){
            if( this.current_page > 1 )
            {
                this.current_page--;
                window.scrollTo(0,0);
            }
        },

        handlePageForward(){
            if( this.current_page < this.page_count )
            {
                this.current_page++;
                window.scrollTo(0,0);
            }
        }
    }
}
</script>

<i18n>
{
    "de": {
        "page_title": "Lernstand",

        "meaning": "Bedeutung",
        "spelling": "Schreibweise",

        "known": "Gewusst",
        "unknown": "Nicht gewusst",
        "unseen": "Noch nicht abgefragt",

        "reset_learning_status": "Lernstand zurücksetzen",

        "cards": "Karten",

        "no_cards_hint": "Noch keine Karten vorhanden."
    }   
}
</i18n>