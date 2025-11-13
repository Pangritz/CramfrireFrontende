import Crammodus from './Crammodus'
import InquiryValidator from './InquiryValidator'
import http from '../http'
import {handleApiError} from '../structs/ApiError'
import store from '../store';

class Inquiry {

    constructor(training_id, cards)
    {
        // die ID des Trainings bzw. der Abfrage 
        this.training_id = training_id;

        // die Karten, die abgefragt werden sollen
        this.cards = cards;

        // Karten, die beim ersten Mal abfragen gewusst wurden 
        this.cards_known = [];

        // Karten, die beim ersten Mal abfragen nicht gewusst wurden
        this.cards_unknown = [];

        // das Objekt mit der Verwaltung der Crammodusabfrage der Karten
        this.crammodus = new Crammodus(this.cards.slice());
    }

    getCurrentCard()
    {
        return this.crammodus.getCurrentCard();
    }

    nextCard(){
        return this.crammodus.nextCard();
    }

    answer(is_right)
    {
        if( this.getCurrentCard() === null )
        {
            return false;
        }

        this.updateCardStatistics(this.getCurrentCard(), is_right);

        this.crammodus.answer(is_right);
    }
    
    spellingAnswer(is_right)
    {
        if( this.getCurrentCard() === null )
        {
            return false;
        }

        this.updateCardStatistics(this.getCurrentCard(), is_right);

        this.crammodus.answer(is_right);
    }

    checkAnswer(input, input_is_back, 
                case_insensitive, punctuation_chars_optional, easy_special_chars, brackets_optional, split_parts_on_comma, only_parts)
    {
        var card = store.getters['cardbox/cardById'](this.getCurrentCard());
        var answer = card.back; // Standardmäßig muss die Rückseite eingegeben werden

        if( !input_is_back )
        {
            // die Vorderseite wurde eingegeben und muss überprüft werden
            answer = card.front;
        }

        return InquiryValidator.compareCards(input, answer, case_insensitive, punctuation_chars_optional, easy_special_chars, brackets_optional, split_parts_on_comma, only_parts);
    }

    updateCardStatistics(card_id, state)
    {
        state = state ? 1 : 0;

        var data = {
            card_id,
            state
        };

        return http.post(`${process.env.VUE_APP_API_BASE_URL}/card_statistics/${this.training_id}`, data)
                   .catch(handleApiError);  
    }

    isEnd()
    {
        return this.crammodus.isEnd();
    }

    getProgress()
    {
        return this.crammodus.getProgress();
    }

    getRemainingCardsCount()
    {
        return this.crammodus.getRemainingCardsCount();
    }
}

export default Inquiry;