<template>
    <div>

        <ApiErrorMessage :error="error" v-if="error !== false" />

        <CramfireLoadingIndicator v-if="loading" />

        <v-card v-if="cardbox !== null && error === false && loading === false" class="mb-6">
            <v-card-title primary-title class="pt-0">
                <v-layout wrap>
                <v-flex xs11 sm6 mt-2>
                    <h1 class="headline font-weight-bold">{{cardbox.name}}</h1>
                </v-flex>
                <v-flex xs1 sm6 mt-2 class="text-right">
                    <v-btn text 
                           small 
                           :icon="!$vuetify.breakpoint.mdAndUp"
                           class="my-0 mx-2 pt-0" 
                           v-if="$vuetify.breakpoint.smAndUp"
                           @click="show_share_dialog = true">
                        <v-icon :left="$vuetify.breakpoint.mdAndUp" :color="is_shared ? 'primary' : ''">share</v-icon>
                        <span v-if="$vuetify.breakpoint.mdAndUp">{{$t('share')}}</span>
                    </v-btn>    
                      
                    <v-btn text 
                           small 
                           :icon="!$vuetify.breakpoint.mdAndUp"
                           class="my-0 mx-2 pt-0" 
                           v-if="$vuetify.breakpoint.smAndUp"
                           @click="handleFavoriteClick"
                           :loading="favorite_loading">
                        <v-icon :left="$vuetify.breakpoint.mdAndUp" :color="cardbox.favorite ? 'warning' : ''">{{ cardbox.favorite ? 'star' : 'star_border'}}</v-icon>
                        <span v-if="$vuetify.breakpoint.mdAndUp">{{$t('favorite')}}</span>
                    </v-btn>

                    <v-btn text 
                           small 
                           :icon="!$vuetify.breakpoint.smAndUp"
                           class="my-0 mx-2 pt-0" 
                           v-if="$vuetify.breakpoint.smAndUp"
                           :to="{name:'cardbox.edit', params: {cardbox_id: cardbox.id}}">
                        <v-icon :left="$vuetify.breakpoint.smAndUp">edit</v-icon>
                        <span v-if="$vuetify.breakpoint.smAndUp">{{$t('edit_cardbox')}}</span>
                    </v-btn>

                    <v-menu offset-y v-if="$vuetify.breakpoint.xs">
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    v-on="on"
                                    text
                                    icon 
                                    class="ma-0 pt-0"
                                >
                                    <v-icon>more_vert</v-icon>
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-item @click="show_share_dialog = true">
                                    <v-list-item-action>
                                        <v-icon :color="is_shared ? 'primary' : ''">share</v-icon>
                                    </v-list-item-action>
                                    <v-list-item-title>{{$t('share')}}</v-list-item-title>
                                </v-list-item>
                                <v-list-item @click="handleFavoriteClick">
                                    <v-list-item-action>
                                        <v-icon :color="cardbox.favorite ? 'warning' : ''">{{cardbox.favorite ? 'star' : 'star_border'}}</v-icon>
                                    </v-list-item-action>
                                    <v-list-item-title>{{$t('favorite')}}</v-list-item-title>
                                </v-list-item>
                                <v-list-item :to="{name:'cardbox.edit', params: {cardbox_id: cardbox.id}}">
                                    <v-list-item-action>
                                        <v-icon>edit</v-icon>
                                    </v-list-item-action>
                                    <v-list-item-title>{{$t('edit_cardbox')}}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                </v-flex>
                <v-flex xs12 sm6>
                    <div class="body-1 word-break-normal">{{cardbox.description}}</div>
                </v-flex>
                <v-flex xs12 sm6 md4 offset-md2 :class="{'px-2': !$vuetify.breakpoint.xs}">
                    <p class="mb-1 mt-6 mb-0 d-flex">
                        <router-link tag="span" :to="{name:'cardbox.learning_status', params:{cardbox_id}}" class="font-weight-bold cursor-pointer">{{$t('learning_status')}}</router-link>
                        <span class="grey--text title text-right">{{last_learned_date}}</span>
                        
                        <v-btn icon small class="mt-0 ml-1" 
                               :to="{name:'cardbox.learning_status', params:{cardbox_id}}">
                            <v-icon>school</v-icon>
                        </v-btn>
                    </p>

                    <div class="d-flex">
                        <v-flex xs12 pt-1>
                            <LearningStatus :known="cardbox.learning_status.known" 
                                            :unknown="cardbox.learning_status.unknown" 
                                            :height="20"
                                            v-if="cardbox.learning_status" />
                        </v-flex>
                    </div>
                </v-flex>
                </v-layout>
            </v-card-title>
            <v-card-actions>
                <v-layout>
                    <v-flex xs6 sm4 md3 px-1>
                        <v-menu offset-y>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                color="primary"
                                dark
                                v-on="on"
                                block
                                >
                                <v-icon left>school</v-icon> {{$t('study')}}
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-item :to="{name:'study.speedlearning', params:{cardbox_id}}" :disabled="cards.length === 0">
                                    <v-list-item-action>
                                        <v-icon>speed</v-icon>
                                    </v-list-item-action>
                                    <v-list-item-title>{{$t('speedlearning')}}</v-list-item-title>
                                </v-list-item>

                                <v-divider />

                                <v-list-item :to="{name:'study.meaning', params:{cardbox_id}}" :disabled="cards.length === 0">
                                    <v-list-item-action>
                                        <v-icon>swap_horiz</v-icon>
                                    </v-list-item-action>
                                    <v-list-item-title>{{$t('study_meaning')}}</v-list-item-title>
                                </v-list-item>
                                <v-list-item :to="{name:'study.spelling', params:{cardbox_id}}" :disabled="cards.length === 0">
                                    <v-list-item-action>
                                        <v-icon>border_color</v-icon>
                                    </v-list-item-action>
                                    <v-list-item-title>{{$t('study_spelling')}}</v-list-item-title>
                                </v-list-item>
                                <v-list-item :to="{name:'study.test_front', params:{cardbox_id}}" :disabled="cards.length === 0">
                                    <v-list-item-action>
                                        <v-icon>playlist_add_check</v-icon>
                                    </v-list-item-action>
                                    <v-list-item-title>{{$t('vocabulary_test')}}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-flex>
                    <v-flex xs6 sm8 md9 px-1 class="text-right">
                        <v-menu offset-y >
                            <template v-slot:activator="{ on }">
                                <v-btn v-on="on">
                                    <v-icon :left="$vuetify.breakpoint.smAndUp">print</v-icon>
                                    <span v-if="$vuetify.breakpoint.smAndUp">{{$t('additional_functions')}}</span>
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-item :to="{name: 'print.test', params: { cardbox_id}}">
                                    <v-list-item-action>
                                        <v-icon>playlist_add_check</v-icon>
                                    </v-list-item-action>
                                    <v-list-item-title>{{$t('print_vocabulary_test')}}</v-list-item-title>
                                </v-list-item>
                                <v-list-item :to="{name: 'print.list', params: { cardbox_id}}">
                                    <v-list-item-action>
                                        <v-icon>list</v-icon>
                                    </v-list-item-action>
                                    <v-list-item-title>{{$t('print_vocabulary_list')}}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-flex>
                </v-layout>
            </v-card-actions>
        </v-card>

        <CardList :cards="cards" toolbar :cardbox="cardbox" v-if="cardbox !== null && 'cards' in cardbox" />

        <CramfireLoadingIndicator v-if="cardbox !== null && 'cards' in cardbox === false" :height="200" />

        <v-dialog v-model="show_share_dialog" :max-width="500" content-class="mx-1" v-if="cardbox !== null">
            <v-card>
                <v-card-title class="headline pb-1">{{$t('share_dialog.title')}}</v-card-title>
                <v-card-text class="pt-0">
                    <p>{{$t('share_dialog.info')}}</p>
                    
                    <div class="subheading font-weight-bold">Link zum Teilen:</div>
                    <v-text-field :readonly="true" 
                                v-if="cardbox.share_token !== null" 
                                :value="share_link"
                                class="pt-0 mt-0"
                                :disabled="!is_shared"
                                ref="share_link_input">
                        <template v-slot:append>
                            <v-btn icon @click="copyShareLink">
                                <v-icon :color="share_link_copied ? 'primary' : ''">file_copy</v-icon>
                            </v-btn>
                        </template>
                    </v-text-field>

                    <div class="success--text text-center mb-1" v-if="is_shared">
                            {{$t('share_dialog.link_is_enabled')}}
                    </div>
                    <div class="error--text text-center mb-1" v-if="!is_shared && share_link !== null">
                        {{$t('share_dialog.link_is_disabled')}}
                    </div>

                    <div class="text-center">
                        <v-btn color="primary" 
                               v-if="cardbox.share_token === null"
                               @click="setShare(true)"
                               :loading="loading_share"
                               :disabled="loading_share">
                            <v-icon left>link</v-icon>
                            {{$t('share_dialog.create_link')}}
                        </v-btn>
                        <v-btn color="error"
                               v-if="cardbox.share_token !== null && is_shared"
                               @click="setShare(false)"
                               :loading="loading_share"
                               :disabled="loading_share">
                            <v-icon left>link</v-icon>
                            {{$t('share_dialog.disable_link')}}
                        </v-btn>
                        <v-btn color="success" 
                               v-if="cardbox.share_token !== null && is_shared === false"
                               @click="setShare(true)"
                               :loading="loading_share"
                               :disabled="loading_share">
                            <v-icon left>link</v-icon>
                            {{$t('share_dialog.enable_link')}}
                        </v-btn>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />

                    <v-btn text @click="show_share_dialog = false">
                        <v-icon left>close</v-icon> {{$t('global.button.close')}}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import ApiErrorMessage from "../components/ApiErrorMessage"
import CramfireLoadingIndicator from '../components/CramfireLoadingIndicator'
import CardList from "../components/CardList"
import LearningStatus from "../components/LearningStatus"

export default {
    components: {
        ApiErrorMessage,
        CramfireLoadingIndicator,
        CardList,
        LearningStatus
    },

    data(){
        return {
            error: false,
            loading: true,
            favorite_loading: false,
            show_new_card_dialog: false,
            show_share_dialog: false,
            loading_share: false,
            share_link_copied: false,
            fab: false,
        }
    },

    mounted(){

        if( this.cardbox !== null )
        {
            this.loading = false;
        }

        this.loadCardbox(); // Auf jeden fall updaten
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
            return this.$store.getters['language/languageById'](this.cardbox.front_language);
        },

        back_language(){
            return this.$store.getters['language/languageById'](this.cardbox.back_language);
        },

        is_shared(){
            return 'share_token' in this.cardbox  
                    && this.cardbox.share_token !== null
                    && this.cardbox.share_token.active === true;
        },

        last_learned_date(){
            if( this.cardbox.learning_status.last_learned === 0 )
            {
                return '';
            }

            var date = new Date(this.cardbox.learning_status.last_learned * 1000);

            var full_date = [
                (date.getDate() < 10 ? '0' : '') + date.getDate(),
                ((date.getMonth()+1) < 10 ? '0' : '') + (date.getMonth()+1),
                date.getFullYear()
            ];

            return full_date.join('.');
        },

        share_link(){
            if( this.cardbox === null 
                || 'share_token' in this.cardbox === false
                || this.cardbox.share_token === null )
            {
                return null;
            }

            return window.location.origin + '/share/' + this.cardbox.share_token.token;
        },

        is_premium(){
            return this.$store.getters['account/isPremium'];
        },
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
         
        handleFavoriteClick(){
            var data = {
                cardbox_id: this.cardbox_id,
                favorite: !this.cardbox.favorite
            };

            this.favorite_loading = true;

            this.$store.dispatch('cardbox/setFavorite', data)
                       .then(() => {
                           this.error = false;
                           this.favorite_loading = false;
                        })
                       .catch((error) => {
                           this.error = error;
                           this.favorite_loading = false;
                       });
        },

        setShare(active){
            this.loading_share = true;

            this.$store.dispatch('cardbox/shareCardbox', {
                cardbox_id: this.cardbox_id,
                active
            }).then(() => {
                this.loading_share = false;
            }).catch(() => {
                this.loading_share = false;
            });
        },

        copyShareLink(){
            this.$nextTick(() => {
                var input = this.$refs.share_link_input.$el.querySelector('input[type=text]');
                input.select();
                input.setSelectionRange(0, 99999); /*For mobile devices*/

                document.execCommand("copy");

                this.share_link_copied = true;

                setTimeout(() => this.share_link_copied = false, 1000);
            })
        },

        gotoLearningStatus(){
            this.$router.push({name:'cardbox.learning_status', params:{
                cardbox_id: this.cardbox_id
            }});
        }
    }
}
</script>

<i18n>
{
    "de": {
        "share": "Teilen",
        "favorite": "Favorit",
        "edit_cardbox": "Bearbeiten",
        "learning_status": "Lernstand",
        "study": "Lernen",
        "study_meaning": "Bedeutung lernen",
        "study_spelling": "Schreibweise lernen",
        "vocabulary_test": "Vokabeltest",
        "speedlearning": "Schnelllernen",
        "additional_functions": "Drucken",
        "print_vocabulary_test": "Vokabeltest drucken",
        "print_vocabulary_list": "Vokabelliste drucken",

        "share_dialog": {
            "title": "Karteikasten teilen",
            "info": "Du kannst deinen Karteikasten einfach und bequem per Link mit anderen Teilen.",
            "create_link": "Link erstellen",
            "enable_link": "Link aktivieren",
            "disable_link": "Link deaktivieren",
            "link_is_enabled": "Der Link ist aktiv und kann verwendet werden.",
            "link_is_disabled": "Der Link ist deaktiviert und muss erst wieder aktiviert werden, um ihn verwenden zu können."
        }
    }
}
</i18n>