import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import de from 'vuetify/lib/locale/de';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary:   '#2563EB',
        secondary: '#1E40AF',
        accent:    '#2563EB',
        error:     '#EF4444',
        info:      '#3B82F6',
        success:   '#22C55E',
        warning:   '#F59E0B',
      },
    },
  },
  ripple: false,
  breakpoint: {
    thresholds: {
      xs: 600,
      sm: 960,
      md: 1280,
      lg: 3840
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
