<template>
<div>
    <PageTitle :text="$t('page_title')" icon="all_inbox" class="position-relative">
        <v-btn right absolute color="primary" :to="{name:'cardbox.create'}"
               v-if="$vuetify.breakpoint.smAndUp">
            <v-icon :left="$vuetify.breakpoint.mdAndUp">add</v-icon>
            <span v-if="$vuetify.breakpoint.mdAndUp">{{$t('add_cardbox')}}</span>
        </v-btn>
    </PageTitle>  

    <ApiErrorMessage :error="error" v-if="error" />
    
    <CramfireLoadingIndicator v-if="loading && !error" />  
    
    <CardboxList v-if="!loading && user_has_cardboxes" :cardboxes="cardboxes" :cardboxes_per_page="20" />
    
    <div class="text-center" v-if="!loading && user_has_cardboxes">
        <v-btn color="primary" :to="{name:'cardbox.create'}"
               v-if="$vuetify.breakpoint.xs"
               fab fixed right bottom ripple>
            <v-icon>add</v-icon>
        </v-btn>

        <v-btn color="primary" 
               :to="{name:'cardbox.create'}">
            <v-icon left>add</v-icon>
            {{$t('add_cardbox')}}
        </v-btn>
    </div>

    <NoCardboxesHint v-if="!loading && !error && user_has_cardboxes === false" />
</div>
</template>

<script>
import CramfireLoadingIndicator from "../components/CramfireLoadingIndicator"
import CardboxList from '../components/CardboxList'
import PageTitle from "../components/PageTitle"
import NoCardboxesHint from "../components/NoCardboxesHint"

export default {
    components: {
        CramfireLoadingIndicator,
        CardboxList,
        PageTitle,
        NoCardboxesHint,
    },

    data(){
        return {
            loading: true,
            error: false,
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
        "page_title": "Meine Karteikästen",
        "add_cardbox": "Neuer Karteikasten"
    }
}
</i18n>