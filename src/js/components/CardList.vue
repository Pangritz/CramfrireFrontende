<template>

<div>
    <v-toolbar class="elevation-0 toolbar-content-px-0" color="transparent" v-if="toolbar && !edit_mode">
        <v-toolbar-title>
            {{cards.length}} {{$t('title')}}
            <span class="grey--text body-2" v-if="cardbox !== null && !$vuetify.breakpoint.xs">
                ({{$t('global.languages.'+front_language.shortcode)}} / {{$t('global.languages.'+back_language.shortcode)}})
            </span>
        </v-toolbar-title>

        <v-spacer></v-spacer>
        
        <v-btn text :icon="!$vuetify.breakpoint.mdAndUp"
                    v-if="cardbox !== null"
                    @click.stop="show_create_card_dialog = true">
            <v-icon :left="$vuetify.breakpoint.mdAndUp">add</v-icon>
            <span v-if="$vuetify.breakpoint.mdAndUp">{{$t('add')}}</span>
        </v-btn>

        <v-btn text :icon="!$vuetify.breakpoint.mdAndUp" v-if="cardbox !== null" @click="edit_mode = !edit_mode">
            <v-icon :left="$vuetify.breakpoint.mdAndUp">file_copy</v-icon>
            <span v-if="$vuetify.breakpoint.mdAndUp">{{$t('edit')}}</span>
        </v-btn>   

        <v-btn text :icon="!$vuetify.breakpoint.mdAndUp" v-if="cardbox !== null" @click="swapSides">
            <v-icon :left="$vuetify.breakpoint.mdAndUp">swap_horiz</v-icon>
            <span v-if="$vuetify.breakpoint.mdAndUp">{{$t('swap_sides')}}</span>
        </v-btn>      

        <v-menu offset-y v-if="cardbox !== null">
            <template v-slot:activator="{ on }">
                <v-btn v-on="on" text :icon="!$vuetify.breakpoint.mdAndUp">
                    <v-icon :left="$vuetify.breakpoint.mdAndUp">cloud_upload</v-icon>
                    <span v-if="$vuetify.breakpoint.mdAndUp">{{$t('functions')}}</span>
                </v-btn>
            </template>
            <v-list>
                <v-list-item :to="{name:'cardbox.import', params: {cardbox_id}}">
                    <v-list-item-action>
                        <v-icon>cloud_upload</v-icon>
                    </v-list-item-action>
                    <v-list-item-title>{{$t('import')}}</v-list-item-title>
                </v-list-item>
                <v-list-item :href="cardbox_export_link" download>
                    <v-list-item-action>
                        <v-icon>cloud_download</v-icon>
                    </v-list-item-action>
                    <v-list-item-title>{{$t('export')}}</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-toolbar>

    <v-toolbar class="toolbar-content-px-0 toolbar-title-pl-2 elevation-1 mt-1 mb-3 sticky-top-0 z-index-5" v-if="edit_mode">
        <v-toolbar-title>
            <v-icon @click="selectAll">{{ select_all_mode ? 'check_box_outline_blank' : 'check_box' }}</v-icon>
            {{$tc('edit_mode.selection_count', selected_cards.length)}}
        </v-toolbar-title>
        
        <v-spacer />

        <v-btn text :icon="$vuetify.breakpoint.xs" color="error" @click="show_batchdelete_card_dialog = true" :disabled="selected_cards.length == 0">
            <v-icon :left="!$vuetify.breakpoint.xs">delete</v-icon>    
            <span v-if="!$vuetify.breakpoint.xs">{{$t('edit_mode.delete')}}</span>
        </v-btn>
        <v-btn text :icon="$vuetify.breakpoint.xs" @click="show_batchcopy_card_dialog = true" :disabled="selected_cards.length == 0">
            <v-icon :left="!$vuetify.breakpoint.xs">file_copy</v-icon>
            <span v-if="!$vuetify.breakpoint.xs">{{$t('edit_mode.copy')}}</span>
        </v-btn>
        <v-btn text :icon="$vuetify.breakpoint.xs" @click="show_batchmove_card_dialog = true" :disabled="selected_cards.length == 0">
            <v-icon :left="!$vuetify.breakpoint.xs">move_to_inbox</v-icon>
            <span v-if="!$vuetify.breakpoint.xs">{{$t('edit_mode.move')}}</span>
        </v-btn>
        <v-btn text :icon="$vuetify.breakpoint.xs" @click="edit_mode = false">
            <v-icon :left="!$vuetify.breakpoint.sxsmxsAndDown">close</v-icon>
            <span v-if="!$vuetify.breakpoint.xs">{{$t('edit_mode.cancel')}}</span>
        </v-btn>
    </v-toolbar>

    <CardListItem v-for="card in current_cards" 
                  :key="card.id" 
                  :card="card" 
                  :is_selected="isSelected(card.id)" 
                  :edit_mode="edit_mode"
                  :type="item_type"
                  class="card-list-item"
                  @editClick="handleCardEditClick" 
                  @deleteClick="handleCardDeleteClick"
                  @select="handleCardSelect"
                  @unselect="handleCardUnselect"
                  @longtap="handleCardLongTap" />

    <div class="text-center" v-if="page_count > 1">
        <v-pagination v-model="current_page" :length="page_count" @input="scrollToTop" />
    </div>

    <div v-if="cards.length === 0" class="grey--text text-center">
        {{$t('no_cards_hint')}}
    </div>
    
    <v-dialog v-model="show_create_card_dialog" v-if="cardbox" max-width="1000" content-class="ma-1">
        <v-card>
            <v-card-title class="pb-0">
                <h1 class="title grey--text">
                    {{$t('new_card_dialog_title')}}
                </h1>
                
                <v-btn icon absolute right @click.stop="show_create_card_dialog = false">
                    <v-icon>close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text class="px-0 py-0">
                <CardCreateForm :cardbox="cardbox" ref="card_create_form" />
            </v-card-text>
        </v-card>
    </v-dialog>

    <CardEditDialog v-model="show_edit_card_dialog" :card="edit_card" v-if="edit_card" />

    <v-dialog v-model="show_delete_card_dialog" persistent max-width="290">
        <v-card v-if="delete_card !== null">
            <v-card-title class="headline pb-0">{{$t('card_delete_dialog_title')}}</v-card-title>
            <v-card-text>
                <i18n path="card_delete_dialog_text">
                    <strong>{{delete_card.front.substr(0, 10)}}...</strong>
                </i18n>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red darken-1" text @click="show_delete_card_dialog = false">{{$t('global.button.no')}}</v-btn>
                <v-btn color="green darken-1" text @click="handleDeleteCard">{{$t('global.button.yes')}}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="show_batchdelete_card_dialog" persistent max-width="290">
        <v-card>
            <v-card-title class="headline pb-0">{{$t('card_batchdelete_dialog_title')}}</v-card-title>
            <v-card-text>
                <i18n path="card_batchdelete_dialog_text">
                    <strong>{{selected_cards.length}}</strong>
                </i18n>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red darken-1" text @click="show_batchdelete_card_dialog = false">{{$t('global.button.no')}}</v-btn>
                <v-btn color="green darken-1" text 
                       @click="handleBatchdeleteCard" 
                       :loading="batchdelete_card_loading"
                       :disabled="batchdelete_card_loading">{{$t('global.button.yes')}}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="show_batchmove_card_dialog" persistent max-width="320">
        <v-card>
            <v-card-title class="headline pb-0">{{$t('card_batchmove_dialog_title')}}</v-card-title>
            <v-card-text>
                <i18n path="card_batchmove_dialog_text" tag="p">
                    <strong>{{selected_cards.length}}</strong>
                </i18n>

                <v-select :label="$t('target_cardbox')"
                          :items="cardbox_list_items" 
                          item-text="name"
                          item-value="id"
                          v-model="batch_target_cardbox" />
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red darken-1" text @click="show_batchmove_card_dialog = false">{{$t('global.button.cancel')}}</v-btn>
                <v-btn color="green darken-1" text 
                       @click="handleBatchmoveCard" 
                       :loading="batchmove_card_loading"
                       :disabled="batchmove_card_loading">{{$t('edit_mode.move')}}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="show_batchcopy_card_dialog" persistent max-width="320">
        <v-card>
            <v-card-title class="headline pb-0">{{$t('card_batchcopy_dialog_title')}}</v-card-title>
            <v-card-text>
                <i18n path="card_batchcopy_dialog_text" tag="p">
                    <strong>{{selected_cards.length}}</strong>
                </i18n>
                
                <v-select :label="$t('target_cardbox')"
                          :items="cardbox_list_items" 
                          item-text="name"
                          item-value="id"
                          v-model="batch_target_cardbox" />            
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red darken-1" text @click="show_batchcopy_card_dialog = false">{{$t('global.button.cancel')}}</v-btn>
                <v-btn color="green darken-1" text 
                       @click="handleBatchcopyCard" 
                       :loading="batchcopy_card_loading"
                       :disabled="batchcopy_card_loading">{{$t('edit_mode.copy')}}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    
</div>
    
</template>

<script>
import CardListItem from "./CardListItem"
import CardCreateForm from "./forms/CardCreateForm"
import CardEditDialog from "./dialogs/CardEditDialog"

export default {
    props: {
        toolbar: {
            default: true,
            type: Boolean
        },

        item_type: {
            default: 'normal',
            type: String
        },

        cards: {
            required: true,
            type: Array
        },

        cardbox: {
            type: Object,
            default: null
        }
    },

    components: {
        CardListItem,
        CardCreateForm,
        CardEditDialog
    },

    data(){
        return {
            edit_mode: false,
            selected_cards: [],
            select_all_mode: true,
            batch_target_cardbox: null,

            current_page: 1,
            cards_per_page: 60,

            show_create_card_dialog: false,

            show_edit_card_dialog: false,
            edit_card: null,

            show_delete_card_dialog: false,
            delete_card: null,

            show_batchdelete_card_dialog: false,
            batchdelete_card_loading: false,

            show_batchmove_card_dialog: false,
            batchmove_card_loading: false,
            
            show_batchcopy_card_dialog: false,
            batchcopy_card_loading: false,
        }
    },

    computed: {
        cardbox_id(){
            return this.cardbox.id || null;
        },

        front_language(){
            return this.$store.getters['language/languageById'](this.cardbox.front_language);
        },

        back_language(){
            return this.$store.getters['language/languageById'](this.cardbox.back_language);
        },

        cardbox_export_link(){
            const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;
            return `${API_BASE_URL}/cardbox/${this.cardbox_id}/export?api_token=${this.$store.getters['account/api_token']}`; 
        },

        current_cards(){
            var index = (this.current_page * this.cards_per_page) - this.cards_per_page;

            return this.cards.slice(index, index + this.cards_per_page);
        },

        page_count(){
            return Math.ceil(this.cards.length / this.cards_per_page);
        },
        
        cardbox_list_items(){
            var cardboxes = this.$store.getters['cardbox/user_cardboxes'],
                list = [];

            for(var index in cardboxes)
            {
                // Den aktuellen Karteikasten nicht als Zielauswählbar machen 
                // was das kopieren und verschieben von Karten angeht. Wäre ja auch sinnlos das tun zu wollen.
                if( cardboxes[index].id !== this.cardbox_id )
                {
                    list.push({
                        id: cardboxes[index].id,
                        name: cardboxes[index].name
                    });
                }
            }

            return list;
        },

        all_card_ids(){
            return this.cards.map((card) => {
                return card.id;
            })
        },
    },

    watch: {
        show_create_card_dialog(new_value){
            if( new_value === false )
            {
                this.$refs.card_create_form.clearForm();
            }
            else if( new_value === true )
            {
                this.$nextTick(() => this.$refs.card_create_form.setFocusToFront());
            }
        },

        show_edit_card_dialog(new_value){
            if( new_value === false )
            {
                this.edit_card = null;
            }
        },

        edit_mode(new_value, old_value){
            if( new_value === false && old_value === true )
            {
                // Bearbeitungsmodus wurde verlassen => Liste mit allen ausgewählten Karten leeren
                this.selected_cards = [];
                // Dialoge aus dem Bearbeitungsmodus schließen
                this.show_batchdelete_card_dialog = false;
                this.show_batchmove_card_dialog = false;
                this.show_batchcopy_card_dialog = false;
            }
        },
    },

    methods: {
        isSelected(card_id){
            return this.selected_cards.indexOf(card_id) !== -1;
        },

        selectCard(card_id){
            if( this.selected_cards.indexOf(card_id) === -1 )
            {
                this.selected_cards.push(card_id);
            }
        },

        unselectCard(card_id){
            var index = this.selected_cards.indexOf(card_id);

            if( index !== -1 )
            {
                this.selected_cards.splice(index, 1);
            }
        },

        selectAll(){
            if( this.select_all_mode )
            {
                this.selected_cards = this.all_card_ids;
            }
            else
            {
                this.selected_cards = [];
            }

            this.select_all_mode = !this.select_all_mode;
        },

        handleCardSelect(card){
            this.selectCard(card.id);
        },

        handleCardUnselect(card){
            this.unselectCard(card.id);
        },

        handleCardLongTap(card){
            this.edit_mode = true;
            this.selectCard(card.id);
        },

        handleCardEditClick(card){
            this.edit_card = card;
            this.show_edit_card_dialog = true;
        },

        handleCardDeleteClick(card){
            this.delete_card = card;
            this.show_delete_card_dialog = true;
        },

        handleDeleteCard(){
            this.$store.dispatch('cardbox/deleteCard', this.delete_card);
            this.show_delete_card_dialog = false;
            this.delete_card = null;
        },

        handleBatchdeleteCard(){
            var data = {
                cards: this.selected_cards,
                source_cardbox: this.cardbox_id
            };

            this.$store.dispatch('cardbox/batchCardDelete', data)
                       .then(() => {
                           this.batchdelete_card_loading = false;
                           this.show_batchdelete_card_dialog = false;
                           this.selected_cards = [];

                           if( this.cards.length === 0 )
                           {
                               // Keine Karten mehr vorhanden, also gibt es auch nichts zum löschen, kopieren usw.
                               this.edit_mode = false;
                           }
                       })
                       .catch(() => {
                           this.batchdelete_card_loading = false;
                       });
        },

        handleBatchmoveCard(){
            
            var data = {
                cards: this.selected_cards,
                source_cardbox: this.cardbox_id,
                target_cardbox: this.batch_target_cardbox
            };

            this.$store.dispatch('cardbox/batchCardMove', data)
                       .then(() => {
                           this.batchmove_card_loading = false;
                           this.show_batchmove_card_dialog = false;
                           this.selected_cards = [];
                       })
                       .catch(() => this.batchmove_card_loading = false );
        },

        handleBatchcopyCard(){
            var data = {
                cards: this.selected_cards,
                source_cardbox: this.cardbox_id,
                target_cardbox: this.batch_target_cardbox
            };

            this.$store.dispatch('cardbox/batchCardCopy', data)
                       .then(() => {
                           this.batchmove_card_loading = false;
                           this.show_batchcopy_card_dialog = false;
                           this.selected_cards = [];
                       })
                       .catch(() => this.batchmove_card_loading = false );
        },

        swapSides(){
            this.$store.dispatch('cardbox/swapSides', this.cardbox_id);
        },

        scrollToTop(){
            this.$el.querySelector('.card-list-item').scrollIntoView();
            // Damit nichts von der Topbar/Appbar bedeckt wird
            window.scrollBy(0, -70);
        },
    }

}
</script>

<i18n>
{
    "de": {
        "title": "Karten",
        "add": "Neue Karte",
        "edit": "Verwalten",
        "functions": "Export/Import",
        "import": "Import",
        "export": "Export",
        "swap_sides": "Seiten tauschen",
        "no_cards_hint": "Noch keine Karten vorhanden.",

        "new_card_dialog_title": "Neue Karte",
        "card_delete_dialog_title": "Karte löschen",
        "card_delete_dialog_text": "Soll die Karte {0} wirklich unwiderruflich gelöscht werden?",

        "card_batchdelete_dialog_title": "Karten löschen",
        "card_batchdelete_dialog_text": "Sollen die {0} Karten wirklich unwiderruflich gelöscht werden?",

        "card_batchmove_dialog_title": "Karten verschieben",
        "card_batchmove_dialog_text": "In welchen Karteikasten sollen die {0} Karten verschoben werden?",

        "card_batchcopy_dialog_title": "Karten kopieren",
        "card_batchcopy_dialog_text": "In welchen Karteikasten sollen die {0} Karten kopiert werden?",

        "edit_mode": {
            "selection_count": "({count}) Auswahl",
            "delete": "Löschen",
            "copy": "Kopieren",
            "move": "Verschieben",
            "cancel": "Abbrechen"
        },

        "target_cardbox": "Zielkarteikasten"
    }    
}
</i18n>