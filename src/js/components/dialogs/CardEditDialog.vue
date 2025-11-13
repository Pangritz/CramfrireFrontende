<template>
    <v-dialog v-model="show_dialog" max-width="1000" content-class="ma-1">
        <v-card>
            <v-card-title class="pb-0">
                <h1 class="title grey--text">{{$t('dialog_title')}}</h1>
                
                <v-btn icon absolute right @click.stop="show_dialog = false">
                    <v-icon>close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text class="px-0 py-0">
                <CardEditForm :card="card" ref="card_edit_form" @saved="show_dialog = false" />
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import CardEditForm from "../forms/CardEditForm"

export default {

    components: {
        CardEditForm
    },
    
    props: {
        value: {
            required: true,
            type: Boolean
        },

        card: {
            required: true,
            type: Object
        }
    },

    watch: {
        value(new_value){
            if( new_value === true )
            {
                this.$nextTick(() => this.$refs.card_edit_form.setFocusToFront());
            }
        },
    },

    computed: {
        show_dialog: {
            get(){ return this.value;},
            set(value){ this.$emit('input', value); }
        }
    }

}
</script>

<i18n>
{
    "de": {
        "dialog_title": "Karte bearbeiten"
    }
}
</i18n>