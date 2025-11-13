<template>
<div>
    <PageTitle :text="$t('page_title')" icon="public" />

    <ApiErrorMessage :error="error" v-if="error" />
    
    <CramfireLoadingIndicator v-if="loading && !error" />  
    
    <CardboxList v-if="!loading" :cardboxes="cardboxes" item_type="PublicCardboxListItem" />
</div>
</template>

<script>
import CramfireLoadingIndicator from "../components/CramfireLoadingIndicator"
import CardboxList from '../components/CardboxList'
import PageTitle from "../components/PageTitle"

export default {
    components: {
        CramfireLoadingIndicator,
        CardboxList,
        PageTitle,
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

        this.loadCardboxes(); // auf jeden Fall updaten
    },

    computed: {
        cardboxes(){
            const cardboxes = [...this.$store.getters['cardbox/publicCardboxes']];
            return cardboxes.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });
        }
    },

    methods: {
        loadCardboxes(){
            this.$store.dispatch('cardbox/loadPublicCardboxes')
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
        "page_title": "Öffentliche Karteikästen"
    }
}
</i18n>