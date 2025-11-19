<template>
<div>
    <PageTitle :text="$t('page_title')" icon="shopping_cart" v-if="product" />

    <CramfireLoadingIndicator v-if="loading" />

    <ApiErrorMessage v-if="error" :error="error" />

    <v-container v-if="!loading && !error">
        <v-row>
            <v-col>
                <v-card>
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12" sm="4" class="text-center">
                                    <h2 class="headline">{{product.short_name}}</h2>
                                </v-col>

                                <v-col cols="12" sm="4" class="text-center">
                                    <p v-if="price_advantage > 0" class="title error--text mb-0">{{price_advantage}}% Preisvorteil</p>
                                    <p v-if="price_advantage === 0" class="title grey--text mb-2">Kein Preisvorteil</p>
                                    <p class="caption grey--text mb-2">(im Vergleich zu 1 Monat)</p>
                                </v-col>

                                <v-col cols="12" sm="4" class="text-center">
                                    <span class="headline primary--text">{{formatPrice(product.price)}}</span> / {{formatPrice(product.price_per_month)}} pro Monat
                                    <p class="text-center mt-2">Preis inkl. MwSt.</p>
                                </v-col>                                
                            </v-row>
                        </v-container>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <h1 class="headline">Zahlungsmethoden</h1>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <v-card height="100%" cXlass="d-flex flex-column justfy-space-between">
                    <v-card-title>
                        <v-icon left>language</v-icon> PayPal
                    </v-card-title>

                    <v-card-text>
                        <strong>Gutschrift</strong> der Premiumzeit erfolgt <strong>sofort</strong> nach erfolgreichem Abschluss des Bezahlvorgangs.
                    </v-card-text>

                    <ApiErrorMessage :error="paypal_error" v-if="paypal_error" />

                    <v-card-actions class="justify-center flex-column">
                        <v-btn color="primary" 
                               :small="$vuetify.breakpoint.xs"
                               :loading="paypal_loading"
                               :disabled="paypal_loading"
                               @click="buyWithPaypal">
                            Mit PayPal bezahlen
                        </v-btn>          
                        <p class="text-center grey--text caption mt-2">
                            Du wirst zu PayPal weitergeleitet. Dort gelten die Datenschutzbestimmungen von PayPal.
                        </p>              
                    </v-card-actions>
                </v-card>
            </v-col>

            <v-col>
                <v-card height="100%" cXlass="d-flex flex-column justfy-space-between">
                    <v-card-title class="flex-nowrap word-break-normal">
                        <v-icon left>account_balance</v-icon> Überweisung (Vorkasse)
                    </v-card-title>

                    <v-card-text>
                        <strong>Gutschrift</strong> der Premiumzeit erfolgt innerhalb von <strong>1-2 Werktagen</strong>, 
                        sobald die Überweisung gebucht wurde.
                    </v-card-text>
                    
                    <v-card-actions class="justify-center flex-column">
                        <v-btn color="primary" :small="$vuetify.breakpoint.xs" @click="show_paymentinfo_dialog = true">
                            Per Vorkasse bezahlen
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
    

    <v-dialog v-model="show_paymentinfo_dialog" max-width="650px" :fullscreen="$vuetify.breakpoint.xs" v-if="!loading && !error">
        <v-card>
            <v-card-title class="flex-nowrap word-break-normal">
                <v-icon left>account_balance</v-icon> Überweisung (Vorkasse)
            </v-card-title>
            <v-card-text>
                <p>
                    Bitte überweise den Betrag mit dem unten stehenden Verwendungszweck an das unten angegebene Konto.
                    Solbald die Überweisung auf unser Konto gebucht wurde, was 1-2 Werktage dauert, schreiben wir Dir die Premiumzeit gut.
                </p>

                <v-container>
                            <v-row>
                                <v-col cols="12" sm="6" class="pb-0 pb-sm-3">Kontoinhaber:</v-col>
                                <v-col cols="12" sm="6" class="black--text">Stefan Pangritz</v-col>
                            </v-row>

                            <v-row>
                                <v-col cols="12" sm="6" class="pb-0 pb-sm-3">Bank:</v-col>
                                <v-col cols="12" sm="6" class="black--text">Kreissparkasse Köln</v-col>
                            </v-row>

                            <v-row>
                                <v-col cols="12" sm="6" class="pb-0 pb-sm-3">IBAN:</v-col>
                                <v-col cols="12" sm="6" class="black--text">DE08 3705 0299 0084 2705 71</v-col>
                            </v-row>

                            <v-row>
                                <v-col cols="12" sm="6" class="pb-0 pb-sm-3">BIC:</v-col>
                                <v-col cols="12" sm="6" class="black--text">COKSDE33XXX</v-col>
                            </v-row>

                            <v-row>
                                <v-col cols="12" sm="6" class="pb-0 pb-sm-3">Betrag:</v-col>
                                <v-col cols="12" sm="6" class="black--text">{{formatPrice(product.price)}}</v-col>
                            </v-row>

                            <v-row>
                                <v-col cols="12" sm="6" class="pb-0 pb-sm-3">Verwendungszweck:</v-col>
                                <v-col cols="12" sm="6" class="black--text">{{bank_reference}}</v-col>
                            </v-row>

                            <v-row>
                                <v-col>
                                    <v-alert color="warning" icon="warning" outlined>
                                        Der Verwendungszweck ist sehr wichtig, damit wir die Überweisung Deinem Konto zuordnen können.
                                    </v-alert>
                                </v-col>
                            </v-row>
                        </v-container>

            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn text @click="show_paymentinfo_dialog = false">
                    <v-icon left>close</v-icon> {{$t('global.button.close')}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</div>
</template>

<script>
import PageTitle from "../components/PageTitle"
import ApiErrorMessage from "../components/ApiErrorMessage"
import CramfireLoadingIndicator from "../components/CramfireLoadingIndicator"
import http from "../http"
import {handleApiError} from "../structs/ApiError"

export default {
    components: {
        PageTitle,
        ApiErrorMessage,
        CramfireLoadingIndicator,
    },   

    data(){
        return {
            loading: true,
            error: false,

            paypal_loading: false,
            paypal_error: false,

            show_paymentinfo_dialog: false,
        };
    },

    created(){
        if( this.$store.getters['product/allProductsLoaded'] )
        {
            this.loading = false;
        }

        this.loadAllProducts();
    },

    computed: {
        product(){
            return this.$store.getters['product/productById'](this.$route.params.product_id);
        },

        product_one_month(){
            return this.$store.getters['product/productByItemNumber']('C1M');
        },

        price_advantage(){
            return this.calcPriceAdvantage(this.product.price_per_month, this.product_one_month.price_per_month);
        },

        user_public_id(){
            return this.$store.getters['account/loggedInUser'].public_id;
        },

        bank_reference(){
            if( this.product === null ){ return null; }

            return this.product.item_number + ' ' + this.user_public_id;
        }
    },

    methods: {
        loadAllProducts(){
            this.$store.dispatch('product/loadAllProducts')
                       .then(() => {
                           this.loading = false;
                           this.error = false;
                       })
                       .catch((error) => {
                           this.loading = false;
                           this.error = error;
                       });
        },

        formatPrice(price){
            price = price.toString().replace('.', ',');

            if( price.indexOf(',') === (price.length - 2) )
            {
                // das Komma ist an vorletzter Stelle, also nur eine Ziffer nach dem Komma z.B. 3,5
                price += '0';
            }

            return price + '€';
        },

        calcPriceAdvantage(product_price, base_price){
            return 100 - Math.round( (product_price / base_price) * 100 );
        },

        buyWithPaypal(){
            this.paypal_loading = true;
            this.paypal_error   = false; 

            http.get(`${process.env.VUE_APP_API_BASE_URL}/paypal/buy/${this.product.id}`)
                .then((response) => {
                    this.paypal_error = false;

                    // paypal_loading wird nicht auf false gesetzt, damit
                    // der Loading Indictor des Buttons auch während der Weiterleitung angezeigt wird,
                    // für den Fall, dass die Weiterleitung etwas länger dauert

                    // zu Paypal weiterleiten
                    window.location = response.data.data.approve_url;
                })
                .catch(handleApiError)
                .catch((error) => {
                    this.paypal_error = error;
                    this.paypal_loading = false;
                });
        }
    }
}
</script>

<i18n>
{
    "de": {
        "page_title": "Premiumzeit kaufen"
    }
}
</i18n>