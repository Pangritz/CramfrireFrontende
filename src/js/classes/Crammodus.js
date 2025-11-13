class Crammodus {

    constructor(cards)
    {
        // die IDs der Karten, die abgefragt werden sollen
        this.cards = cards;

        // die Anzahl aller abzufragenen Karten
        this.cards_count = cards.length;

        // beinhaltet die Information, ob die Karte beim letzten Mal gewusst wurde oder nicht
        // die Keys sind die IDs der Karten und der Wert true bedeutet gewusst und false bedeutet nicht gewusst
        this.last_answers = {};

        // die 7 Karten, die aktuell abgefragt werden
        this.pool = this.cards.splice(0,7);

        // die aktuelle Position im Pool
        this.current_position = 0;
    }

    /**
     * Liefert den Fortschritt von diesem Durchlauf in Prozent.
     * 
     * @return Number Der Fortschritt in Prozent (gerundet)
     */
    getProgress()
    {
        var remaining_cards_count = this.pool.length + this.cards.length;

        return Math.round( ((this.cards_count - remaining_cards_count) / this.cards_count) * 100 );
    }

    /**
     * Liefert die Anzahl an Karten, die noch abgefragt werden müssen.
     * 
     * @return Number Anzahl der verbleibenden Karten
     */
    getRemainingCardsCount()
    {
        return this.pool.length + this.cards.length;
    }

    /**
     * Liefert die Anzahl an Karten, mit der die Abfrage gestartet wurde.
     * 
     * @return Number Anzahl der Karten
     */
    getCardsCount()
    {
        return this.cards_count;
    }

    /**
     * Liefert die aktuell abzufragende Karte bzw. dessen ID.
     * 
     * @return Number|null Die Karte bzw. deren ID oder null, wenn es keine Karte im Moment gibt (Ende).
     */
    getCurrentCard()
    {
        return this.pool[this.current_position] || null;
    }

    /**
     * Speichert die Antwort einer Karte, um feststellen zu können, ob jemand die 
     * Karte beim ersten Mal oder zwei mal hintereinander wusste. 
     * 
     * @param Number card Die Karte bzw. deren ID, die abgefragt wurde
     * @param bool answer Gibt an, ob die Antwort richtig (true) oder falsch (false) war.
     */
    setLastAnswer(card, answer)
    {
        this.last_answers[card] = answer;
    }
    
    getLastAnswer(card)
    {
        if( card in this.last_answers )
        {
            return this.last_answers[card];
        }

        return null;
    }
    
    /**
     * Gibt an, ob die Antwort vom Nutzer richtig oder falsch war und liefert 
     * auch direkt die nächste Karte. 
     * 
     * @param bool answer_right 
     * @return Number|null Die nächste Karte bzw. deren ID
     */
    answer(answer_right)
    {
        var current_card = this.getCurrentCard();
        var last_answer = this.getLastAnswer(current_card);

        if( (last_answer === null && answer_right === true)  // direkt gewusst
            || (last_answer === true && answer_right === true) ) // 2x hintereinander gewusst 
        {
            // Karte aus den Pool an Karten nehmen
            this.updatePool(current_card);
        }
        
        this.setLastAnswer(current_card, answer_right);
    }  

    nextCard()
    {
        // die aktuelle Position ist der Index des Pools, also darf dieser
        // nur zwischen 0 und der Anzahl der Karten im Pool - 1 liegen
        this.current_position = (this.current_position + 1) % this.pool.length;

        return this.getCurrentCard();
    }
    
    updatePool(card)
    {
        if( this.cards.length === 0 )
        {
            // Es gibt keinen weiteren Karten mehr für den Durchlauf,
            // die noch nicht im Pool sind => Karte nur entfernen
            this.removeCardFromPool(card);
            this.current_position -= 1;
            return;
        }

        // es gibt noch neue Karten => Karte austauschen
        var index = this.pool.indexOf(card);

        this.pool[index] = this.cards.shift();
    }

    removeCardFromPool(card)
    {
        var index = this.pool.indexOf(card);

        if( index === -1 )
        {
            return false;
        }

        this.pool.splice(index, 1);
    }
    
    isEnd()
    {
        return this.pool.length === 0;
    }

}

export default Crammodus;