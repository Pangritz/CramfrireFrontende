<template>
<div>
    <PageTitle :text="$t('page_title')" icon="cloud_upload" />

    <v-card class="mb-12">
        <v-card-text>
            <v-layout wrap>
                <v-flex xs12>
                    <ApiErrorMessage :error="error" v-if="error !== false" />
                </v-flex>

                <v-flex xs12 sm8 md4>
                    <p class="heading font-weight-bold">{{$t('label.file')}}</p>
                    <v-input prepend-icon="insert_drive_file" :messages="$t('file_hint')">
                        <input type="file" ref="csv_file">
                    </v-input>
                </v-flex>

                <v-flex xs12 sm4 md3 offset-md1 px-2>
                    <p class="heading font-weight-bold">{{$t('label.delimiter')}}</p>
                    <v-select :items="delimiter_options" 
                              item-key="value" 
                              item-text="name" 
                              v-model="delimiter"
                              class="pa-0" />
                </v-flex>

                <v-flex xs12 sm4 offset-sm8 md3 offset-md1 d-flex justify-center align-center>
                    <v-btn :disabled="csv_data === null || import_loading || delimiter_error"
                           :loading="import_loading"
                           color="primary"
                           @click="importStart">
                           <v-icon left>cloud_upload</v-icon>
                           {{$t('label.import')}}
                    </v-btn>
                </v-flex>
            </v-layout>
        </v-card-text>
    </v-card>

    <CramfireLoadingIndicator v-if="loading" :height="$vuetify.breakpoint.xs ? 100 : 300" />

    <v-alert :value="delimiter_error" color="error" outlined icon="warning">{{$t('delimiter_error')}}</v-alert>

    <h2 class="grey--text mb-1" v-if="csv_data !== null && !delimiter_error">{{$t('preview_title')}} {{$tc('card_count', csv_data.length)}}</h2>

    <div v-if="csv_data !== null && !delimiter_error">
        <CardListItem v-for="(card, index) in csv_data" :key="index" :card="card" type="simple" />
    </div>
    
</div>

</template>

<script>
import CSV from "comma-separated-values"
import ApiErrorMessage from "../components/ApiErrorMessage"
import CramfireLoadingIndicator from "../components/CramfireLoadingIndicator"
import CardListItem from "../components/CardListItem"
import PageTitle from "../components/PageTitle"

export default {
    components: {
        ApiErrorMessage,
        CramfireLoadingIndicator,
        CardListItem,
        PageTitle,
    },

    data(){
        return {
            error: false,
            loading: false,
            import_loading: false,

            delimiter: ';',
            delimiter_error: false,

            delimiter_options: [
                {value:";", name: this.$t('delimiter_option.semicolon')},
                {value:",", name: this.$t('delimiter_option.comma')},
                {value:":", name: this.$t('delimiter_option.colon')},
                {value:"|", name: this.$t('delimiter_option.pipe')},
            ],

            csv_data: null,
            csv_raw: null,
        }
    },

    created(){
        if( this.cardbox === null )
        {
            this.loading = true;
            this.loadCardbox();
        }
    },

    mounted(){
        
        this.$refs.csv_file.addEventListener('change', this.handleCsvFileChange); 
    },

    beforeDestroy(){
        // beforeDestroy verwenden, statt destroyed, weil in destroyed ist das Element nicht mehr vorhanden, 
        // also ref csv_file undefined. Aber auch wenn nicht notwendig, zur Sicherheit den Event-Listener entfernen.
        this.$refs.csv_file.removeEventListener('change', this.handleCsvFileChange);
    },

    watch: {
        delimiter(){
            this.updateCSVData();
        }
    },

    computed: {
        cardbox_id(){
            return this.$route.params.cardbox_id;
        },

        cardbox(){
            return this.$store.getters['cardbox/cardboxById'](this.cardbox_id);
        },

        front_language_label(){
            if( this.cardbox === null ){ return this.$t('label.front'); }

            var language = this.$store.getters['language/languageById'](this.cardbox.front_language);

            return this.$t('global.languages.'+language.shortcode);
        },

        back_language_label(){
            if( this.cardbox === null ){ return this.$t('label.back'); }

            var language = this.$store.getters['language/languageById'](this.cardbox.back_language);

            return this.$t('global.languages.'+language.shortcode);
        }
    },

    methods: {
        loadCardbox(){
            return this.$store.dispatch('cardbox/loadCardbox', this.cardbox_id)
                              .then(() => {
                                  this.error = false;
                                  this.loading = false;
                              })
                              .catch((error) => {
                                  this.error = error;
                                  this.loading = false;
                              });
        },

        updateCSVData(){

            if( this.csv_raw === null )
            {
                return;
            }

            this.delimiter_error = false;
            this.loading = true;

            try {
                var csv = CSV.parse(this.csv_raw, {
                    cellDelimiter: this.delimiter,
                    cast:['String', 'String', 'String', 'String']
                });

                // Richtiges Format bzw. richtiges Trennzeichen?
                if( csv[0].length !== 2 && csv[0].length !== 4 )
                {
                    throw "WRONG_DELIMITER";    
                }
            
                this.csv_data = csv.map(function(row){
                    if( row.length == 2 )
                    {
                        if( row[0] === '' || row[0].trim().length === 0
                            || row[1] === '' || row[1].trim().length === 0 )
                        {
                            throw 'EMPTY_COLUMN';
                        }

                        return {
                            front: row[0],
                            back: row[1],
                            front_info: '',
                            back_info: '',
                        };
                    }
                    else
                    {
                        if( row[0] === '' || row[0].trim().length === 0
                            || row[2] === '' || row[2].trim().length === 0 )
                        {
                            throw 'EMPTY_COLUMN';
                        }

                        return {
                            front: row[0],
                            front_info: row[1],
                            back: row[2],
                            back_info: row[3]
                        };
                    }
                });
            }
            catch(error)
            {
                this.delimiter_error = true;
                this.loading = false;
            }

            this.loading = false;
        },

        handleCsvFileChange(){
            var file = this.$refs.csv_file.files[0];
            var reader = new FileReader();

            reader.onload = () => {
                this.csv_raw = reader.result;

                this.updateCSVData();
                this.loading = false;
            }

            this.loading = true;
            reader.readAsText(file);
        },

        importStart(){
            this.import_loading = true;

            this.$store.dispatch('cardbox/import', {
                cardbox_id: this.cardbox_id,
                csv_data: this.csv_data
            })
            .then(() => {
                this.import_loading = false;
                this.error = false;

                // Daten reseten
                this.csv_data = null;
                this.csv_raw = null;

                this.$router.push({
                    name: 'cardbox.show', 
                    params: {
                        cardbox_id: this.cardbox_id
                    }
                });
            })
            .catch((error) => {
                this.import_loading = false;
                this.error = error;
            });
        }
    }
}
</script>

<i18n>
{
    "de": {
        "page_title": "Karten importieren",
        "preview_title": "Vorschau",

        "card_count": "{count} Karten",

        "label": {
            "front": "Vorderseite",
            "back": "Rückseite",
            "file": "CSV Datei (.csv) mit den Karten",
            "delimiter": "Trennzeichen",
            "import": "Importieren"
        },

        "file_hint": "Es müssen genau zwei oder vier Spalten vorhanden sein.",

        "delimiter_option": {
            "semicolon": "; Semikolon",
            "comma": ", Komma",
            "colon": ": Doppelpunkt",
            "pipe": "| Verkettungszeichen"
        },

        "delimiter_error": "Entweder hat die von dir ausgewählte CSV Datei weder zwei noch vier Spalten oder du hast nicht das passende Trennzeichen ausgewählt."
    }    
}
</i18n>