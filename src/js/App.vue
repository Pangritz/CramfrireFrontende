<template>
    <v-app>

        <v-navigation-drawer
            v-model="drawer_open"
            clipped
            fixed
            app
        >
            <v-list v-if="is_logged_in">
                <v-list-item class="py-2">
                    <SearchInput />
                </v-list-item>

                <v-list-item :to="{name:'dashboard'}" exact>
                    <v-list-item-action class="mr-5">
                        <v-icon>dashboard</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>{{$t('drawer.dashboard')}}</v-list-item-content>
                </v-list-item>

                <v-list-item :to="{name:'learning'}" exact>
                    <v-list-item-action class="mr-5">
                        <v-icon>school</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>{{$t('drawer.study')}}</v-list-item-content>
                </v-list-item>
                
                <v-list-item :to="{name:'cardbox.index'}" exact>
                    <v-list-item-action class="mr-5">
                        <v-icon>all_inbox</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>{{$t('drawer.cardboxes')}}</v-list-item-content>
                </v-list-item>

                <v-list-item :to="{name: 'public_cardboxes'}" exact>
                    <v-list-item-action class="mr-5">
                        <v-icon>public</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>{{$t('drawer.public_cardboxes')}}</v-list-item-content>
                </v-list-item>

                <v-list-item :to="{name: 'activity'}" exact>
                    <v-list-item-action class="mr-5">
                        <v-icon>bar_chart</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>{{$t('drawer.activity')}}</v-list-item-content>
                </v-list-item>

                <v-divider />

                <v-list-item :to="{name: 'settings'}" exact>
                    <v-list-item-action class="mr-5">
                        <v-icon>settings</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>{{$t('drawer.settings')}}</v-list-item-content>
                </v-list-item>

                <v-list-group>
                    <template v-slot:activator>
                        <v-list-item-action class="mr-5">
                            <v-icon>person</v-icon>
                        </v-list-item-action>
                        <v-list-item-content>{{$t('drawer.account')}}</v-list-item-content>
                    </template>

                    <v-list-item :to="{name: 'account'}">
                        <v-list-item-action class="mr-5">
                            <v-icon>edit</v-icon>
                        </v-list-item-action>
                        <v-list-item-content>{{$t('drawer.user_data')}}</v-list-item-content>
                    </v-list-item>                        

                    <v-list-item :to="{name: 'premium.buy'}">
                        <v-list-item-action class="mr-5">
                            <v-icon>shopping_cart</v-icon>
                        </v-list-item-action>
                        <v-list-item-content>{{$t('drawer.buy_premium')}}</v-list-item-content>
                    </v-list-item>

                    <v-list-item :to="{name: 'coupon'}" exact>
                        <v-list-item-action class="mr-5">
                            <v-icon>card_giftcard</v-icon>
                        </v-list-item-action>
                        <v-list-item-content>{{$t('drawer.coupon')}}</v-list-item-content>
                    </v-list-item>

                    <v-list-item :to="{name:'advertiser'}" exact>
                        <v-list-item-action class="mr-5">
                            <v-icon>person_add</v-icon>
                        </v-list-item-action>
                        <v-list-item-content>{{$t('drawer.tell_a_friend')}}</v-list-item-content>
                    </v-list-item>
                    
                </v-list-group>


                <v-list-item @click="feedback_dialog_open = true">
                    <v-list-item-action class="mr-5">
                        <v-icon>feedback</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>{{$t('drawer.feedback')}}</v-list-item-content>
                </v-list-item>

                <v-divider />

                <v-list-item @click.stop="darkmode_on = !darkmode_on">
                    <v-list-item-action class="mr-5">
                        <v-icon v-if="!darkmode_on">brightness_3</v-icon>
                        <v-icon v-else>wb_sunny</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>{{darkmode_on ? $t('drawer.darkmode_is_on') : $t('drawer.darkmode_is_off')}}</v-list-item-content>
                </v-list-item>

                <v-divider />
            
                <v-list-item @click.stop="logout">
                    <v-list-item-action class="mr-5">
                        <v-icon color="error">meeting_room</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>{{$t('drawer.logout')}}</v-list-item-content>
                </v-list-item>
            </v-list>
        
            <v-list v-if="!is_logged_in">
                <v-list-item :to="{name: 'account.login'}">
                    <v-list-item-content>{{$t('drawer.login')}}</v-list-item-content>
                </v-list-item>

                <v-list-item :to="{name: 'account.signup'}">
                    <v-list-item-content>{{$t('drawer.signup')}}</v-list-item-content>
                </v-list-item>

                <v-divider />

                <v-list-item href="https://www.cramfire.com">
                    <v-list-item-content>{{$t('drawer.homepage')}}</v-list-item-content>
                </v-list-item>
                
                <v-list-item href="https://www.cramfire.com/impressum">
                    <v-list-item-content>{{$t('drawer.imprint')}}</v-list-item-content>
                </v-list-item>

                <v-list-item href="https://www.cramfire.com/datenschutz">
                    <v-list-item-content>{{$t('drawer.privacy')}}</v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <RouteLoadingIndicator v-if="route_is_changing" />

        <v-app-bar app fixed clipped-left>
            <v-app-bar-nav-icon @click.stop="drawer_open = !drawer_open">
                
            </v-app-bar-nav-icon>
            <v-avatar size="28px" tile class="ml-2" @click="goHome">
                <img src="/images/Cramfire_logo-2019.svg" width="28px" height="28px" alt="Cramfire Logo">
            </v-avatar>
            <v-toolbar-title class="ml-2" @click="goHome">
                Cramfire
            </v-toolbar-title>

            <v-spacer />

            <v-btn text color="warning" :icon="$vuetify.breakpoint.xs" 
                   v-if="premium_days_left > 1 && premium_days_left <= 7"
                   :to="{name: 'premium.buy'}">
                <v-icon :left="!$vuetify.breakpoint.xs">announcement</v-icon>
                <span v-if="!$vuetify.breakpoint.xs">{{$tc('toolbar.premium_days_left_hint', Math.floor(premium_days_left))}}</span>
            </v-btn>

            <v-btn text color="error" :icon="$vuetify.breakpoint.xs" 
                   v-if="premium_days_left < 1 && is_logged_in"
                   :to="{name: 'premium.buy'}">
                <v-icon :left="!$vuetify.breakpoint.xs">warning</v-icon>
                <span v-if="!$vuetify.breakpoint.xs">
                    {{ premium_days_left === 0 ? $t('toolbar.no_premium_hint') : $t('toolbar.premium_less_one_day_hint')}}
                </span>
            </v-btn>
        </v-app-bar>

        <v-content>
            <v-container>
                <router-view v-if="router_ready" :class="{'pt-4': $vuetify.breakpoint.smAndUp}"></router-view>
                <CramfireLoadingIndicator v-if="!router_ready" :height="400" />

                <FeedbackDialog v-model="feedback_dialog_open" />
            </v-container>
        </v-content>

        <v-footer height="auto" class="pa-6 text-center" justify-center>
            <v-flex class="grey--text">
                <a class="grey--text" href="https://www.cramfire.com/">{{$t('footer.homepage')}}</a> | 
                <a class="grey--text" href="https://www.cramfire.com/impressum">{{$t('footer.imprint')}}</a> | 
                <a class="grey--text" href="https://www.cramfire.com/datenschutz">{{$t('footer.privacy_policy')}}</a> | 
                <a class="grey--text" href="https://www.cramfire.com/widerrufsrecht">{{$t('footer.revocation')}}</a>
            </v-flex>
        </v-footer>
    </v-app>
</template>

<script>
import CramfireLoadingIndicator from "./components/CramfireLoadingIndicator"
import RouteLoadingIndicator from "./components/RouteLoadingIndicator"
import FeedbackDialog from "./components/dialogs/FeedbackDialog"
import SearchInput from "./components/SearchInput"
import {setStorageData, removeStorageData} from "./helpers/storageHelpers"

export default {
    components: {
        CramfireLoadingIndicator,
        RouteLoadingIndicator,
        FeedbackDialog,
        SearchInput,
    },

    data(){
        return {
            router_ready: false,
            route_is_changing: false,
            darkmode_on: false,
            drawer_open: this.$vuetify.breakpoint.lgAndUp,
            feedback_dialog_open: false,
        }
    },

    computed: {
        is_logged_in(){
            return this.$store.getters['account/isLoggedIn'];
        },

        premium_days_left(){
            if( this.$store.getters['account/isPremium'] === false
                || this.$store.state.account.me === false
                || 'expires_at' in this.$store.state.account.me === false )
            {
                return 0;
            }

            var expires_at = this.$store.state.account.me.expires_at * 1000;

            if( expires_at < Date.now() )
            {
                return 0;
            }

            var day_in_ms = 1000 * 60 * 60 * 24;
            
            return (expires_at - Date.now()) / day_in_ms ;
        }
    },

    watch: {
        is_logged_in(new_value, old_value){
            if( new_value === true && old_value === false )
            {
                // der Nutzer ist jetzt eingeloggt => Seine Karteikästen (ohne Karten) laden,
                // damit immer die Liste aller Karteikästen vorhanden ist, die der Nutzer besitzt
                this.$store.dispatch('cardbox/loadCardboxesOfUser');
                // Einstellungen laden 
                this.$store.dispatch('options/loadOptions');
            }
            else if( new_value === false && old_value === true )
            {
                // Nutzer ist nicht mehr eingeloggt, war es aber bis eben noch => Login anzeigen
                this.$router.push({name:'account.login'});
            }
        },

        darkmode_on(new_value){
            this.$vuetify.theme.dark = new_value;
        },
    },

    created(){
        this.$router.onReady(() => { this.router_ready = true; });

        this.$router.beforeEach((to, from, next) => {
            this.route_is_changing = true;

            setTimeout(next, 20);
        });
        
        this.$router.afterEach(() => {
            this.route_is_changing = false;
        });

        this.checkLoggedIn();

        window.addEventListener('storage', this.syncLogout);
    },

    methods: {
        checkLoggedIn(){
            return this.$store.dispatch('account/checkLogin').catch(() => {});
        },

        syncLogout(event){
            if( event.newValue === null ){ return; } // Auf das Event durch das Löschen der Daten nicht reagieren

            if( event.key === '__logout__' )
            {
                this.$store.dispatch('account/logout')
                           .then(() => this.$store.dispatch('account/setCheckAuthRoute', this.$route) )
                           .then(() => this.$router.push({name: 'account.login'}) );
            }
        },

        logout(){
            this.$store.dispatch('account/logout').then(() => {
                setStorageData('__logout__', Date.now(), 'local');
                removeStorageData('__logout__', 'local');
            });
        },

        goHome(){
            this.$router.push({name: 'dashboard'});
        }
    },
}
</script>

<i18n>
{
    "de": {
        "toolbar": {
            "premium_days_left_hint": "Nur noch {n} Tag!|Nur noch {n} Tage!",
            "no_premium_hint": "Premiumzeit abgelaufen!",
            "premium_less_one_day_hint": "Weniger als 1 Tag!"
        },

        "drawer": {
            "dashboard": "Übersicht",
            "study": "Lernen",
            "cardboxes": "Meine Karteikästen",
            "public_cardboxes": "Öffentliche Karteikästen",
            "activity": "Aktivität",
            "settings": "Einstellungen",
            "account": "Mein Konto",
            "user_data": "Benutzerdaten",
            "buy_premium": "Premium kaufen",
            "extend_premium": "Premium verlängern",
            "coupon": "Gutschein einlösen",
            "tell_a_friend": "Freunde werben",
            "feedback": "Feedback",
            "darkmode_is_on": "Helles Design",
            "darkmode_is_off": "Dunkles Design",
            "logout": "Abmelden",

            "login": "Einloggen",
            "signup": "Registrieren",
            "homepage": "Zur Webseite zurück",
            "imprint": "Impressum",
            "privacy": "Datenschutz"
        },

        "footer": {
            "homepage": "Zur Webseite",
            "imprint": "Impressum",
            "privacy_policy": "Datenschutz",
            "revocation": "Widerrufsrecht"
        }
    }
}
</i18n>
