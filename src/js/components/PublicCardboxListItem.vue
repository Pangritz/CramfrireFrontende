<template>
    <v-card :to="{name:'share.cardbox', params: {token: cardbox.share_token.token}}">
        <CardboxFavoriteBadge v-if="cardbox.favorite" />

        <v-layout wrap px-6 py-6>
            <v-flex xs12 d-flex justify-center align-center>
                <v-layout wrap>
                    <v-flex xs9 sm9 md10 class="subheading">{{cardbox.name}}</v-flex>
                    <v-flex xs3 sm3 md2 px-0 grey--text d-flex justify-end align-center :pr-8="$vuetify.breakpoint.smAndUp">
                        {{cardbox.cards_count}} <v-icon class="ml-1 flex-grow-0">web_asset</v-icon>
                    </v-flex>
                </v-layout>
            </v-flex>
        </v-layout>
    </v-card>
</template>

<script>

export default {
    props: ['cardbox'],
}

</script>

<i18n>
{
    "de": {
        "cards": "Karten"
    }
}
</i18n>