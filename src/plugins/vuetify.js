import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import de from 'vuetify/lib/locale/de';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#1976d2',
        secondary: '#424242',
        accent: '#005caf',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107'
      },
    },
  },
  breakpoint: {
    thresholds: { // Das sind NICHT die Werte, AB denen der jeweilige Breakpoint gilt, sondern BIS zu welchem Wert
        xs: 600,  // sm =  >=  600
        sm: 960,  // md =  >=  960
        md: 1280, // lg =  >= 1280
        lg: 3840  // xl =  >= 3840
    }    
  },
  lang: {
    locales: { de },
    current: 'de',
  },
  icons: {
    iconfont: 'md',
  },
});
