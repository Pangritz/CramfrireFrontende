<template>
<div>
    <PageTitle :text="$t('page_title')" icon="shopping_cart" />

    <p>
        Hier kannst du weitere Premiumzeit kaufen, um dein Konto wieder für alle Funktionen 
        uneingeschränkt nutzen zu können. Alle Optionen unterscheiden sich einzig und allein darin, 
        wie viel Premiumzeit du auf einmal kaufen möchtest, um einen entsprechenden Rabatt nutzen zu können. 
        
        Dabei handelt es sich um <strong>kein Abonnement</strong> mit automatischer Verlängerung, sondern um einen <strong>Einmalkauf nach dem Prepaid-Prinzip</strong>,
        den du jederzeit nach belieben durchführen kannst, um deinem Konto weitere Premiumzeit gutschreiben lassen zu können.
    </p>

    <div class="text-center">
        <a href="https://www.cramfire.com/widerrufsrecht">Informationen zum Widerrufsrecht</a>
    </div>

    <ApiErrorMessage :error="error" v-if="error !== false && !loading" />

    <CramfireLoadingIndicator v-if="loading" />

    <v-container fluid v-if="!loading && !error">
        <v-row justify="center">
            <v-col cols="12" sm="8" md="4" align-items="stretch">
                <v-card height="100%">
                    <v-card-title class="display-1 justify-center">{{product_one_month.short_name}}</v-card-title>
                    <v-card-text style="height: 150px">
                        <v-divider class="mb-8" />

                        <p class="text-center mb-2">
                            <span class="headline primary--text">
                                {{formatPrice(product_one_month.price)}}</span> / <span>{{formatPrice(product_one_month.price)}} pro Monat
                            </span>
                        </p>

                        <p class="title text-center grey--text mb-2">Kein Preisvorteil</p>

                        <p class="text-center">Preis inkl. MwSt.</p>
                    </v-card-text>
                    <v-card-actions class="justify-center pb-4">
                        <v-btn color="primary" :to="{name:'product', params: {product_id: product_one_month.id}}">
                            <v-icon left>shopping_cart</v-icon>
                            Kaufen
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>

            <v-col cols="12" sm="8" md="4">
                <v-card height="100%">
                    <v-card-title class="display-1 justify-center">{{product_six_months.short_name}}</v-card-title>
                    <v-card-text style="height: 150px">
                        <v-divider class="mb-8" />
                        
                        <p class="text-center mb-2">
                            <span class="headline primary--text">{{formatPrice(product_six_months.price)}}</span> / <span>{{formatPrice(product_six_months.price_per_month)}} pro Monat</span>
                        </p>

                        <p class="title text-center error--text mb-0">
                            {{calcPriceAdvantage(product_six_months.price_per_month, product_one_month.price_per_month)}}% Preisvorteil
                        </p>

                        <p class="caption grey--text text-center mb-2">(im Vergleich zu 1 Monat)</p>

                        <p class="text-center">Preis inkl. MwSt.</p>
                    </v-card-text>
                    <v-card-actions class="justify-center pb-4">
                        <v-btn color="primary" :to="{name:'product', params: {product_id: product_six_months.id}}">
                            <v-icon left>shopping_cart</v-icon>
                            Kaufen
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>

            <v-col cols="12" sm="8" md="4">
                <v-card height="100%">
                    <v-card-title class="display-1 justify-center">{{product_one_year.short_name}}</v-card-title>
                    <v-card-text style="height: 150px">
                        <v-divider class="mb-8" />
                        
                        <p class="text-center mb-2">
                            <span class="headline primary--text">{{formatPrice(product_one_year.price)}}</span> / <span>{{formatPrice(product_one_year.price_per_month)}} pro Monat</span>
                        </p>
                        
                        <p class="title text-center error--text mb-0">
                            {{calcPriceAdvantage(product_one_year.price_per_month, product_one_month.price_per_month)}}% Preisvorteil
                        </p> 

                        <p class="caption grey--text text-center mb-2">(im Vergleich zu 1 Monat)</p>

                        <p class="text-center">Preis inkl. MwSt.</p>
                    </v-card-text>
                    <v-card-actions class="justify-center pb-4">
                        <v-btn color="primary" :to="{name:'product', params: {product_id: product_one_year.id }}">
                            <v-icon left>shopping_cart</v-icon>
                            Kaufen
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>

        </v-row>

        <v-row justify="center">
            <v-col cols="12" md="8">
                <v-card>
                    <v-card-title class="headline">
                        <v-icon left>person_add</v-icon> Cramfire kostenlos nutzen</v-card-title>
                    <v-card-text>
                        Erzähle deinen Freunden und Mitschülern/Mitstudenten von Cramfire und nutze Cramfire teilweise oder komplett kostenlos!
                    </v-card-text>
                    <v-card-actions class="justify-center">
                        <v-btn color="primary" href="https://www.cramfire.com/freunde-werben/" target="_blank">Mehr erfahren</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</div>
</template>

<script>
import PageTitle from "../components/PageTitle"
import ApiErrorMessage from "../components/ApiErrorMessage"
import CramfireLoadingIndicator from "../components/CramfireLoadingIndicator"

export default {
    components: {
        PageTitle,
        ApiErrorMessage,
        CramfireLoadingIndicator
    },

    data(){
        return {
            loading: true,
            error: false,
        }
    },

    created(){
        if( this.$store.getters['product/allProductsLoaded'] === true )
        {
            this.loading = false;
        }
        else
        {
            this.loadAllProducts();
        }
    },

    computed: {
        product_one_month(){
            return this.$store.getters['product/productByItemNumber']('C1M');
        },

        product_six_months(){
            return this.$store.getters['product/productByItemNumber']('C6M');
        },

        product_one_year(){
            return this.$store.getters['product/productByItemNumber']('C1Y');
        },
    },

    methods: {

        loadAllProducts(){
            return this.$store.dispatch('product/loadAllProducts')
                              .then(() => {
                                  this.error = false;
                                  this.loading = false;
                              })
                              .catch((error) => {
                                  this.error = error;
                                  this.loading = false;
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