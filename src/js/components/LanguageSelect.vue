<template>
    <v-select v-on="$listeners"
              v-bind="$attrs"
              v-model="select_value"

              :items="languages"
              item-text="name"
              item-value="id"
              ref="language_select">
        <template v-slot:prepend-item>
            <v-list-item v-for="used_language in used_languages" 
                         :key="used_language.id"
                         @click="$refs.language_select.selectItem(used_language)"
                         :class="{'primary--text': select_value === used_language.id}">
                {{used_language.name}}
            </v-list-item>

            <v-divider />
        </template>

        <template v-slot:no-data>
            <span><!-- Entfernt. Es gibt ja einen Hinweis, dass Sprachen geladen werden. --></span>
        </template>

        <template v-slot:append-item>
            <v-list-item class="text-center grey--text" v-if="loading">
                {{$t('languages_loading')}}
            </v-list-item>
        </template>
    </v-select>
</template>

<script>
export default {

    props: {
        value: {
            type: Number,
        },

        // werden noch neue Sprachen geladen?
        loading: {
            type: Boolean
        },

        // Alle Sprachen
        languages: {
            required: true,
            type: Array
        },

        // Die Sprachen, die bereits vom Nutzer verwendet wurden
        used_languages: {
            type: Array
        }
    },

    computed: {
        select_value: {
            get(){ return this.value; },
            set(value){ this.$emit('input', value); }
        },

    },

}
</script>

<i18n>
{
    "de": {
        "languages_loading": "Weitere Sprachen werden geladen..."
    }
}
</i18n>