import http from "../http"
import {handleApiError} from "../structs/ApiError"

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;

export default {
    namespaced: true,

    state: {
        products: {},

        // Wurden bereits alle Sprachen geladen?
        all_products_loaded: false,
    },

    getters: {
        allProductsLoaded(state){
            return state.all_products_loaded;
        },

        allLoadedProducts(state){
            return state.products;
        },

        productById(state){
            return function(product_id){
                if( product_id in state.products)
                {
                    return state.products[product_id];
                }

                return null;
            }
        },

        productByItemNumber(state){
            return function(item_number){
                for(var product_id in state.products)
                {
                    if( state.products[product_id].item_number === item_number )
                    {
                        return state.products[product_id];
                    }
                }

                return null;
            }
        },

    },

    mutations: {
        setProducts(state, products){
            state.products = products;
        },

        setAllProductsLoaded(state, value){
            state.all_products_loaded = value;
        }
    },

    actions: {
        setProducts(context, products){
            context.commit('setProducts', products);
        },

        loadAllProducts(context){
            return http.get(`${API_BASE_URL}/product`)
                       .then(function(response){
                            context.commit('setProducts', response.data.data);
                            context.commit('setAllProductsLoaded', true);
                            return response.data.data;
                       })
                       .catch(handleApiError);
        }
    },

}