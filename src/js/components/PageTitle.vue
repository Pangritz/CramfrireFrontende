<template>
<div class="mb-3 grey--text" :class="{
        'display-1': $vuetify.breakpoint.smAndUp,
        'headline': $vuetify.breakpoint.xs
    }">
    <v-icon :large="$vuetify.breakpoint.smAndUp" left v-if="icon" color="grey" v-text="icon" class="pb-1" />
    {{text}}

    <slot></slot>
</div>
</template>

<script>    
export default {

    props: {
        text: {
            required: true,
            type: String
        },

        icon: {
            default: null,
            type: String
        },
    }
}
</script>