<template>
<div>
    <v-layout wrap>
        <v-flex mb-6 px-1 xs12 sm6>
            <v-card key="front" :min-height="card_min_height" class="card d-flex justify-center align-center">
                <div class="card-language-label grey--text">{{front_language_label}}</div>
                <div>
                    <div>
                        <v-textarea v-model="front" ref="front" text rows="1" auto-grow class="card-input-textarea"
                                    :tabindex="tabindex" 
                                    :placeholder="$t('front')"
                                    :hint="$t('front_hint')"
                                    :rules="[rules.required, rules.maxLength(255)]"
                                    @focus="focus_on = 'front'" />

                        <SpecialCharsKeyboard :lowercase_chars="front_language.special_chars_lowercase" 
                                          :uppercase_chars="front_language.special_chars_uppercase"
                                          :size="5"
                                          :md_size="10"
                                          @charSelected="(char) => handleSpecialCharSelected('front', char)"
                                          v-if="front_language.has_special_chars && focus_on == 'front'" />  
                    </div>
                    <div>
                        <v-textarea v-model="front_info" text rows="1" auto-grow class="card-input-textarea infotext"
                                    :tabindex="tabindex+1"
                                    :placeholder="$t('front_info')" 
                                    :hint="$t('infotext_hint')"
                                    :rules="[rules.maxLength(255)]"
                                    ref="front_info"
                                    @focus="focus_on = 'front_info'" />

                        <SpecialCharsKeyboard :lowercase_chars="front_language.special_chars_lowercase" 
                                          :uppercase_chars="front_language.special_chars_uppercase"
                                          :size="5"
                                          :md_size="10"
                                          @charSelected="(char) => handleSpecialCharSelected('front_info', char)"
                                          v-if="front_language.has_special_chars && focus_on == 'front_info'" />
                    </div>
                </div>
            </v-card>
        </v-flex>

        <v-flex mb-6 px-1 xs12 sm6>
            <v-card key="back" :min-height="card_min_height" class="card d-flex justify-center align-center">
                <div class="card-language-label grey--text">{{back_language_label}}</div>
                <div>
                    <div>
                        <v-textarea v-model="back" text rows="1" auto-grow class="card-input-textarea"
                                    :tabindex="tabindex+2"
                                    :placeholder="$t('back')"
                                    :hint="$t('back_hint')"
                                    :rules="[rules.required, rules.maxLength(255)]"
                                    ref="back"
                                    @focus="focus_on = 'back'" />

                        <SpecialCharsKeyboard :lowercase_chars="back_language.special_chars_lowercase" 
                                          :uppercase_chars="back_language.special_chars_uppercase"
                                          :size="5"
                                          :md_size="10"
                                          @charSelected="(char) => handleSpecialCharSelected('back', char)"
                                          v-if="back_language.has_special_chars && focus_on == 'back'" /> 
                    </div>
                    <div>
                        <v-textarea v-model="back_info" text rows="1" auto-grow class="card-input-textarea infotext"
                                    :tabindex="tabindex+3"
                                    :placeholder="$t('back_info')" 
                                    :hint="$t('infotext_hint')"
                                    :rules="[rules.maxLength(255)]"
                                    ref="back_info"
                                    @focus="focus_on = 'back_info'" />

                        <SpecialCharsKeyboard :lowercase_chars="back_language.special_chars_lowercase" 
                                          :uppercase_chars="back_language.special_chars_uppercase"
                                          :size="5"
                                          :md_size="10"
                                          @charSelected="(char) => handleSpecialCharSelected('back_info', char)"
                                          v-if="back_language.has_special_chars && focus_on == 'back_info'" />
                    </div>
                </div>
            </v-card>
        </v-flex>
    </v-layout>
</div>
</template>

<script>
import rules from "../validation_rules"
import SpecialCharsKeyboard from "./SpecialCharsKeyboard"

export default {
    
    components: {
        SpecialCharsKeyboard
    },

    props: {
        value: {
            type: Object,
            default: null
        },

        front_language: {
            type: Object,
            default: null
        },

        back_language: {
            type: Object,
            default: null
        },

        tabindex: {
            type: Number,
            default: 1,
        }
    },

    data(){
        return {
            rules,
            focus_on: null
        }
    },

    computed: {
        front: {
            get(){
                return this.value.front;
            },
            set(value){
                var card_values = this.getCardValues();
                card_values.front = value;

                this.$emit('input', card_values);
            }
        },

        front_info: {
            get(){
                return this.value.front_info;
            },
            set(value){
                var card_values = this.getCardValues();
                card_values.front_info = value;

                this.$emit('input', card_values);
            }
        },

        back: {
            get(){
                return this.value.back;
            },
            set(value){
                var card_values = this.getCardValues();
                card_values.back = value;

                this.$emit('input', card_values);
            }
        },

        back_info: {
            get(){
                return this.value.back_info;
            },
            set(value){
                var card_values = this.getCardValues();
                card_values.back_info = value;

                this.$emit('input', card_values);
            }
        },

        front_language_label(){
            if( this.front_language === null ){ return ''; }

            return this.$t('global.languages.'+this.front_language.shortcode);
        },

        back_language_label(){
            if( this.back_language === null ){ return ''; }

            return this.$t('global.languages.'+this.back_language.shortcode);
        },

        card_min_height(){
            if( this.$vuetify.breakpoint.xs )
            {
                return 0; // Keine Mindeshöhe auf kleinen Bildschirmen, um Platz zu sparen
            }
            else
            {
                return 250; // Mindeshöhe auf größeren Bildschirmen, weil es schöner bzw. eher wie eine Karte wirkt
            }
        }
    },

    methods: {
        getCardValues(){
            return {
                front: this.front,
                front_info: this.front_info,
                back: this.back,
                back_info: this.back_info,
            }
        },

        setFocusOnFront()
        {
            this.$refs.front.focus();
        },

        insertChar(input, char, selectionStart, selectionEnd){
            return input.substr(0, selectionStart) + char + input.substr(selectionEnd, input.length);
        },

        handleSpecialCharSelected(key, char){
            var input = this.$refs[key].$el.querySelector('textarea');
            var selectionStart = input.selectionStart,
                selectionEnd   = input.selectionEnd;

            if( this[key] !== null )
            {
                this[key] = this.insertChar(this[key], char, input.selectionStart, input.selectionEnd);
            }
            else
            {
                this[key] = char;
            }

            this.$nextTick(() => {
                this.$refs[key].focus();
                input.selectionStart = selectionEnd+1 - (selectionEnd - selectionStart);
                input.selectionEnd   = selectionEnd+1 - (selectionEnd - selectionStart);
            });
        }
    }

}
</script>

<style lang="scss">

.card { padding-top: 30px; padding-bottom: 20px; }

.card-language-label {
    position: absolute; 
    top: 5px;
    left: 5px;   
}

.card-input-textarea {
    .v-input__slot:before, .v-input__slot:after {
        display: none;
    }

    .v-messages__wrapper { text-align: center; }

    textarea { 
        text-align: center; 
        font-size: 20px;
        line-height: 20px;

        &::-webkit-input-placeholder { color: black !important; }
        &:-moz-input-placeholder { color: black !important; }
        &::-moz-input-placeholder { color: black !important; }
        &:-ms-input-placeholder { color: black !important; }
        &::placeholder { color: black !important; }

        &:focus {
            &::-webkit-input-placeholder { color: transparent !important; }
            &:-moz-input-placeholder { color: transparent !important; }
            &::-moz-input-placeholder { color: transparent !important; }
            &:-ms-input-placeholder { color: transparent !important; }
            &::placeholder { color: transparent !important; }
        }
    }

    &.infotext textarea {
        color: #9E9E9E !important;

        &::-webkit-input-placeholder { color: #9E9E9E !important; }
        &:-moz-input-placeholder { color: #9E9E9E !important; }
        &::-moz-input-placeholder { color: #9E9E9E !important; }
        &:-ms-input-placeholder { color: #9E9E9E !important; }
        &::placeholder { color: #9E9E9E !important; }

        &:focus {
            &::-webkit-input-placeholder { color: transparent !important; }
            &:-moz-input-placeholder { color: transparent !important; }
            &::-moz-input-placeholder { color: transparent !important; }
            &:-ms-input-placeholder { color: transparent !important; }
            &::placeholder { color: transparent !important; }
        }
    }
}
</style>

<i18n>
{
    "de": {
        "front_hint": "Der Inhalt der Vorderseite",
        "back_hint": "Der Inhalt der Rückseite",
        "infotext_hint": "Wird mit angezeigt, aber schriftlich nicht mit abgefragt.",
        "front": "Vorderseite",
        "back": "Rückseite",
        "front_info": "Zusatzinformationen (optional)",
        "back_info": "Zusatzinformationen (optional)"
    }
}
</i18n>