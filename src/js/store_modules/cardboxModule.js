import Vue from "vue"
import getInitState from "./init_states/cardbox"
import http from "../http"
import {handleApiError} from "../structs/ApiError"

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;

export default {
    namespaced: true,

    state: {
        ...getInitState()
    },

    getters: {
        user_has_cardboxes(state){
            return state.cardboxes_of_user.length > 0;
        },

        user_cardboxes(state){
            return state.cardboxes_of_user.map(function(cardbox_id){
                return state.cardboxes[cardbox_id];
            });
        },

        cardboxById(state){
            return function(cardbox_id){
                return state.cardboxes[cardbox_id] || null;
            };
        },

        cardById(state){
            return function(card_id){
                return state.cards[card_id] || null;
            }
        },

        cardsOfCardbox(state){
            return function(cardbox_id){
                if( cardbox_id in state.cardboxes
                    && 'cards' in state.cardboxes[cardbox_id] 
                    && state.cardboxes[cardbox_id].cards.length > 0 )
                {
                    return state.cardboxes[cardbox_id].cards.map(function(card_id){
                        return state.cards[card_id];
                    });
                }

                return [];
            }
        },

        sharedCardboxByToken(state, getters){
            return function(share_token){
                if( share_token in state.shared_cardboxes === false )
                {
                    return null;
                }

                return getters.cardboxById(state.shared_cardboxes[share_token]);
            }
        },

        publicCardboxes(state){
            var cardboxes = [];

            for(var cardbox_id in state.public_cardboxes)
            {
                cardboxes.push({
                    ...state.public_cardboxes[cardbox_id]
                });
            }

            return cardboxes;
        }
    },

    mutations: {
        addCardboxes(state, cardboxes){
            for(var cardbox_id in cardboxes)
            {
                if( cardbox_id in state.cardboxes )
                {
                    Vue.set(state.cardboxes, cardbox_id, {
                        ...state.cardboxes[cardbox_id],
                        ...cardboxes[cardbox_id]
                    });
                }
                else
                {
                    Vue.set(state.cardboxes, cardbox_id, cardboxes[cardbox_id]);
                }
            }
        },

        addCardbox(state, cardbox){
            if( cardbox.id in state.cardboxes )
            {
                Vue.set(state.cardboxes, cardbox.id, {
                    ...state.cardboxes[cardbox.id],
                    ...cardbox
                });
            }
            else
            {
                Vue.set(state.cardboxes, cardbox.id, cardbox);
            }
        },

        updateCardbox(state, cardbox){
            
            if( cardbox.id in state.cardboxes)
            {
                Vue.set(state.cardboxes, cardbox.id, {
                    ...state.cardboxes[cardbox.id],
                    ...cardbox
                });
            }
            
        },

        deleteCardbox(state, cardbox_id){
            Vue.delete(state.cardboxes, cardbox_id);
            
            var position = state.cardboxes_of_user.indexOf(cardbox_id);

            if( position !== -1 )
            {
                Vue.delete(state.cardboxes_of_user, position);
            }
        },

        setCardboxesOfUser(state, cardbox_ids){
            state.cardboxes_of_user = cardbox_ids;
        },

        setFavorite(state, data){
            if( data.cardbox_id in state.cardboxes )
            {
                Vue.set(state.cardboxes, data.cardbox_id, {
                    ...state.cardboxes[data.cardbox_id],
                    favorite: data.favorite
                });
            }
        },

        // Cards
        addCards(state, cards){
            state.cards = {
                ...state.cards,
                ...cards
            };
        },

        addCard(state, card){
            Vue.set(state.cards, card.id, card);

            if( card.cardbox_id in state.cardboxes
                && state.cardboxes[card.cardbox_id].cards.indexOf(card.id) === -1 )
            {
                Vue.set(state.cardboxes[card.cardbox_id], state.cardboxes[card.cardbox_id].cards.push(card.id));
            }

        },

        updateCard(state, card){
            Vue.set(state.cards, card.id, card);            
        },

        deleteCard(state, card){
            if( state.cardboxes[card.cardbox_id] 
                && state.cardboxes[card.cardbox_id].cards.indexOf(card.id) !== -1 )
            {
                // Karteikasten im State vorhanden => updaten
                state.cardboxes[card.cardbox_id].cards.splice(
                    state.cardboxes[card.cardbox_id].cards.indexOf(card.id),
                    1
                );
            }

            Vue.delete(state.cards, card.id);
        },

        swapSides(state, cardbox_id){
            // Sprachen des Karteikastens tauschen
            Vue.set(state.cardboxes, cardbox_id, {
                ...state.cardboxes[cardbox_id],
                front_language: state.cardboxes[cardbox_id].back_language,
                back_language: state.cardboxes[cardbox_id].front_language,
            });

            // Die Seiten der Karteikarten tauschen 
            for(var index in state.cardboxes[cardbox_id].cards)
            {
                var card_id = state.cardboxes[cardbox_id].cards[index];
                var card = state.cards[card_id];

                Vue.set(state.cards, card_id, {
                    ...card,
                    front: card.back,
                    back: card.front,
                    front_info: card.back_info,
                    back_info: card.front_info
                });
            }
        },

        batchCardDelete(state, data){
            for(var index in data)
            {
                var card = state.cards[data[index]];

                if( state.cardboxes[card.cardbox_id]
                    && state.cardboxes[card.cardbox_id].cards.indexOf(card.id) !== -1 )
                {
                    // Karteikasten im State vorhanden => Karte dort entfernen
                    state.cardboxes[card.cardbox_id].cards.splice(
                        state.cardboxes[card.cardbox_id].cards.indexOf(card.id),
                        1
                    );
                }

                Vue.delete(state.cards, card.id);
            }
        },

        unlinkCardsFromCardbox(state, data){
            var card_ids = data.card_ids;
            var cardbox_id = data.cardbox_id;

            if( cardbox_id in state.cardboxes
                && "cards" in state.cardboxes[cardbox_id] )
            {
                for(var card_id in card_ids)
                {
                    state.cardboxes[cardbox_id].cards.splice(
                        state.cardboxes[cardbox_id].cards.indexOf(card_id),
                        1
                    );
                }
            }
        },

        setShareToken(state, data){
            if( data.cardbox_id in state.cardboxes === false )
            {
                return;
            }

            Vue.set(state.cardboxes[data.cardbox_id], 'share_token', data);
        },

        addSharedCardbox(state, data){
            Vue.set(state.shared_cardboxes, data.share_token, data.cardbox_id);
        },

        setPublicCardboxes(state, data){
            state.public_cardboxes = data;
        },   
        
        resetState(state){
            var initState = getInitState();

            for(var key in initState)
            {
                Vue.set(state, key, initState[key]);
            }
        },
    },

    actions: {
        loadCardboxesOfUser(context){
            return http.get(`${API_BASE_URL}/cardbox`)
                       .then(function(response){
                            if( response.data.data.length !== 0 )
                            {
                                context.commit('addCardboxes', response.data.data);
                                context.commit('setCardboxesOfUser', response.data.cardboxes_order);
                                context.commit('language/addLanguages', response.data.languages, {root:true});

                                if( response.data.cards )
                                {
                                    context.commit('addCards', response.data.cards);
                                }
                            }
                            else
                            {
                                // Noch keine Karteikästen vorhanden
                                context.commit('setCardboxesOfUser', []);
                            }

                            return response.data.data;
                       })
                       .catch(handleApiError);
        },

        resetState(context){
            context.commit('resetState');
        },

        loadCardbox(context, cardbox_id){
            return http.get(`${API_BASE_URL}/cardbox/${cardbox_id}`)
                       .then(function(response){
                            context.commit('addCardbox', response.data.data);
                            context.commit('language/addLanguages', response.data.languages, {root:true});

                            if( response.data.cards)
                            {
                                context.commit('addCards', response.data.cards);
                            }

                            return response.data.data;
                       })
                       .catch(handleApiError);
        },

        create(context, data){
            return http.post(`${API_BASE_URL}/cardbox`, data)
                       .then(function(response){
                            context.commit('addCardbox', response.data.data);
                            context.commit('language/addLanguages', response.data.languages, {root:true});

                            return response.data.data;
                       })
                       .catch(handleApiError);
        },

        edit(context, data){
            return http.put(`${API_BASE_URL}/cardbox/${data.id}`, data)
                       .then(function(){
                            context.commit('updateCardbox', data);
                            return data;
                       })
                       .catch(handleApiError);
        },

        delete(context, cardbox_id){
            return http.delete(`${API_BASE_URL}/cardbox/${cardbox_id}`)
                       .then(function(){
                            context.commit('deleteCardbox', cardbox_id);   
                       })
                       .catch(handleApiError);
        },

        setFavorite(context, data){
            return http.post(`${API_BASE_URL}/cardbox/${data.cardbox_id}/favorite`, {favorite: data.favorite})
                       .then(function(){
                            context.commit('setFavorite', data);
                       })
                       .catch(handleApiError);
                       
        },

        createCard(context, data){
            return http.post(`${API_BASE_URL}/card`, data)
                       .then(function(response){
                            context.commit('addCard', response.data.data);
                       })
                       .catch(handleApiError);
        },

        editCard(context, data){
            return http.put(`${API_BASE_URL}/card/${data.id}`, data)
                       .then(function(){
                            context.commit('updateCard', data);
                       })
                       .catch(handleApiError);
        },

        deleteCard(context, data){
            return http.delete(`${API_BASE_URL}/card/${data.id}`)
                       .then(() => {
                           context.commit('deleteCard', data);
                       })
                       .catch(handleApiError);
        },

        swapSides(context, cardbox_id)
        {
            return http.post(`${API_BASE_URL}/cardbox/${cardbox_id}/swap`)
                       .then(() => {
                           context.commit('swapSides', cardbox_id);
                       })
                       .catch(handleApiError);
        },

        batchCardDelete(context, data){
            return http.post(`${API_BASE_URL}/card/batchdelete`, {cards: data.cards})
                       .then(() => {
                            context.commit('batchCardDelete', data.cards);

                            if( data.source_cardbox in context.state.cardboxes
                                && "cards" in context.state.cardboxes[data.source_cardbox] )
                            {
                                context.dispatch('loadCardbox', data.source_cardbox);
                            }
                       })
                       .catch(handleApiError);
        },

        batchCardMove(context, data){
            return http.post(`${API_BASE_URL}/card/batchmove`, data)
                       .then(() => {
                            context.commit('batchCardDelete', data.cards);

                            if( data.target_cardbox in context.state.cardboxes
                                    && "cards" in context.state.cardboxes[data.target_cardbox] )
                            {
                                context.dispatch('loadCardbox', data.target_cardbox);
                            }

                            if( data.source_cardbox in context.state.cardboxes
                                && "cards" in context.state.cardboxes[data.source_cardbox] )
                            {
                                context.dispatch('loadCardbox', data.source_cardbox);
                            }
                       })
                       .catch(handleApiError);
        },

        batchCardCopy(context, data){
            return http.post(`${API_BASE_URL}/card/batchcopy`, data)
                       .then(() => {
                            if( data.target_cardbox in context.state.cardboxes
                                && "cards" in context.state.cardboxes[data.target_cardbox] )
                            {
                                context.dispatch('loadCardbox', data.target_cardbox);
                            }
                       })
                       .catch(handleApiError);
        },

        import(context, data){
            return http.post(`${API_BASE_URL}/cardbox/${data.cardbox_id}/import`, {cards: data.csv_data})
                       .then(() => {
                            // Erfolgreich importiert => den Karteikasten updaten 
                            return context.dispatch('loadCardbox', data.cardbox_id);
                       })
                       .catch(handleApiError);
        },

        shareCardbox(context, data){
            return http.post(`${API_BASE_URL}/cardbox/${data.cardbox_id}/share`, {active: data.active})
                       .then((response) => {
                           context.commit('setShareToken', response.data.data);
                       })
                       .catch(handleApiError);
        },

        loadSharedCardbox(context, share_token){
            return http.get(`${API_BASE_URL}/share/${share_token}`)
                       .then((response) => {
                            context.commit('language/addLanguages', response.data.languages, {root:true});
                            context.commit('addCards', response.data.cards);
                            context.commit('addCardbox', response.data.data);

                            context.commit('addSharedCardbox', {
                                share_token,
                                cardbox_id: response.data.data.id
                            });
                       })
                       .catch(handleApiError);
        },

        importSharedCardbox(context, share_token){
            return http.get(`${API_BASE_URL}/share/${share_token}/import`)
                       .then((response) => {
                            context.commit('language/addLanguages', response.data.languages, {root:true});
                            context.commit('addCards', response.data.cards);
                            context.commit('addCardbox', response.data.data);

                            return response.data.data;
                       })
                       .catch(handleApiError);
        },

        loadPublicCardboxes(context){
            return http.get(`${API_BASE_URL}/public_cardbox`)
                       .then((response) => {
                           if( 'languages' in response.data )
                           {
                                context.commit('language/addLanguages', response.data.languages, {root:true});
                           }

                           context.commit('setPublicCardboxes', response.data.data);

                           return response.data.data;
                       })
                       .catch(handleApiError);
        },

        resetCardboxLearningStatus(context, cardbox_id){
            return http.delete(`${API_BASE_URL}/card_statistics/cardbox/${cardbox_id}`)
                       .catch(handleApiError);
        }
    },

}