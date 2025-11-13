import i18n from "./i18n"

export default {
    required: function(value){
        if( typeof value === 'undefined' || value === null )
        {
            return i18n.t('global.rule.required');
        }

        if( typeof value === 'string' )
        {
            return value.trim().length > 0 || i18n.t('global.rule.required');
        }

        return !!value || i18n.t('global.rule.required');
    },

    email: function(value){
        if( typeof value === 'undefined' )
        {
            value = '';
        }

        var pattern = new RegExp('.+@.+\\..+');

        return pattern.test(value.trim()) || i18n.t('global.rule.email');
    },

    password: function(value){
        if( typeof value === 'undefined' )
        {
            value = '';
        }

        return value.trim().length >= 8 || i18n.t('global.rule.password');
    },

    minLength: function(min_length){
        return function(value){
            if( typeof value === 'undefined' || value === null )
            {
                return false;
            }

            return value.length >= min_length || i18n.t('global.rule.min_length', {min_length});
        }
    },

    maxLength: function(max_length){
        return function(value){
            if( typeof value === 'undefined' || value === null )
            {
                return false;
            }

            return value.length <= max_length || i18n.t('global.rule.max_length', {max_length});
        }
    }
}