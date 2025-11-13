<template>
    <v-text-field :label="label"
                  :hint="hint"
                  persistent-hint
                  type="number"
                  v-model="inputValue"
                  class="number-input"
                  ref="number_input"
                  :class="'align-input-' + alignInput">
        <template v-slot:prepend-inner>
            <v-btn icon @click="handleSub">
                <v-icon>remove</v-icon>
            </v-btn>
        </template>
        <template v-slot:append>
            <v-btn icon @click="handleAdd">
                <v-icon>add</v-icon>
            </v-btn>
        </template>
    </v-text-field>
</template>

<script>

export default {
    
    props: {
        value: {
            type: Number
        },

        label: {
            type: String,
            default: null,
        },

        hint: {
            type: String,
            default: null
        },

        min: {
            type: Number,
            default: 0
        },

        max: {
            type: Number,
            default: 9999,
        },

        step: {
            type: Number, 
            default: 1
        },

        alignInput: {
            type: String,
            default: 'center',
            validator: function(value){
                return ['left', 'right', 'center'].indexOf(value) !== -1;
            }
        },
    },

    computed: {
        inputValue: {
            set(value){
                value = parseInt(value, 10);

                if( isNaN(value) )
                {
                    value = this.min;
                }

                if( value > this.max )
                {
                    value = this.max;
                }

                if( value < this.min )
                {
                    value = this.min;
                }

                this.$emit('input', value);
            },

            get(){
                return this.value;
            }
        }
    },

    methods: {
        handleSub(){
            this.inputValue -= this.step;
        },

        handleAdd(){
            this.inputValue += this.step;
        },
    },

}

</script>

<style>
.number-input.align-input-center .v-text-field__slot input { text-align: center; }
.number-input.align-input-left .v-text-field__slot input { text-align: left; }
.number-input.align-input-right .v-text-field__slot input { text-align: right; }
</style>