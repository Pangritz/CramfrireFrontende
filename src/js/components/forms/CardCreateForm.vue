<template>
<div>

<ApiErrorMessage :error="error" v-if="error !== false" />

<v-form v-if="cardbox" class="pa-2" @submit="handleSubmit" ref="create_form"> 
    <v-layout wrap>
        <v-flex xs12>
            <CardInput v-model="create_form" 
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
        cardbox: {
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

            create_form: {
                front: null,
                back: null,
                front_info: null,
                back_info: null,
            }
        }
    },

    computed: {
        front_language(){
            return this.$store.getters['language/languageById'](this.cardbox.front_language);
        },

        back_language(){
            return this.$store.getters['language/languageById'](this.cardbox.back_language);
        },

        front_label(){
            return this.$t('global.languages.'+this.front_language.shortcode);
        },

        back_label(){
            return this.$t('global.languages.'+this.back_language.shortcode);
        }
    },

    methods: {
        handleSubmit(event){
            event.preventDefault();

            if( this.$refs.create_form.validate() === false )
            {
                // Formular nicht einmal richtig ausgefüllt...
                return;
            }
            
            // Alle Strings trimmen, weil das auf dem Server auch passieren wird
            // und der Vuex State auf dem gleichen Stand wie der Server sein sollte
            for(var field in this.create_form)
            {
                if( typeof this.create_form[field] === "string" )
                {
                    this.create_form[field] = this.create_form[field].trim();
                }
            }

            this.loading = true;

            this.$store.dispatch('cardbox/createCard', {
                cardbox_id: this.cardbox.id,
                front: this.create_form.front,
                back: this.create_form.back,
                front_info: this.create_form.front_info,
                back_info: this.create_form.back_info,
            })
            .then(() => {
                this.loading = false;
                this.error = false;

                this.clearForm();
                this.setFocusToFront();
            })
            .catch((error) => {
                this.error = error;
                this.loading = false;
            });
        },

        clearForm(){
            this.create_form.front = null;
            this.create_form.back = null;
            this.create_form.front_info = null;
            this.create_form.back_info = null;
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
        "submit": "Erstellen"
    }
}
</i18n>