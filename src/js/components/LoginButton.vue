<template>
    <v-btn @click="buttonClick">
        {{$t('global.button.login')}}
    </v-btn>
</template>

<script>
export default {
    

    methods: {
        buttonClick(){

            this.$store.dispatch('account/setCheckAuthRoute', this.$route)
                       .then(() => this.$router.push({name: 'account.login'}) );

        }
    }
}
</script>