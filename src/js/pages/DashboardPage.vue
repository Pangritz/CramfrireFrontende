<template>
<v-layout wrap>
    <v-flex xs12>
        <PageTitle :text="$t('page_title')" icon="dashboard" />
    </v-flex>

    <v-flex xs12 sm8 md8 lg9 :pr-6="!$vuetify.breakpoint.xs" v-if="user_has_cardboxes">
        <div class="headline">{{$t('last_learned_title')}}</div>
        <CramfireLoadingIndicator v-if="loading" />  

        <CardboxList v-if="!loading" :cardboxes="last_learned_cardboxes" 
                                     :show_filter="false" 
                                     :empty_list_message="$t('no_last_learned_cardboxes_message')" />
    </v-flex>

    <v-flex xs8 offset-xs2 sm4 offset-sm0 md4 lg3 xl2 offset-xl1 pb-6 :pl-6="!$vuetify.breakpoint.xs" v-if="user_has_cardboxes">
        <div class="headline text-center mb-2">{{$t('activity_points_title')}}</div>
        <ActivityPointsChart :show_legend="false" />
    </v-flex>
    
    <v-flex xs12 v-if="user_has_cardboxes">
        <div class="headline">{{$t('cardboxes_title')}}</div>
        <CardboxList v-if="!loading" :cardboxes="cardboxes" :cardboxes_per_page="10" />
    </v-flex>

    <v-flex xs12>
        <ApiErrorMessage :error="error" v-if="error !== false" />

        <NoCardboxesHint v-if="!loading && !error && !user_has_cardboxes" />
    </v-flex>
</v-layout>
</template>

<script>
import CramfireLoadingIndicator from "../components/CramfireLoadingIndicator"
import CardboxList from '../components/CardboxList'
import ActivityPointsChart from "../components/charts/ActivityPointsChart"
import PageTitle from "../components/PageTitle"
import ApiErrorMessage from "../components/ApiErrorMessage"
import NoCardboxesHint from "../components/NoCardboxesHint"

export default {
    components: {
        CramfireLoadingIndicator,
        CardboxList,
        ActivityPointsChart,
        PageTitle,
        NoCardboxesHint,
        ApiErrorMessage,
    },

    data(){
        return {
            loading: true,
            error: false,
        }
    },

    mounted(){
        if( this.cardboxes.length > 0 )
        {
            this.loading = false;
        }
        
        this.loadCardboxes();
    },

    computed: {
        cardboxes(){
            return this.$store.getters['cardbox/user_cardboxes'];
        },

        user_has_cardboxes(){
            return this.$store.getters['cardbox/user_has_cardboxes'];
        },

        last_learned_cardboxes(){
            var cardboxes = this.cardboxes.slice().filter((cardbox) => {
                // Alle Karteikästen rausfiltern, die noch nie gelernt wurden.
                return cardbox.learning_status.last_learned !== 0;
            });

            cardboxes.sort(function(a, b){
                return b.learning_status.last_learned - a.learning_status.last_learned;
            });

            return cardboxes.slice(0, 3);
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
        "page_title": "Übersicht",

        "last_learned_title": "Zuletzt gelernt",
        "no_last_learned_cardboxes_message": "Du hast noch keinen Karteikasten gelernt.",

        "activity_points_title": "Aktivitätspunkte",
        "cardboxes_title": "Meine Karteikästen"
    }
}
</i18n>