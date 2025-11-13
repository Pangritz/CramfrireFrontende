import Vue from "vue"
import VueI18n from "vue-i18n"
import de from "./lang/de.json"

Vue.use(VueI18n);

export default new VueI18n({
    locale: 'de',
    fallbackLocale: 'de',
    silentFallbackWarn: true,
    messages: {de},
});