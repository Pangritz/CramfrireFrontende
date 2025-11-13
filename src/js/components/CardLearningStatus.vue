<template> 
    <v-card class="mb-6" hover>
        <v-layout wrap>
            <v-flex xs12 px-2 py-6>
                <v-layout wrap>
                    <v-flex xs12 sm5 d-flex align-center>
                        <v-layout wrap>
                            <v-flex xs6 md6 px-2 py-6>{{front_excerpt}}</v-flex>
                            <v-flex xs6 md6 px-2 py-6>{{back_excerpt}}</v-flex>
                        </v-layout>
                    </v-flex>

                    <v-flex xs12 sm1 offset-sm1 my-2>
                        <v-divider :vertical="!$vuetify.breakpoint.xs" />
                    </v-flex>

                    <v-flex xs12 sm5 d-flex align-center>
                        <v-layout wrap>
                            <v-flex px-2 py-6>
                                <span class="grey--text">{{$t('meaning')}}:</span> 
                                <span class="font-weight-bold" :class="meaning_class">{{meaning_difficulty}}</span>
                            </v-flex>
                            <v-flex px-2 py-6>
                                <span class="grey--text">{{$t('spelling')}}:</span> 
                                <span class="font-weight-bold" :class="spelling_class">{{spelling_difficulty}}</span>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                </v-layout>
            </v-flex>
        </v-layout> 
    </v-card>
</template>

<script>
export default {
    props: {
        front: {
            required: true,
            type: String
        },

        back: {
            required: true,
            type: String
        },

        learning_status: {
            required: true
        }
    },

    computed: {
        front_excerpt(){
            if( this.front.length > 20 )
            {
                return this.front.substr(0, 20) + '...';
            }

            return this.front;
        },

        back_excerpt(){
            if( this.back.length > 20 )
            {
                return this.back.substr(0, 20) + '...';
            }

            return this.back;
        },

        meaning_difficulty(){
            if( this.learning_status === null || this.learning_status.meaning_status === -1 )
            {
                return this.$t('not_seen');
            }
            else if( this.learning_status.meaning_difficulty < 50 )
            {
                return this.$t('hard');
            }
            else if( this.learning_status.meaning_difficulty < 90 )
            {
                return this.$t('medium');
            }

            return this.$t('easy');
        },

        meaning_class(){
            if( this.learning_status === null || this.learning_status.meaning_status === -1 )
            {
                return 'grey--text';
            }
            else if( this.learning_status.meaning_difficulty < 50 )
            {
                return 'error--text';
            }
            else if( this.learning_status.meaning_difficulty < 90 )
            {
                return 'warning--text';
            }
                
            return 'success--text';
        },

        spelling_difficulty(){
            if( this.learning_status === null || this.learning_status.spelling_status === -1 )
            {
                return this.$t('not_seen');
            }
            else if( this.learning_status.spelling_difficulty < 50 )
            {
                return this.$t('hard');
            }
            else if( this.learning_status.spelling_difficulty < 90 )
            {
                return this.$t('medium');
            }

            return this.$t('easy');
        },

        spelling_class(){
            if( this.learning_status === null || this.learning_status.spelling_status === -1 )
            {
                return 'grey--text';
            }
            else if( this.learning_status.spelling_difficulty < 50 )
            {
                return 'error--text';
            }
            else if( this.learning_status.spelling_difficulty < 90 )
            {
                return 'warning--text';
            }
                
            return 'success--text';
        },
    }
    
}
</script>

<i18n>
{
    "de": {
        "meaning": "Bedeutung",
        "spelling": "Schreibweise",

        "easy": "leicht",
        "medium": "mittel",
        "hard": "schwer",

        "not_seen": "-"
    }
}
</i18n>