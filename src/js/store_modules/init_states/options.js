export default function(){
    return {
        spelling: {
            case_insensitive: true, // Groß- und Kleinschreibung ignorieren
            punctuation_chars_optional: true, // Satzzeichen ignorieren/optional
            easy_special_chars: true, // vereinfachte Eingabe von Sonderzeichen é = e, û = u usw. 
            brackets_optional: true, // Klammern und deren Inhalte sind optional
            split_parts_on_comma: true, // Begriffe durch Komma "," getrennt
            only_parts: true, // es müssen nicht immer alle Begriffe genannt werden
        },

        speedlearning: {
            first_side: 'back', // welche Seite als erstes angezeigt werden soll
            front_display_duration: 3, // die Anzeigedauer der Vorderseite
            back_display_duration: 2, // die Anzeigedauer der Rückseite
        },
    }
}