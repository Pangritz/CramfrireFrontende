<template>
    <div class="specialchars-keyboard">
        <div class="d-flex">
            <button type="button" class="ma-0 px-1 special-key" @click="show_uppercase = !show_uppercase">
                <v-icon>{{ show_uppercase ? 'arrow_downward' : 'arrow_upward'}}</v-icon>
            </button>

            <button type="button" class="ma-0 px-1 char-key" 
                    v-for="(char, index) in current_chars_buttons" 
                    :key="index" 
                    @click="handleCharSelect(char)">{{char}}</button>
            
            <button type="button" class="ma-0 px-1 special-key" @click="show_dialog = true" v-if="show_more_button">
                <v-icon>more_vert</v-icon>
            </button>
        </div>

        <v-dialog v-model="show_dialog" max-width="500">
            <v-card class="specialchars-keyboard-dialog">
                <v-card-text class="px-0">
                    <v-layout wrap>
                        <v-flex xs3 sm2 d-flex justify-center v-for="char in additional_char_buttons" :key="char">
                            <button type="button" class="pa-6 char-key" @click="handleCharSelect(char)">{{char}}</button>
                        </v-flex>
                    </v-layout>
                </v-card-text>
                <v-card-actions>
                    <v-btn icon @click="show_uppercase = !show_uppercase">
                        <v-icon>{{ show_uppercase ? 'arrow_downward' : 'arrow_upward'}}</v-icon>
                    </v-btn>
                    <v-spacer />
                    <v-btn text @click="show_dialog = false">
                        <v-icon left>close</v-icon>
                        {{$t('global.button.close')}}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {

    props: {
        lowercase_chars: {
            required: true,
            type: [Array, String]
        },

        uppercase_chars: {
            type: [Array, String]
        }, 

        size: {
            type: Number,
            default: 5
        },

        sm_size: { type: Number, default: 8 },
        md_size: { type: Number, default: 10 },
        lg_size: { type: Number, default: 12 },
    },
    
    data() {
        return {
            show_uppercase: false,
            show_dialog: false
        }
    },

    watch: {
        show_uppercase(new_value){
            if( new_value )
            {
                this.$emit('showUppercase');
            }
            else
            {
                this.$emit('showLowercase');
            }
        }
    },

    computed: {
        current_size(){
            if( this.$vuetify.breakpoint.xs )
            {
                return this.size;
            }
            else if( this.$vuetify.breakpoint.sm && this.sm_size !== 0 )
            {
                return this.sm_size;
            }
            else if( this.$vuetify.breakpoint.md && this.md_size !== 0 )
            {
                return this.md_size;
            }
            else if( this.$vuetify.breakpoint.lg && this.lg_size !== 0 )
            {
                return this.lg_size;                
            }
            
            return this.size;
        },

        current_chars_buttons(){
            var current_chars = []; 

            if( this.show_uppercase )
            {
                current_chars = typeof this.uppercase_chars === 'string' ? this.uppercase_chars.split('') : this.uppercase_chars;
            }
            else 
            {
                current_chars = typeof this.lowercase_chars === 'string' ? this.lowercase_chars.split('') : this.lowercase_chars;
            }

            return current_chars.slice(0, this.current_size);
        },

        additional_char_buttons(){
            var current_chars = []; 

            if( this.show_uppercase )
            {
                current_chars = typeof this.uppercase_chars === 'string' ? this.uppercase_chars.split('') : this.uppercase_chars;
            }
            else 
            {
                current_chars = typeof this.lowercase_chars === 'string' ? this.lowercase_chars.split('') : this.lowercase_chars;
            }

            return current_chars.slice(this.current_size);
        },

        show_more_button(){
            if( this.show_uppercase && this.uppercase_chars.length > this.current_size )
            {
                return true;
            }

            if( this.show_uppercase === false && this.lowercase_chars.length > this.current_size )
            {
                return true;
            }

            return false;    
        }
    },

    mounted(){
        window.addEventListener('keydown', this.handleWindowKeyDown);
        window.addEventListener('keyup', this.handleWindowKeyUp);
    },

    destroyed(){
        window.removeEventListener('keydown', this.handleWindowKeyDown);
        window.removeEventListener('keyup', this.handleWindowKeyUp);
    },

    methods: {
        handleWindowKeyDown(event){
            var key = event.which || event.keyCode;

            if( key === 20 )
            {
                // CapsLock / Feststelltaste gedrückt
                this.show_uppercase = !event.getModifierState('CapsLock');
            }

            if( event.shiftKey || key === 16 )
            {
                // Shift gedrückt
                this.show_uppercase = true;
            }
        },

        handleWindowKeyUp(event){
            var key = event.which || event.keyCode;

            if( key === 16 && event.getModifierState('CapsLock') === false )
            {
                // SHift losgelassen und CapsLock ist nicht aktiv 
                this.show_uppercase = false;
            }
        },

        handleCharSelect(char){
            this.show_dialog = false;
            this.$emit('charSelected', char);
        },

    }
}
</script>

<style lang="scss">
.specialchars-keyboard{

    .char-key { font-size: 18px; color: #000; }

    .special-key { flex: 0 0 5% !important; color: #000; }
}

.specialchars-keyboard-dialog {

    .char-key { font-size: 18px; color: #000; }
}

.theme--dark {
    .specialchars-keyboard .char-key,
    .specialchars-keyboard-dialog .char-key { color: #fff; }
}
</style>
