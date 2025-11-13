import Vue from "vue"
import Vuex from "vuex"
import accountModule from "./store_modules/accountModule"
import cardboxModule from "./store_modules/cardboxModule"
import languageModule from "./store_modules/languageModule"
import studyModule from "./store_modules/studyModule"
import optionsModule from "./store_modules/optionsModule"
import productModule from "./store_modules/productModule"

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        account: accountModule,
        cardbox: cardboxModule,
        language: languageModule,
        study: studyModule,
        options: optionsModule,
        product: productModule,
    }
});