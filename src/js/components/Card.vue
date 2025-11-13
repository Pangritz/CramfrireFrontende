<template>
<div>
    <transition name="card-change" mode="out-in">
        <v-card key="front" :min-height="card_min_height" class="card d-flex justify-center align-center" v-if="show_front">
            <div class="card-language-label grey--text">{{front_language_label}}</div>
            <div class="title text-center multiline-text">
                <div>{{card.front}}</div>
                <div class="grey--text darken-1">{{card.front_info}}</div>
            </div>
        </v-card>
        
        <v-card key="back" :min-height="card_min_height" class="card d-flex justify-center align-center" v-else>
            <div class="card-language-label grey--text">{{back_language_label}}</div>
            <div class="title text-center multiline-text">
                <div>{{card.back}}</div>
                <div class="grey--text darken-1">{{card.back_info}}</div>
            </div>
        </v-card>
    </transition>
</div>
</template>

<script>

export default {
    props: {
        card: {
            required: true,
            type: Object
        },

        show_front: {
            type: Boolean,
            default: true,
        }
    },

    computed: {
        cardbox(){
            return this.$store.getters['cardbox/cardboxById'](this.card.cardbox_id);
        },

        front_language(){
            if( this.cardbox === null ){ return null; }

            return this.$store.getters['language/languageById'](this.cardbox.front_language);
        },

        back_language(){
            if( this.cardbox === null ){ return null; }

            return this.$store.getters['language/languageById'](this.cardbox.back_language);
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
        showFront(){
            this.show_front = true;
        },

        showBack()
        {
            this.show_front = false;
        },

        flipCard()
        {
            this.show_front = !this.show_front;
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

// Transition-Effekt
.card-change-enter-active, .card-change-leave-active {
  transition: opacity .1s;
}

.card-change-enter, .card-change-leave-to {
  opacity: 0;
}
</style>