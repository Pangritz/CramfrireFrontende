<template>
<v-container fluid px-0 pt-0>
    <v-tabs fixed-tabs 
            show-arrows 
            background-color="transparent"
            v-model="selected_tab"
            v-if="$vuetify.breakpoint.smAndUp && cardboxes.length > 0 "
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
          v-if="!$vuetify.breakpoint.smAndUp && cardboxes.length > 0 "
    ></v-select>

    <v-layout py-6 wrap v-if="cardboxes.length > 0">
        <v-flex xs12 mb-3 v-for="cardbox in current_cardboxes" :key="cardbox.id">
            <CardboxSelectListItem :cardbox="cardbox"
                                   :is_selected="isSelected(cardbox.id)"
                                   @click="handleClick(cardbox.id)" />
        </v-flex>

        <v-flex xs12>
            <div class="text-center" v-if="page_count > 1">
                <v-pagination v-model="current_page" :length="page_count" @input="scrollToTop" />
            </div>
        </v-flex>

        <v-flex xs12>
            <v-alert
                :value="!cardboxes || cardboxes.length === 0"
                color="info"
                icon="info"
                outlined
                class="mt-6"
            >{{$t('no_cardboxes_found')}}</v-alert>
        </v-flex>
    </v-layout>
</v-container>
</template>

<script>
import CardboxSelectListItem from "./CardboxSelectListItem"

export default {
    components: {
        CardboxSelectListItem
    },

    props: {
        value: {
            default: () => [],
            type: Array,
        },

        cardboxes: {
            default: () => [],
            type: Array
        },

        cardboxes_per_page: {
            default: 20,
            type: Number
        },
    },

    data(){
        return {
            selected_language: 0,

            current_page: 1,
        };
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

    computed: {
        selected_cardboxes: {
            get(){ return this.value; },
            set(value){ this.$emit('input', value); }
        },

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
        handleClick(cardbox_id){
            if( this.isSelected(cardbox_id) )
            {
                this.unselect(cardbox_id);
            }
            else
            {
                this.select(cardbox_id);
            }
        },

        select(cardbox_id){
            this.selected_cardboxes.push(cardbox_id);
        },

        unselect(cardbox_id){
            var index = this.selected_cardboxes.indexOf(cardbox_id);

            this.selected_cardboxes.splice(index, 1);
        },

        isSelected(cardbox_id){
            return this.selected_cardboxes.indexOf(cardbox_id) !== -1;
        },

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