<template>
<div>
    <PageTitle :text="$t('page_title')" icon="school" v-if="study_type === null" />  

    <ApiErrorMessage :error="error" v-if="error" />
    
    <CramfireLoadingIndicator v-if="loading && !error" />  

    <v-layout wrap justify-center v-if="user_has_cardboxes && study_type === null">
        <v-flex xs12 sm6 md4 px-1 text-center>
            <v-menu offset-y>
                <template v-slot:activator="{ on }">
                    <v-btn
                        color="primary"
                        v-on="on"
                        block
                        :disabled="selected_cardboxes.length === 0"
                    >
                        <v-icon left>school</v-icon> {{$t('study')}}
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item :disabled="selected_cardboxes.length === 0"
                                 :to="{name:'learning.start', params: { study_type: 'speedlearning'}}">
                        <v-list-item-action>
                            <v-icon>speed</v-icon>
                        </v-list-item-action>
                        <v-list-item-title>{{$t('study_speedlearning')}}</v-list-item-title>
                    </v-list-item>
                    
                    <v-divider />

                    <v-list-item :disabled="selected_cardboxes.length === 0"
                                 :to="{name:'learning.start', params: { study_type: 'meaning'}}">
                        <v-list-item-action>
                            <v-icon>swap_horiz</v-icon>
                        </v-list-item-action>
                        <v-list-item-title>{{$t('study_meaning')}}</v-list-item-title>
                    </v-list-item>
                    <v-list-item :disabled="selected_cardboxes.length === 0"
                                 :to="{name:'learning.start', params: { study_type: 'spelling'}}">
                        <v-list-item-action>
                            <v-icon>border_color</v-icon>
                        </v-list-item-action>
                        <v-list-item-title>{{$t('study_spelling')}}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-flex>
        <v-flex xs12 text-center grey--text darken-1 pt-3>
            {{$t( selected_cardboxes.length === 0 ? 'select_cardboxes_hint' : 'selected_cardboxes', [selected_cardboxes.length])}}
        </v-flex>
        <v-flex xs12 mt-6>
            <CardboxSelectList v-if="!loading" :cardboxes="cardboxes" v-model="selected_cardboxes" :cardboxes_per_page="20" />
        </v-flex>
    </v-layout>

    <NoCardboxesHint v-if="!loading && !error && user_has_cardboxes === false" />
    
    <StudyMeaningPage :cardbox_ids="selected_cardboxes" v-if="study_type === 'meaning'" />
    <StudySpellingPage :cardbox_ids="selected_cardboxes" v-if="study_type === 'spelling'" />
    <StudySpeedlearningPage :cardbox_ids="selected_cardboxes" v-if="study_type === 'speedlearning'" />
</div>
</template>

<script>
import ApiErrorMessage from "../components/ApiErrorMessage"
import CramfireLoadingIndicator from "../components/CramfireLoadingIndicator"
import CardboxSelectList from "../components/CardboxSelectList"
import StudyMeaningPage from "./StudyMeaningPage"
import StudySpellingPage from "./StudySpellingPage"
import StudySpeedlearningPage from "./StudySpeedlearningPage"
import PageTitle from "../components/PageTitle"
import NoCardboxesHint from "../components/NoCardboxesHint"

export default {
    components: {
        ApiErrorMessage,
        CramfireLoadingIndicator,
        CardboxSelectList,
        StudyMeaningPage,
        StudySpellingPage,
        StudySpeedlearningPage,
        PageTitle,
        NoCardboxesHint,
    },

    data(){
        return {
            loading: false,
            error: false,

            selected_cardboxes: [],
        }
    },

    mounted(){
        if( this.user_has_cardboxes )
        {
            this.loading = false;
        }

        this.loadCardboxes(); // auf jeden Fall updaten
    },

    computed: {
        user_has_cardboxes(){
            return this.$store.getters['cardbox/user_has_cardboxes'];
        },

        cardboxes(){
            return this.$store.getters['cardbox/user_cardboxes'];
        },

        study_type(){
            if( 'study_type' in this.$route.params === false )
            {
                return null;
            }

            return this.$route.params.study_type;
        }
    },

    watch: {
        study_type(new_value, old_value){
            if( old_value !== null && new_value === null)
            {
                this.loadCardboxes();
            }
        }
    },

    methods: {
        loadCardboxes(){
            this.$store.dispatch('cardbox/loadCardboxesOfUser')
                       .then(() => {
                           this.error = false;
                           this.loading = false;
                       })
                       .catch((error) => {
                           this.error = error;
                           this.loading = false;
                       });
        }
    }
}
</script>

<i18n>
{
    "de": {
        "page_title": "Lernen",

        "add_cardbox": "Karteikasten erstellen",

        "study": "Lernen",
        "study_meaning": "Bedeutung lernen",
        "study_spelling": "Schreibweise lernen",
        "study_speedlearning": "Schnelllernen",
        "vocabulary_test": "Vokabeltest",

        "select_cardboxes_hint": "Bitte wähle einen oder mehrere Karteikästen, die du lernen möchtest.",
        "selected_cardboxes": "Du hast {0} Karteikästen ausgewählt."
    }
}
</i18n>