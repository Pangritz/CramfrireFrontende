<template>
<div>

    <v-container class="py-0">
        <v-row justify="center">
            <v-col cols="12" sm="10" md="8" lg="6" class="py-0">
                <v-row>
                    <v-col cols="7" sm="8" class="pa-0">
                        <div class="title grey--text mb-1">{{$t('page_title')}}</div>  
                    </v-col>
                    
                    <v-col cols="5" sm="4" class="pa-0 text-right">
                        <v-tooltip bottom>
                            <template v-slot:activator="{on}">
                                <v-btn text icon class="ma-0" v-on="on" @click="show_settings_dialog = true">
                                    <v-icon>settings</v-icon>
                                </v-btn>
                            </template>
                            <span>{{$t('tooltip.settings')}}</span>
                        </v-tooltip>
                    </v-col>
                </v-row>

                <v-row v-if="loading || error !== false">
                    <v-col>
                        <ApiErrorMessage :error="error" v-if="error !== false" />

                        <CramfireLoadingIndicator v-if="loading" />
                    </v-col>
                </v-row>
                
                <v-row v-if="state == 'start' && !loading">
                    <v-col>
                        <v-row>
                            <v-col class="px-0 pt-0">
                                <p class="body-2">
                                    {{$t('description')}}
                                </p>
                            </v-col>
                        </v-row>

                        <v-row justify="center">
                            <v-col cols="12" sm="8" md="6" class="py-0">    
                                <v-btn color="primary" block large @click="start">
                                    <v-icon left>play_arrow</v-icon>
                                    {{$t('button.start')}}
                                </v-btn>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col clas="py-0">
                                <v-checkbox :label="$t('label.auto_replay')" v-model="auto_replay" class="justify-center" />
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col class="pt-4 text-center">
                                <v-btn @click="show_settings_dialog = true">
                                    <v-icon left>settings</v-icon>
                                    {{$t('button.settings')}}
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                
                <v-row v-if="state == 'running'">
                    <v-col cols="12" class="pa-0">
                        <Card :card="current_card" 
                              :show_front="show_card_front" 
                              :class="{
                                'speedlearning-show-front': show_card_front,
                                'speedlearning-show-back': !show_card_front,
                              }"
                              v-if="current_card != null" />
                    </v-col>
                    
                    <v-col cols="12" class="px-0">
                        <v-btn color="error" block @click="stop">
                            <v-icon left>power_settings_new</v-icon>
                            {{$t('button.stop')}}
                        </v-btn>
                    </v-col>
                </v-row>

                <v-row v-if="state == 'end'">
                    <v-col>
                        <v-row justify="center" class="mb-5">
                            <v-col cols="12" sm="8" md="6" class="py-0">
                                <v-btn color="primary" block @click="goBack">
                                    {{$t('button.back')}}
                                </v-btn>
                            </v-col>
                        </v-row>

                        <v-row justify="center">
                            <v-col cols="12" sm="8" md="6" class="py-0">
                                <v-btn block @click="start">
                                    <v-icon left>replay</v-icon>
                                    {{$t('button.replay')}}
                                </v-btn>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col class="py-0">
                                <v-checkbox :label="$t('label.auto_replay')" v-model="auto_replay" class="justify-center" />
                            </v-col>
                        </v-row>
                        
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>

    <SpeedlearningSettingsDialog v-model="show_settings_dialog" />
</div>
</template>

<script>
import CramfireLoadingIndicator from '../components/CramfireLoadingIndicator'
import ApiErrorMessage from '../components/ApiErrorMessage'
import Card from '../components/Card'
import { handleApiError } from '../structs/ApiError'
import SpeedlearningSettingsDialog from '../components/dialogs/SpeedlearningSettingsDialog'
import {shuffle} from '../helpers/arrayHelpers'

export default {
    components: {
        CramfireLoadingIndicator,
        ApiErrorMessage,
        Card,
        SpeedlearningSettingsDialog,
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

            flipped: false,
            progress: 0,
            state: 'start',
            current_card_id: null,
            remaining_cards: [],
            auto_replay: false,
            next_timeout: null,

            show_settings_dialog: false,
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
                   .then(() => {
                        this.loading = false;
                        this.error = false;
                   })
                   .catch(handleApiError)
                   .catch((error) => {
                       this.loading = false;
                       this.error = error;
                   });
        }
        else
        {
            // Alle Karteikästen bereits vorhanden
            this.loading = false;
            this.error = false;
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

        cards(){
            var cards = [], cardbox;

            for(var i in this.study_cardbox_ids)
            {
                cardbox = this.$store.getters['cardbox/cardboxById'](this.study_cardbox_ids[i]);

                cards = [
                    ...cards,
                    ...cardbox.cards
                ];
            }

            return cards;
        },

        current_card(){
            return this.$store.getters['cardbox/cardById'](this.current_card_id);
        },

        show_card_front(){
            return (this.first_side == 'front') !== this.flipped; 
        },

        first_side(){
            return this.$store.state.options.speedlearning.first_side; 
        },

        front_display_duration(){
            return this.$store.state.options.speedlearning.front_display_duration * 1000; 
        },

        back_display_duration(){
            return this.$store.state.options.speedlearning.back_display_duration * 1000; 
        },
    },

    methods: {
        start(){
            var next_cards = [...this.cards];
            shuffle(next_cards);

            this.remaining_cards = [];
            var pool = [];            
            while(next_cards.length > 0)
            {
                pool = next_cards.splice(0, 7);
                this.remaining_cards = [
                    ...this.remaining_cards,
                    ...pool,
                    ...pool
                ];
            }

            this.state = 'running';            
            this.nextCard();
        },

        stop(){
            this.state = 'end';
            clearTimeout(this.next_timeout);
        },

        nextCard(){
            if( this.remaining_cards.length === 0 )
            {
                if( this.auto_replay )
                {
                    this.start();
                    return;
                }
                else
                {
                    this.state = 'end';
                    return;
                }
            }

            this.flipped = false;
            this.current_card_id = this.remaining_cards.shift();
            var duration = this.first_side == 'front' ? this.front_display_duration : this.back_display_duration;

            this.next_timeout = setTimeout(this.turnCard, duration);
        },

        turnCard(){
            this.flipped = true;
            var duration = this.first_side == 'front' ? this.back_display_duration : this.front_display_duration;

            this.next_timeout = setTimeout(this.nextCard, duration);
        },

        goBack(){ 
            this.$router.back(); 
        },
    }
}
</script>

<style lang="scss">

.speedlearning-show-front .card { background: #E3F2FD; }
.speedlearning-show-back .card { background: #FFF3E0; }

.theme--dark {
    .speedlearning-show-front .card { background: rgb(0, 37, 63); }
    .speedlearning-show-back .card { background: rgb(56, 35, 0); }
}

</style>

<i18n>
{
    "de": {
        "page_title": "Schnelllernen",
        "description": "Schnelles Einprägen der Vokabeln, als Vorbereitung für die nächsten Lernschritte!",

        "button": {
            "settings": "Einstellungen",
            "start": "Start",
            "stop": "Durchlauf beenden",
            "replay": "Neuer Durchlauf",
            "back": "Zurück"
        },

        "label": {
            "auto_replay": "Automatisch wiederholen"
        },

        "tooltip": {
            "settings": "Einstellungen"
        },

        "remaining_cards": "Fertig! | Noch eine Karte | Noch <strong class='black--text'>{count}</strong> Karten",

        "end_title": "Fertig!",
        "end_text": "Du bist wirklich fleißig. Weiter so!"
    }
}
</i18n>