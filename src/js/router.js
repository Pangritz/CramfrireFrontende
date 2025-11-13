import Vue from "vue"
import VueRouter from "vue-router"
import store from "./store"

const DashboardPage = () => import(/* webpackChunkName: "chunk-dashboard" */"./pages/DashboardPage.vue")
const SearchPage = () => import(/* webpackChunkName: "chunk-dashboard" */ "./pages/SearchPage.vue")

const CardboxIndexPage = () => import(/* webpackChunkName: "chunk-cardbox" */ "./pages/CardboxIndexPage.vue")
const CardboxCreatePage = () => import(/* webpackChunkName: "chunk-cardbox" */ "./pages/CardboxCreatePage.vue")
const CardboxShowPage = () => import(/* webpackChunkName: "chunk-cardbox" */ "./pages/CardboxShowPage.vue")
const CardboxEditPage = () => import(/* webpackChunkName: "chunk-cardbox" */ "./pages/CardboxEditPage.vue")
const CardsImportPage = () => import(/* webpackChunkName: "chunk-cardbox-additonal" */ "./pages/CardsImportPage.vue")
const LearningStatusPage = () => import(/* webpackChunkName: "chunk-cardbox-additonal" */ "./pages/LearningStatusPage.vue")

const PublicCardboxesPage = () => import(/* webpackChunkName: "chunk-cardbox" */ "./pages/PublicCardboxesPage.vue")

const LearningPage = () => import(/* webpackChunkName: "chunk-study" */ "./pages/LearningPage.vue")
const StudyMeaningPage = () => import(/* webpackChunkName: "chunk-study" */ "./pages/StudyMeaningPage.vue")
const StudySpellingPage = () => import(/* webpackChunkName: "chunk-study" */ "./pages/StudySpellingPage.vue")
const StudyTestPage = () => import(/* webpackChunkName: "chunk-study" */ "./pages/StudyTestPage.vue")
const StudySpeedlearningPage = () => import(/* webpackChunkName: "chunk-study" */ "./pages/StudySpeedlearningPage.vue")

const ActivityPage = () => import(/* webpackChunkName: "chunk-activity" */ "./pages/ActivityPage.vue")

const SettingsPage = () => import(/* webpackChunkName: "chunk-account" */ "./pages/SettingsPage.vue")

const SharedCardboxPage = () => import(/* webpackChunkName: "chunk-cardbox" */ "./pages/SharedCardboxPage.vue")

const PrintTestPage = () => import(/* webpackChunkName: "chunk-cardbox" */ "./pages/PrintTestPage.vue")
const PrintListPage = () => import(/* webpackChunkName: "chunk-cardbox" */ "./pages/PrintListPage.vue")

const PremiumBuyPage = () => import(/* webpackChunkName: "chunk-account" */ "./pages/PremiumBuyPage.vue")
const PremiumExpiredPage = () => import(/* webpackChunkName: "chunk-account" */ "./pages/PremiumExpiredPage.vue")

const PaypalReturnPage = () => import(/* webpackChunkName: "chunk-account" */ "./pages/PaypalReturnPage.vue")
const PaypalCancelPage = () => import(/* webpackChunkName: "chunk-account" */ "./pages/PaypalCancelPage.vue")

const ProductPage = () => import(/* webpackChunkName: "chunk-account" */ "./pages/ProductPage.vue")

const SignupPage = () => import(/* webpackChunkName: "chunk-guest" */ "./pages/SignupPage.vue")
import LoginPage from "./pages/LoginPage"
const PasswordForgottenPage = () => import(/* webpackChunkName: "chunk-guest" */ "./pages/PasswordForgottenPage.vue")
const PasswordResetPage = () => import(/* webpackChunkName: "chunk-guest" */ "./pages/PasswordResetPage.vue")
const EmailConfirmationPage = () => import(/* webpackChunkName: "chunk-guest" */ "./pages/EmailConfirmationPage.vue")

const AdvertiserLinkRedirect = () => import(/* webpackChunkName: "chunk-guest" */ "./pages/AdvertiserLinkRedirect.vue")
const AdvertiserPage = () => import(/* webpackChunkName: "chunk-account" */ "./pages/AdvertiserPage.vue")

const AccountPage = () => import(/* webpackChunkName: "chunk-account" */ "./pages/AccountPage.vue")
const CouponPage = () => import(/* webpackChunkName: "chunk-account" */ "./pages/CouponPage.vue")

import ErrorNotFoundPage from "./pages/ErrorNotFoundPage"

Vue.use(VueRouter);

// Stellt sicher, dass die Route nur von nicht eingeloggten Nutzern aufgerufen wird
function checkGuest(to, from, next)
{
    store.dispatch('account/checkLogin')
    .then( () => next({name: 'dashboard', replace: true}) )
    .catch( () => next() );
}

// Stellt sicher, dass die Route nur aufgerufen wird, wenn der Nutzer angemeldet ist
function checkAuth(to, from, next)
{
    store.dispatch('account/checkLogin')
    .then( () => next() )
    .catch( () => {
        store.dispatch('account/setCheckAuthRoute', to)
             .then(() => next({name: 'account.login'}) );
    });
}

// Stellt sicher, dass die Route nur aufgerufen wird, wenn der Nutzer noch einen Premium Account besitzt
function checkPremium(to, from, next)
{
    store.dispatch('account/checkLogin')
    .then( () => {
        if( store.getters['account/isPremium'] )
        {
            next(); // Premium aktiv
        }
        else 
        {
            next({name:'premium.expired'}); // Premium abgelaufen
        }
    })
    .catch( () => next({name: 'account.login'}) ); // gar nicht eingeloggt
}

const routes = [

    // Dashboard
    { 
        path: '/', 
        component: DashboardPage, 
        name: "dashboard",
        beforeEnter: checkAuth
    },

    // Suche
    {
        path: '/search/:keyword',
        component: SearchPage,
        name: 'search',
        beforeEnter: checkAuth
    },

    // Meine Karteikästen
    { 
        path: '/cardbox', 
        component: CardboxIndexPage, 
        name: "cardbox.index",
        beforeEnter: checkAuth
    },

    { 
        path: '/cardbox/create', 
        component: CardboxCreatePage, 
        name: "cardbox.create",
        beforeEnter: checkAuth
    },

    { 
        path: '/cardbox/:cardbox_id', 
        component: CardboxShowPage, 
        name: "cardbox.show",
        beforeEnter: checkAuth
    },

    { 
        path: '/cardbox/:cardbox_id/edit', 
        component: CardboxEditPage, 
        name: "cardbox.edit",
        beforeEnter: checkAuth
    },

    { 
        path: '/cardbox/:cardbox_id/import', 
        component: CardsImportPage, 
        name: "cardbox.import",
        beforeEnter: checkAuth
    },

    {
        path: '/cardbox/:cardbox_id/learning_status',
        component: LearningStatusPage,
        name: "cardbox.learning_status",
        beforeEnter: checkAuth
    },

    // öffentliche Karteikästen
    {
        path: '/public_cardboxes',
        component: PublicCardboxesPage,
        name: "public_cardboxes",
        beforeEnter: checkAuth
    },

    // Karteikasten Teilen-Link
    {
        path: '/share/:token',
        component: SharedCardboxPage,
        name: 'share.cardbox',
    },

    // Lernen
    {
        path: '/learning',
        component: LearningPage,
        name: "learning",
        beforeEnter: checkPremium
    },

    {
        path: '/learning/:study_type',
        component: LearningPage,
        name: "learning.start",
        beforeEnter: checkPremium
    },

    {
        path: '/study/meaning/:cardbox_id',
        component: StudyMeaningPage,
        name: "study.meaning",
        beforeEnter: checkAuth
    },

    {
        path: '/study/spelling/:cardbox_id',
        component: StudySpellingPage,
        name: "study.spelling",
        beforeEnter: checkPremium
    },

    {
        path: '/study/test/:cardbox_id/front',
        component: StudyTestPage,
        props: { test_side: 'front'},
        name: "study.test_front",
        beforeEnter: checkPremium
    },

    {
        path: '/study/test/:cardbox_id/back',
        component: StudyTestPage,
        props: { test_side: 'back'},
        name: "study.test_back",
        beforeEnter: checkPremium
    },

    {
        path: '/study/speedlearning/:cardbox_id',
        component: StudySpeedlearningPage,
        name: "study.speedlearning",
        beforeEnter: checkPremium
    },

    // Aktivitäten
    {
        path: '/activity',
        component: ActivityPage,
        name: "activity",
        beforeEnter: checkAuth
    },

    // Einstellungen
    {
        path: '/settings',
        component: SettingsPage,
        name: "settings",
        beforeEnter: checkAuth
    },

    // Drucken
    {
        path: '/print/test/:cardbox_id',
        component: PrintTestPage,
        name: 'print.test',
        beforeEnter: checkPremium
    },

    {
        path: '/print/list/:cardbox_id',
        component: PrintListPage,
        name: 'print.list',
        beforeEnter: checkPremium
    },

    // Account
    {
        path: '/account',
        component: AccountPage,
        name: "account",
        beforeEnter: checkAuth
    },

    // Gutscheine / Promocodes
    {
        path: '/coupon',
        component: CouponPage,
        name: "coupon",
        beforeEnter: checkAuth
    },

    // Werbe einen Freund
    {
        path: '/tell-a-friend',
        component: AdvertiserPage,
        name: "advertiser",
        beforeEnter: checkAuth
    },

    {
        path: '/ref/:ref_code',
        component: AdvertiserLinkRedirect,
        name: "advertiser.link_redirect",
    },

    // Premium
    { path: '/premium-buy', component: PremiumBuyPage, name: "premium.buy", beforeEnter: checkAuth },
    { path: '/premium-expired', component: PremiumExpiredPage, name: "premium.expired", beforeEnter: checkAuth },

    // PayPal 
    { path: '/paypal/return', component: PaypalReturnPage, name: "paypal.return"},
    { path: '/paypal/cancel', component: PaypalCancelPage, name: "paypal.cancel"},

    // Produkt
    { path: '/product/:product_id', component: ProductPage, name: "product", beforeEnter: checkAuth },
    
    { path: '/signup', component: SignupPage, name: "account.signup" },
    { path: '/login', component: LoginPage, name: "account.login", beforeEnter: checkGuest },
    { path: '/password-forgotten', component: PasswordForgottenPage, name: "account.password_forgotten" },
    { path: '/password-reset/:public_id/:token', component: PasswordResetPage, name: "account.password_reset" },
    { path: '/email-confirmation/:public_id/:token', component: EmailConfirmationPage, name: "account.email_confirmation" },

    { path: '*', component: ErrorNotFoundPage, name: "error.not_found" },
];

export default new VueRouter({
    mode: 'history',
    routes,
    scrollBehavior (to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { x: 0, y: 0 };
        }
    }
});