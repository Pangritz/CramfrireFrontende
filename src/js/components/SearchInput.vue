<template>
    <v-text-field :label="$t('search_label')" 
                  v-model="search_keyword" 
                  prepend-icon="search"
                  @keydown.enter="search">
        <template v-slot:append>
            <v-icon @click="search" v-if="search_keyword.trim().length > 2">send</v-icon>
        </template>
    </v-text-field>
</template>

<script>
export default {

    data(){
        return {
            search_keyword: '',
        }
    },

    methods: {
        search(){
            if( this.search_keyword.trim().length < 3 ){ return; } // Suchbegriff noch zu kurz

            this.$router.push({
                name: 'search',
                params: {
                    keyword: this.search_keyword
                }
            });
            
            this.search_keyword = '';
        },
    }
}
</script>

<i18n>
{
    "de": {
        "search_label": "Suche"
    }
}
</i18n>