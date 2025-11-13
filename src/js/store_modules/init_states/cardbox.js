export default function(){
    return {
        // Die Karteikästen, die generell geladen wurden. 
        // Entweder durch einen Teilen-Link oder einer der eigenen Karteikästen
        cardboxes: {},

        // Die Karten der geladenene Karteikästen
        cards: {},
        
        // Die IDs der Karteikästen, die dem Nutzer gehören
        cardboxes_of_user: [],

        // Die Zuordnung von Share-Tokens und der jweiligen ID des geteilten Karteikastens,
        // der über einen Teilen-Link geladenen wurde
        shared_cardboxes: {},

        // Alle öffentlichen Karteikästen, die jeder unter "öffentliche Karteikästen" aufrufen kann
        public_cardboxes: {},
    }
}