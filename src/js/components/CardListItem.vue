<template> 
    <v-card class="mb-3" :class="card_classes" hover 
            @click="handleCardClick" 
            @mousedown="handleCardMouseDown"
            @mouseup="handleCardMouseUp"
            @touchstart="handleCardMouseDown"
            @touchend="handleCardMouseUp">
        <v-layout wrap>
            <v-flex xs12 pt-1 px-1 d-flex>
                <v-flex xs6>
                    <v-icon v-if="edit_mode">
                        {{ is_selected ? 'check_box' : 'check_box_outline_blank'}}
                    </v-icon>
                </v-flex>
                <v-flex xs6 text-right v-if="type !== 'simple'">
                    <v-btn small text icon @click="handleEditClick">
                        <v-icon small>edit</v-icon>
                    </v-btn>
                    <v-btn small text icon @click="handleDeleteClick">
                        <v-icon small>delete</v-icon>
                    </v-btn>
                </v-flex>
            </v-flex>
            <v-flex xs12 px-2 pb-6 pt-1>
                <v-layout wrap>
                    <v-flex xs12 sm5 order-sm1 class="multiline-text">{{card.front}}</v-flex>
                    <v-flex xs12 sm5 order-sm4 grey--text class="multiline-text">{{front_info_excerpt}}</v-flex>

                    <v-flex xs12 sm1 offset-sm1 order-sm2 my-2>
                        <v-divider :vertical="!$vuetify.breakpoint.xs" />
                    </v-flex>

                    <v-flex xs12 sm5 order-sm3 class="multiline-text">{{card.back}}</v-flex>
                    <v-flex xs12 sm5 offset-sm2 order-sm6 grey--text class="multiline-text">{{back_info_excerpt}}</v-flex>
                </v-layout>
            </v-flex>
        </v-layout> 
    </v-card>
</template>

<script>

export default {
    props: {
        card: {
            required: true,
            type: Object
        },

        is_selected: {
            default: false,
            type: Boolean
        },

        edit_mode: {
            default: false,
            type: Boolean
        },

        type: {
            default: "normal",
            type: String
        }
    },

    data(){
        return {
            expanded: false,
            excerpt_length: 25,

            longtap_timeout: null,
        }
    },

    computed: { 
        card_classes(){
            return this.is_selected ? "is--selected" : "";
        },

        front_info_excerpt(){
            if( this.expanded === false 
                && this.card.front_info !== null
                && this.card.front_info.length > this.excerpt_length )
            {
                return this.card.front_info.substr(0, this.excerpt_length) + '...';
            }

            return this.card.front_info;
        },

        back_info_excerpt(){
            if( this.expanded === false 
                && this.card.back_info !== null
                && this.card.back_info.length > this.excerpt_length )
            {
                return this.card.back_info.substr(0, this.excerpt_length) + '...';
            }

            return this.card.back_info;
        }
    },

    methods: {
        selectCard(){
            this.$emit('select', this.card);
        },

        unselectCard(){
            this.$emit('unselect', this.card);
        },

        toggleCardSelection()
        {
            if( this.is_selected )
            {
                this.unselectCard();
            }
            else
            {
                this.selectCard();
            }
        },

        handleCardClick(){
            if( this.edit_mode === false )
            {
                this.expanded = !this.expanded;
            }

            if( this.edit_mode )
            {
                this.toggleCardSelection();
            }
        },

        handleCardMouseDown(){
            if( this.longtap_timeout === null)
            {
                this.longtap_timeout = setTimeout(this.triggerLongTap, 1000);
            }
        },

        handleCardMouseUp(){ 
            clearTimeout(this.longtap_timeout);
            this.longtap_timeout = null;
        },

        triggerLongTap(){
            this.$emit('longtap', this.card);
        },

        handleEditClick(){
            this.$emit('editClick', this.card);
        },

        handleDeleteClick(){
            this.$emit('deleteClick', this.card);
        },
    }
}
</script>
