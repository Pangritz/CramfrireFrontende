<template>
<v-container fluid px-0 pt-0>
    <v-tabs fixed-tabs 
            show-arrows 
            background-color="transparent"
            v-model="selected_tab"
            v-if="show_filter && $vuetify.breakpoint.smAndUp && cardboxes.length > 0 "
            ref="language_tabs">
        <v-tab v-for="language in cardbox_languages" :key="language.id">
            {{language.name}}
        </v-tab>
    </v-tabs>

    <v-select
          v-model="selected_language"
          persistent-hint
          :items="cardbox_languages"
          item-text="name"
          item-value="id"
          single-line
          ref="language_select"
          v-if="show_filter && !$vuetify.breakpoint.smAndUp && cardboxes.length > 0 "
    ></v-select>

    <v-layout pt-6 wrap v-if="cardboxes.length > 0">
        <v-flex xs12 mb-3 v-for="cardbox in current_cardboxes" :key="cardbox.id">
            <component :is="item_type" :cardbox="cardbox" />
        </v-flex>

        <v-flex xs12>
            <div class="text-center" v-if="page_count > 1">
                <v-pagination v-model="current_page" :length="page_count" @input="scrollToTop" />
            </div>
        </v-flex>
    </v-layout>

    <v-alert
      :value="!cardboxes || cardboxes.length === 0"
      color="info"
      icon="info"
      outlined
      class="mt-6"
    >{{ empty_list_message !== null ? empty_list_message : $t('no_cardboxes_found')}}</v-alert>
</v-container>
</template>

<script>
import CardboxListItem from './CardboxListItem'
import PublicCardboxListItem from './PublicCardboxListItem'

export default {
    props: {
        cardboxes: {
            type: Array
        },

        show_filter: {
            default: true,
            type: Boolean
        },

        item_type: {
            default: 'CardboxListItem',
            type: String
        }, 

        empty_list_message: {
            default: null, 
            type: String
        },

        cardboxes_per_page: {
            default: 20,
            type: Number
        },
    },

    components: {
        CardboxListItem,
        PublicCardboxListItem,
    },

    mounted(){
        // Vuetify Bugfix: Die Position des Sliders der Sprachauswahl-Tabs updaten, 
        // damit sie möglichst immer korrekt ist
        setTimeout( () => {
            if( this.$refs.language_tabs )
            {
                this.$refs.language_tabs.callSlider();
            }
        }, 200);
    },

    data(){
        return {
            selected_language: 0,
           
            current_page: 1,
        }
    },

    computed: {
        languages(){
            return this.$store.getters['language/allLoadedLanguages'];
        },

        cardbox_languages(){
            var languages = [];

            for(var cardbox_id in this.cardboxes)
            {
                var cardbox = this.cardboxes[cardbox_id];

                if( languages.indexOf(cardbox.front_language) === -1 )
                {
                    languages.push(cardbox.front_language);
                }

                if( languages.indexOf(cardbox.back_language) === -1 )
                {
                    languages.push(cardbox.back_language);
                }
            }

            languages = languages.map((language_id) => {
                var language = this.languages[language_id];
                language.name = this.$t('global.languages.'+language.shortcode);
                return language;
            });

            return [
                // "Alle"
                {
                    name: this.$t('all_languages'),
                    id: 0
                },

                ...languages
            ];
        },

        filtered_cardboxes(){
            if( this.selected_language === 0 )
            {
                // "Alle Sprachen" ausgewählt
                return this.cardboxes;
            }

            return this.cardboxes.filter((cardbox) => {
                return (cardbox.front_language === this.selected_language 
                         || cardbox.back_language === this.selected_language);
            });
        },

        selected_tab: {
            get(){
                for(var i=0; i < this.cardbox_languages.length; i++)
                {
                    if( this.cardbox_languages[i].id === this.selected_language )
                    {
                        return i;
                    }
                }

                return null;
            },

            set(tab_index){
                this.selected_language = this.cardbox_languages[tab_index].id;
                this.current_page = 1;
            }
        },

        current_cardboxes(){
            var index = (this.current_page * this.cardboxes_per_page) - this.cardboxes_per_page;

            return this.filtered_cardboxes.slice(index, index + this.cardboxes_per_page);
        },

        page_count(){
            return Math.ceil(this.filtered_cardboxes.length / this.cardboxes_per_page);
        },
    },

    methods: {
        scrollToTop(){
            if( this.$refs.language_tabs){ this.$refs.language_tabs.$el.scrollIntoView(); }
            if( this.$refs.language_select){ this.$refs.language_select.$el.scrollIntoView(); }
            
            // Damit nichts von der Topbar/Appbar bedeckt wird
            window.scrollBy(0, -70);
        },
    }

}
</script>

<i18n>
{
    "de": {
        "all_languages": "Alle Sprachen",

        "no_cardboxes_found": "Du hast noch keine Karteikästen."
    }
}
</i18n>
