<template>
<div>
    <h1 class="grey--text mb-1">
        <v-icon left large color="grey">search</v-icon> {{$t('page_title')}}
    </h1>  

    <v-text-field solo large 
                    v-model="search_keyword"
                    :placeholder="$t('search_input_placeholder')"
                    :rules="[rules.minLength(3)]"
                    autofocus
                    @click:append="search"
                    @keydown.enter="search">
        <template v-slot:append>
            <v-btn icon @click="search" :disabled="search_keyword.length < 3"
                                        :loading="loading_search_card || loading_search_cardbox">
                <v-icon>send</v-icon>
            </v-btn>
        </template>
    </v-text-field>

    <v-tabs fixed-tabs 
            show-arrows 
            background-color="transparent"
            v-model="selected_tab"
            ref="tabs">
        <v-tab>
            <v-badge right :color="card_result !== null && card_result.length > 0 ? 'primary' : 'grey'">
                <template v-slot:badge>
                    <span v-if="card_result !== null">{{card_result.length}}</span>
                </template>

                {{$t('cards_tab_caption')}}
            </v-badge>
        </v-tab>
        <v-tab>
            <v-badge right :color="cardbox_result !== null && cardbox_result.length > 0 ? 'primary' : 'grey'">
                <template v-slot:badge>
                    <span v-if="cardbox_result !== null">{{cardbox_result.length}}</span>
                </template>

                {{$t('cardboxes_tab_caption')}}
            </v-badge>
        </v-tab>
    </v-tabs>

    <div class="mt-6" v-if="selected_tab === 0">
        <ApiErrorMessage v-if="error_search_card" :error="error_search_card" />

        <CramfireLoadingIndicator v-if="loading_search_card" :height="300" />

        <v-alert :value="card_result !== null && card_result.length === 0" outlined color="info">
            {{$t('message_no_cards_found')}}
        </v-alert>

        <v-card class="elevation-2" v-if="card_result !== null && card_result.length > 0">
            <v-card-text class="pa-0">
                <div v-for="(card, index) in card_result" 
                                :key="card.id">

                    <v-divider v-if="index > 0" />

                    <v-hover>
                        <v-layout wrap slot-scope="{hover}" class="px-2 py-6" :class="{'grey lighten-3': hover}">
                                <v-flex xs10 md11>
                                    <v-layout wrap class="black--text">
                                        <v-flex xs12 sm4 :pr-1="!$vuetify.breakpoint.xs">{{excerpt(card.front)}}</v-flex>
                                        <v-flex xs12 sm4 :px-1="!$vuetify.breakpoint.xs">{{excerpt(card.back)}}</v-flex>
                                        <v-flex xs12 sm4 :pl-1="!$vuetify.breakpoint.xs">
                                            <router-link class="grey--text text-decoration-none" 
                                                         :to="{name: 'cardbox.show', params: {cardbox_id: card.cardbox_id}}" >
                                                {{excerpt(card.cardbox_name)}}
                                            </router-link>
                                        </v-flex>
                                    </v-layout>
                                </v-flex>
                                <v-flex xs2 md1 aling-center>
                                    <v-btn icon @click.stop="edit_card(card)">
                                        <v-icon>edit</v-icon>
                                    </v-btn>
                                    <v-btn icon :to="{name: 'cardbox.show', params: {cardbox_id: card.cardbox_id}}">
                                        <v-icon>send</v-icon>
                                    </v-btn>
                                </v-flex>
                        </v-layout>
                    </v-hover>
                </div>
            </v-card-text>
        </v-card>
    </div>

    <div class="mt-6" v-if="selected_tab === 1">
        <ApiErrorMessage v-if="error_search_cardbox" :error="error_search_cardbox" />

        <CramfireLoadingIndicator v-if="loading_search_cardbox" :height="300" />

        <v-alert :value="cardbox_result !== null && cardbox_result.length === 0" outlined color="info">
            {{$t('message_no_cardboxes_found')}}
        </v-alert>
        
        <v-card class="elevation-2" v-if="cardbox_result !== null && cardbox_result.length > 0">
            <v-card-text class="pa-0">
                <router-link v-for="(cardbox, index) in cardbox_result" 
                                :key="cardbox.id"
                                :to="{name: 'cardbox.show', params: {cardbox_id: cardbox.id}}" 
                                class="text-decoration-none">

                    <v-divider v-if="index > 0" />
                        
                    <v-hover>
                        <v-layout wrap slot-scope="{hover}" class="px-2 py-6" :class="{'grey lighten-3': hover}">
                                <v-flex xs10 sm11>
                                    <v-layout wrap class="black--text">
                                        <v-flex xs12>{{excerpt(cardbox.name)}}</v-flex>
                                        <v-flex xs12 class="grey--text">{{excerpt(cardbox.description)}}</v-flex>
                                    </v-layout>
                                </v-flex>
                                <v-flex xs2 sm1 aling-center>
                                    <v-btn icon :to="{name: 'cardbox.show', params: {cardbox_id: cardbox.id}}">
                                        <v-icon>send</v-icon>
                                    </v-btn>
                                </v-flex>
                        </v-layout>
                    </v-hover>
                </router-link>
            </v-card-text>
        </v-card>
    </div>

    <CardEditDialog v-model="show_card_edit_dialog" :card="current_edit_card" v-if="current_edit_card !== null" />
</div>
</template>

<script>
import CramfireLoadingIndicator from "../components/CramfireLoadingIndicator"
import ApiErrorMessage from "../components/ApiErrorMessage"
import rules from "../validation_rules"
import http from "../http"
import {handleApiError} from "../structs/ApiError"
import CardEditDialog from "../components/dialogs/CardEditDialog"

export default {

    components: {
        CramfireLoadingIndicator,
        ApiErrorMessage,
        CardEditDialog
    },
    
    data(){
        return {
            rules,

            search_keyword: '',
            selected_tab: null,
            cardbox_result: null,
            card_result: null,

            show_card_edit_dialog: false,
            current_edit_card: null,
            
            loading_search_cardbox: false,
            error_search_cardbox: false,
            loading_search_card: false,
            error_search_card: false,
        }
    },

    mounted(){
        this.search_keyword = this.$route.params.keyword.trim(); 

        if( this.search_keyword.length >= 3 )
        {
            this.search();
        }

        // Vuetify Bugfix: Die Position des Sliders der Sprachauswahl-Tabs updaten, 
        // damit sie möglichst immer korrekt ist
        setTimeout( () => {
            if( this.$refs.tabs )
            {
                this.$refs.tabs.callSlider();
            }
        }, 200);
    },

    watch: {
        url_keyword(new_value){
            this.search_keyword = new_value;

            this.search();
        },
        
        show_card_edit_dialog(new_value, old_value){
            if( new_value === false && old_value === true )
            {
                // TODO: Das alles gegen eine Reaktive Lösung ersetzen, indem die Suchergebnisse im Vuex State gespeichert und verwaltet werden.
                var new_card_state = this.$store.getters['cardbox/cardById'](this.current_edit_card.id);

                for(var index in this.card_result)
                {
                    if( this.card_result[index].id === new_card_state.id )
                    {
                        this.card_result[index].front = new_card_state.front;
                        this.card_result[index].front_info = new_card_state.front_info;
                        this.card_result[index].back = new_card_state.back;
                        this.card_result[index].back_info = new_card_state.back_info;
                    }
                }
            }
        }
    },

    computed: {
        url_keyword(){
            return this.$route.params.keyword;
        }
    },

    methods: {
        search(){
            if( this.search_keyword.trim().length < 3 ){ return; } // Suchbegriff zu kurz 

            if( this.$route.params.keyword !== this.search_keyword )
            {
                // Url anpassen, damit sie mit der Suche übereinstimmt
                this.$router.push({
                    name: 'search',
                    params: {
                        keyword: this.search_keyword
                    }
                });

                // Suche wird sonst doppel getriggert, weil sie auch beim aufrufen der Seite getriggert wird
                return;
            }

            this.loading_search_cardbox = true;
            this.loading_search_card    = true;
            this.error_search_cardbox   = false;
            this.error_search_card      = false;

            this.card_result = null;
            this.cardbox_result = null;

            // Karten suchen
            http.post(`${process.env.VUE_APP_API_BASE_URL}/search/card`, {keyword: this.search_keyword})
                .then((response) => {
                    this.card_result = response.data.data;
                    this.loading_search_card = false;
                    this.error_search_card   = false;
                })
                .catch(handleApiError)
                .catch((error) => {
                    this.loading_search_card = false;
                    this.error_search_card   = error;
                });

            // Karteikästen suchen
            http.post(`${process.env.VUE_APP_API_BASE_URL}/search/cardbox`, {keyword: this.search_keyword})
                .then((response) => {
                    this.cardbox_result = response.data.data;
                    this.loading_search_cardbox = false;
                    this.error_search_cardbox   = false;
                })
                .catch(handleApiError)
                .catch((error) => {
                    this.loading_search_cardbox = false;
                    this.error_search_cardbox   = error;
                });
        },

        excerpt(value){
            if( value === null )
            {
                return '';
            }

            var max_length = this.$vuetify.breakpoint.xs ? 25 : 50;

            if( value.length > max_length )
            {
                return value.substr(0, max_length) + '...';
            }

            return value;
        },

        edit_card(card){
            if( card === null )
            {
                return; 
            }

            this.current_edit_card = card;
            this.show_card_edit_dialog = true;
        },
    }
}
</script>

<i18n>
{
    "de": {
        "page_title": "Suche",

        "search_input_placeholder": "Suchbegriff",

        "cards_tab_caption": "Karten",
        "cardboxes_tab_caption": "Karteikästen",

        "message_no_cards_found": "Es wurden keinen Karten zu diesem Suchbegriff gefunden.",
        "message_no_cardboxes_found": "Es wurden keine Karteikästen zu diesem Suchbegriff gefunden."
    }
}
</i18n>