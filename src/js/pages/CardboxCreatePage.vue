<template>
<div>
    <ApiErrorMessage :error="error" v-if="error !== false" />

    <CramfireLoadingIndicator v-if="loading" />

    <v-layout v-if="!loading">
        <v-flex xs12 md8 offset-md2>
            <PageTitle :text="$t('title')" />

            <v-form ref="create_form" @submit="handleSubmit">
                <v-text-field :label="$t('label.name')" 
                              :rules="[rules.required, rules.maxLength(50)]"
                              v-model="create_form.name"
                              solo
                              class="mb-6" />

                <v-textarea :label="$t('label.description')" 
                            :rules="[rules.maxLength(255)]"
                            v-model="create_form.description"
                            solo 
                            auto-grow
                            class="mb-6" />

                <v-layout wrap>
                    <v-flex xs12 sm5>
                        <LanguageSelect solo
                                  :label="$t('label.front_language')"
                                  :rules="[rules.required]" 
                                  v-model="create_form.front_language"
                                  :languages="languages_list"
                                  :used_languages="used_languages_list"
                                  :loading="languages_loading"
                                  class="mb-6" />
                    </v-flex>

                    <v-flex xs12 sm5 offset-sm2>
                        <LanguageSelect solo
                                  :label="$t('label.back_language')"
                                  :rules="[rules.required]" 
                                  v-model="create_form.back_language"
                                  :languages="languages_list"
                                  :used_languages="used_languages_list"
                                  :loading="languages_loading" />
                    </v-flex>

                    <v-flex xs12 sm12 offset-sm1 class="text-right">
                        <v-btn color="primary"
                               :disabled="create_loading"
                               :loading="create_loading"
                               type="submit"
                        >{{$t('label.submit')}}</v-btn>
                    </v-flex>
                </v-layout>

            </v-form>
        </v-flex>
    </v-layout>
</div>

</template>

<script>
import CramfireLoadingIndicator from "../components/CramfireLoadingIndicator"
import ApiErrorMessage from "../components/ApiErrorMessage"
import rules from "../validation_rules"
import LanguageSelect from "../components/LanguageSelect"
import PageTitle from "../components/PageTitle"

export default {
    components: {
        ApiErrorMessage,
        CramfireLoadingIndicator,
        LanguageSelect,
        PageTitle,
    },

    data(){
        return {
            error: false,
            loading: false,
            languages_loading: false,
            rules,

            create_loading: false, // Ajax Request Status zum erstellen/anlegen des Karteikastens
            create_form: {
                name: '',
                description: '',
                front_language: null,
                back_language: null
            }
        }
    },

    mounted(){
        if( this.$store.getters['language/allLanguagesLoaded'] === false )
        {
            this.loadAllLanguages();
        }
    },

    computed: {
        languages_list(){
            return this.$store.getters['language/allLoadedLanguagesAsList'];
        },

        used_languages_list(){
            return this.$store.getters['language/allUsedLanguagesAsList'];
        }
    },

    methods: {
        loadAllLanguages(){
            this.languages_loading = true;

            this.$store.dispatch('language/loadAllLanguages')
                       .then(() => {
                           this.loading = false;
                           this.error = false;
                           this.languages_loading = false;
                        })
                       .catch((error) => {
                           this.error = error;
                           this.loading = false;
                       });
        },

        handleSubmit(event){
            event.preventDefault();

            if( this.$refs.create_form.validate() === false )
            {
                // Formular nicht einmal richtig ausgefüllt...
                return;
            }

            this.create_loading = true;

            this.$store.dispatch('cardbox/create', {
                name: this.create_form.name,
                description: this.create_form.description,
                front_language_id: this.create_form.front_language,
                back_language_id: this.create_form.back_language,
            })
            .then((cardbox) => {
                this.$router.push({ 
                    name:'cardbox.show', 
                    params: {
                        cardbox_id: cardbox.id
                    }
                });
            })
            .catch((error) => {
                this.create_loading = false;
                this.error = error;
            });
        }
    }
}
</script>

<i18n>
{
    "de": {
        "title": "Neuer Karteikasten",
        "label": {
            "name": "Name",
            "description": "Beschreibung",
            "front_language": "Sprache der Vorderseite",
            "back_language": "Sprache der Rückseite",
            "submit": "Erstellen"
        }
    }    
}
</i18n>