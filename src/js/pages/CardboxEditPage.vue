<template>
<div>
    <ApiErrorMessage :error="error" v-if="error !== false" />

    <CramfireLoadingIndicator v-if="loading" />

    <v-layout v-if="!loading && cardbox !== null">
        <v-flex xs12 md8 offset-md2>
            <PageTitle :text="$t('title')" />

            <v-form ref="edit_form" @submit="handleSubmit">
                <v-text-field :label="$t('label.name')" 
                              :rules="[rules.required, rules.maxLength(50)]"
                              v-model="edit_form.name"
                              solo
                              class="mb-6" />

                <v-textarea :label="$t('label.description')" 
                            :rules="[rules.maxLength(255)]"
                            v-model="edit_form.description"
                            solo 
                            auto-grow
                            class="mb-6" />

                <v-layout wrap>
                    <v-flex xs12 sm5>
                        <LanguageSelect solo
                                  :label="$t('label.front_language')"
                                  :rules="[rules.required]" 
                                  class="mb-6"
                                  v-model="edit_form.front_language"
                                  :languages="languages_list"
                                  :used_languages="used_languages_list"
                                  :loading="languages_loading" />
                    </v-flex>

                    <v-flex xs12 sm5 offset-sm2>
                        <LanguageSelect solo
                                  :label="$t('label.back_language')"
                                  :rules="[rules.required]" 
                                  v-model="edit_form.back_language"
                                  :languages="languages_list"
                                  :used_languages="used_languages_list"
                                  :loading="languages_loading" />
                    </v-flex>

                    <v-flex xs6>
                        <v-dialog v-model="show_delete_dialog" persistent max-width="290">
                            <template v-slot:activator="{ on }">
                                <v-btn color="error"
                                       :disabled="edit_loading || delete_loading"
                                       :loading="delete_loading"
                                       v-on="on">
                                    <v-icon left>delete</v-icon>
                                    {{$t('label.delete')}}
                                </v-btn>
                            </template>
                            <v-card>
                                <v-card-title class="headline pb-0">Karteikasten löschen</v-card-title>
                                <v-card-text>Soll der Karteikasten <strong>"{{cardbox.name}}"</strong> wirklich unwiderruflich gelöscht werden?</v-card-text>
                                <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="red darken-1" text @click="show_delete_dialog = false">Nein</v-btn>
                                <v-btn color="green darken-1" text @click="handleDelete">Ja</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-flex> 

                    <v-flex xs6 class="text-right">
                        <v-btn color="primary"
                               :disabled="edit_loading || delete_loading"
                               :loading="edit_loading"
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
            loading: true,
            languages_loading: false,
            rules,

            show_delete_dialog: false,
            delete_loading: false, // Ajax Request Status zum löschen des Karteikastens
            edit_loading: false, // Ajax Request Status zum bearbeiten des Karteikastens
            edit_form: {
                name: '',
                description: '',
                front_language: null,
                back_language: null
            }
        }
    },

    mounted(){
        
        if( this.cardbox !== null )
        {
            this.loading = false;
            this.setFormValues();
        }
        else
        {
            this.loadCardbox();
        }

        if( this.$store.getters['language/allLanguagesLoaded'] === false )
        {
            this.loadAllLanguages();
        }
    },

    computed: {
        cardbox_id(){
            return this.$route.params.cardbox_id;
        },

        cardbox(){
            return this.$store.getters['cardbox/cardboxById'](this.cardbox_id);
        },

        languages_list(){
            return this.$store.getters['language/allLoadedLanguagesAsList'];
        },

        used_languages_list(){
            return this.$store.getters['language/allUsedLanguagesAsList'];
        }
    },

    methods: {
        loadCardbox(){
            return this.$store.dispatch('cardbox/loadCardbox', this.cardbox_id)
                              .then(() => {
                                  this.loading = false;
                                  this.error = false;
                                  this.setFormValues();
                              })
                              .catch((error) => {
                                  this.error = error;
                                  this.loading = false;
                              });
        },

        loadAllLanguages(){
            this.languages_loading = true;

            this.$store.dispatch('language/loadAllLanguages')
                       .then(() => {
                           this.error = false;
                           this.languages_loading = false;
                       })
                       .catch((error) => {
                           this.error = error;
                           this.languages_loading = false;
                       });
        },

        setFormValues(){
            this.edit_form.name = this.cardbox.name;
            this.edit_form.description = this.cardbox.description;
            this.edit_form.front_language = this.cardbox.front_language;
            this.edit_form.back_language = this.cardbox.back_language;
        },

        handleSubmit(event){
            event.preventDefault();

            if( this.$refs.edit_form.validate() === false )
            {
                // Formular nicht einmal richtig ausgefüllt...
                return;
            }

            this.edit_loading = true;

            this.$store.dispatch('cardbox/edit', {
                id: this.cardbox_id,
                name: this.edit_form.name,
                description: this.edit_form.description,
                front_language_id: this.edit_form.front_language,
                back_language_id: this.edit_form.back_language,
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
                this.edit_loading = false;
                this.error = error;
            });
        },

        handleDelete(){
            this.delete_loading = true;

            this.$store.dispatch('cardbox/delete', this.cardbox_id)
                       .then(() => {
                            this.$router.push({
                                name: 'cardbox.index'
                            });
                       })
                       .catch((error) => {
                           this.delete_loading = false;
                           this.error = error;
                       });
        }
    }
}
</script>

<i18n>
{
    "de": {
        "title": "Karteikasten bearbeiten",
        "label": {
            "name": "Name",
            "description": "Beschreibung",
            "front_language": "Sprache der Vorderseite",
            "back_language": "Sprache der Rückseite",
            "submit": "Speichern",
            "delete": "Löschen"
        },
        "languages_loading": "Weitere Sprachen werden geladen..."
    }    
}
</i18n>