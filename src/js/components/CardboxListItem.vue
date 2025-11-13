<template>
    <v-card :to="{name:'cardbox.show', params: {cardbox_id: cardbox.id}}">
        <CardboxFavoriteBadge v-if="cardbox.favorite" />

        <v-layout wrap px-6 py-6>
            <v-flex xs12 sm9 d-flex justify-center align-center>
                <v-layout wrap>
                    <v-flex xs9 class="subheading">{{cardbox.name}}</v-flex>
                    <v-flex xs3 px-0 grey--text d-flex justify-end align-center :pr-8="$vuetify.breakpoint.smAndUp">
                            {{cardbox.cards_count}} <v-icon class="ml-1 flex-grow-0">web_asset</v-icon>
                    </v-flex>
                </v-layout>
            </v-flex>

            <v-flex xs12 sm3 :pt-3="$vuetify.breakpoint.xs" d-flex justify-center align-center>
                <LearningStatus :known="cardbox.learning_status.known" :unknown="cardbox.learning_status.unknown" :height="$vuetify.breakpoint.xs ? 15 : 20" />
            </v-flex>
        </v-layout>
    </v-card>
</template>

<script>
import CardboxFavoriteBadge from "./CardboxFavoriteBadge"
import LearningStatus from "./LearningStatus"

export default {
    props: ['cardbox'],
    
    components: {
        CardboxFavoriteBadge,
        LearningStatus
    },

}

</script>