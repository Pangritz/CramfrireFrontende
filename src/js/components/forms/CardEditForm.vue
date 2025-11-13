<template>
<div>

<ApiErrorMessage :error="error" v-if="error !== false" />

<v-form v-if="card" class="pa-2" @submit="handleSubmit" ref="edit_form"> 
    <v-layout wrap>
        <v-flex xs12>
            <CardInput v-model="edit_form" 
                       ref="card_input"
                       :tabindex="1"
                       :front_language="front_language"
                       :back_language="back_language" />
        </v-flex>

        <v-flex xs12 d-flex class="align-center justify-end text-right">
            <v-btn ref="submit"
                   color="primary" 
                   type="submit" 
                   tabindex="5"
                   :loading="loading" 
                   :disabled="loading" 
                   text>{{$t('submit')}}</v-btn>
        </v-flex>
    </v-layout>    
</v-form>   
</div> 
</template>

<script>
import ApiErrorMessage from "../ApiErrorMessage"
import rules from "../../validation_rules"
import CardInput from "../CardInput"

export default {
    props: {
        card: {
            required: true,
            type: Object
        }
    },

    components: {
        ApiErrorMessage,
        CardInput
    },

    data(){
        return {
            loading: false,
            error: false,
            rules,

            edit_form: {
                front: null,
                back: null,
                front_info: null,
                back_info: null,
            }
        }
    },

    watch: {
        card(new_value){
            if( new_value !== null )
            {
                this.setEditFormData();
            }
        }
    },

    created(){
        this.setEditFormData();
    },

    computed: {
        cardbox(){
            return this.$store.getters['cardbox/cardboxById'](this.card.cardbox_id);
        },

        front_language(){
            return this.$store.getters['language/languageById'](this.cardbox.front_language);
        },

        back_language(){
            return this.$store.getters['language/languageById'](this.cardbox.back_language);
        },
    },

    methods: {
        handleSubmit(event){
            event.preventDefault();

            if( this.$refs.edit_form.validate() === false )
            {
                // Formular nicht einmal richtig ausgefüllt...
                return;
            }

            // Alle Strings trimmen, weil das auf dem Server auch passieren wird
            // und der Vuex State auf dem gleichen Stand wie der Server sein sollte
            for(var field in this.edit_form)
            {
                if( typeof this.edit_form[field] === "string" )
                {
                    this.edit_form[field] = this.edit_form[field].trim();
                }
            }

            this.loading = true;

            this.$store.dispatch('cardbox/editCard', {
                id: this.card.id,
                cardbox_id: this.card.cardbox_id,
                front: this.edit_form.front,
                back: this.edit_form.back,
                front_info: this.edit_form.front_info,
                back_info: this.edit_form.back_info,
            })
            .then(() => {
                this.loading = false;
                this.error = false;

                this.$emit('saved');
            })
            .catch((error) => {
                this.error = error;
                this.loading = false;
            });
        },

        setEditFormData(){
            this.edit_form.front = this.card.front;
            this.edit_form.front_info = this.card.front_info;
            this.edit_form.back = this.card.back;
            this.edit_form.back_info = this.card.back_info;
        },

        clearForm(){
            this.$refs.create_form.reset();
        },

        setFocusToFront(){
            this.$nextTick(() => this.$refs.card_input.setFocusOnFront());
        },
    }
}
</script>

<i18n>
{
    "de": {
        "submit": "Ändern"
    }
}
</i18n>