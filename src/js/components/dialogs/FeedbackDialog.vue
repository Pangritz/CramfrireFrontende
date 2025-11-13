<template>

    <v-dialog v-model="show_dialog"  max-width="750">
        <v-card>
            <v-card-title class="headline pb-0">{{$t('title')}}</v-card-title>
            <v-card-text>
                <p>{{$t('info')}}</p>   

                <ApiErrorMessage :error="error" v-if="error !== false && !loading" />     
                
                <v-alert :value="success" color="success" outlined class="my-2">{{$t('success')}}</v-alert>  

                <v-textarea :label="$t('message_label')" 
                            :rules="[rules.minLength(10), rules.maxLength(2000)]"
                            auto-grow
                            validate-on-blur
                            counter="2000"
                            v-model="message"
                            :disabled="success" />
            </v-card-text>
            <v-card-actions>
                <v-btn @click="show_dialog = false" text>
                    <v-icon left>close</v-icon> {{$t('global.button.close')}}
                </v-btn>
                <v-spacer></v-spacer>
                
                <v-btn color="primary"  
                       @click="handleSubmit" 
                       :loading="loading"
                       :disabled="loading || !valid || success">{{$t('submit')}}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

</template>

<script>
import rules from "../../validation_rules"
import ApiErrorMessage from "../ApiErrorMessage"
import { handleApiError } from '../../structs/ApiError';
import http from "../../http"

export default {

    components: {
        ApiErrorMessage
    },

    props: {
        value: {
            required: true,
            type: Boolean
        }
    },
    
    data(){
        return {
            rules,
            loading: false,
            error: false,
            success: false,
            message: '',
        }
    },

    watch: {
        show_dialog(new_value, old_value){
            if( new_value === true && old_value === false )
            {
                this.loading = false;
                this.error   = false;
                this.success = false;
                this.message = '';
            }
        }
    },

    computed: {
        show_dialog: {
            get(){ return this.value; },

            set(value) { this.$emit('input', value); }
        },

        valid(){
            return this.message.length >= 10 && this.message.length <= 2000;
        }
    },

    methods: {
        handleSubmit(){
            this.loading = true;

            var data = {
                message: this.message,
                current_route: this.$router.currentRoute.fullPath,                
            };

            http.post(`${process.env.VUE_APP_API_BASE_URL}/feedback`, data)
                .then(() => {
                    this.loading = false;
                    this.error   = false;
                    this.success = true;
                })
                .catch(handleApiError)
                .catch((error) => {
                    this.loading = false;
                    this.error   = error;
                    this.success = false;
                });
        }
    }

}
</script>

<i18n>
{
    "de": {
        "title": "Feedback",
        "info": "Wie findest du Cramfire? Hast du einen Fehler entdeckt oder hast du Vorschläge, wie wir Cramfire weiter verbessern könnten? Dann lass es uns wissen!",

        "message_label": "Nachricht",

        "submit": "Abschicken",

        "success": "Vielen Dank für dein Feedback!"
    }
}
</i18n>