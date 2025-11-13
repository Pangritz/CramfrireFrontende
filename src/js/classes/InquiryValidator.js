/* eslint-disable no-useless-escape */
class InquiryValidator {

    static compareCards(input, // die Eingabe des Nutzers
                        card,  // die richtige Antwort, die auf der Karte stehen
                        case_insensitive, // Groß- und Kleinschreibung ignorieren
                        punctuation_chars_optional, // Satzzeichen ignorieren/optional
                        easy_special_chars, // vereinfachte Eingabe von Sonderzeichen é = e, û = u usw. 
                        brackets_optional, // Klammern und deren Inhalte sind optional
                        split_parts_on_comma, // Begriffe durch Komma "," getrennt
                        only_parts // bei mehreren Begriffen muss nicht jeder Begriff angegeben werden
                        )
    {
        // sicherstellen, dass alle Argumente boolean sind 
        case_insensitive = !!case_insensitive;
        punctuation_chars_optional = !!punctuation_chars_optional;
        easy_special_chars = !!easy_special_chars;
        brackets_optional = !!brackets_optional;
        split_parts_on_comma = !!split_parts_on_comma;
        only_parts = !!only_parts;

        input = input.trim();
        card  = card.trim();

        // Wurde überhaupt etwas eingegeben?
        if( input.length === 0 )
        {
            return false;
        }

        // Stimmt die Eingabe ganz genau mit der Antwort überein?
        if( input === card )
        {
            return true;
        }

        // Tabulatoren, Zeilenumbrüche und mehrere Leerzeichen hintereinander durch ein Leerzeichen ersetzen
        input = InquiryValidator.normalize(input);
        card  = InquiryValidator.normalize(card);

        // Stimmt die Eingabe inzwischen mit der Antwort überein, so dass wir uns den Rest sparen können?
        if( input === card 
            || (case_insensitive && input.toLowerCase() === card.toLowerCase()) )
        {
            return true;
        }

        // Regulären Ausdruck erstellen, ohne Begriffe zerteilen, um bestimmte Fälle zu berücksichtigen,
        // wie z.B. beim Trennen von Begriffen durch ein Komma, einen Satz mit einem Komma auch als richtig 
        // anzusehen, wenn man das Komma nicht mit eingibt, aber Satzzeichen ignorieren aktiv ist. 
        // Das wäre sonst nicht möglich, wenn es am Komma aufgetrennt werden soll, aber das nicht vorhanden ist.
        // Es wäre dann nur eine Eingabe mit Komma möglich, obwohl Satzzeichen optional aktiviert ist.
        var single_part_card = InquiryValidator.generateRegExps(card, case_insensitive, punctuation_chars_optional, easy_special_chars, brackets_optional);

        if( single_part_card.test(input) )
        {
            return true;
        }
        else if( !split_parts_on_comma )
        {
            // Da die Eingabe nicht richtig ist, aber auch nichts mehr passiert, was in diesem Fall
            // das Ergebnis doch noch "richtig" machen könnte, bleibt das Ergebnis "falsch".
            return false;
        }

        // Hinweis: Durch Zeilenumbrüche getrennte Wörter sind nicht möglich, 
        // da bei der Eingabe bei der Abfrage keine Zeilenumbrüche eingegeben werden können!

        // Begriffe werden durch komma getrennt
        input = InquiryValidator.split(input);
        card = InquiryValidator.split(card);

        for(var index in card)
        {
            card[index] = InquiryValidator.generateRegExps(card[index], case_insensitive, punctuation_chars_optional, easy_special_chars, brackets_optional);
        }

        // Antwort überprüfen
        var card_matches = [];
        for(var i=0; i < card.length; i++){ card_matches.push(0); }

        for( i=0; i < input.length; i++)
        {
            var part_matches = false; // Wurde für den aktuellen Begriff eine Übereinstimmung auf der Karte gefunden?

            for(var c=0; c < card.length; c++)
            {
                if( card[c].test(input[i]) )
                {
                    // die "Treferanzahl" für den jeweiligen Begriff um eins erhöhen
                    card_matches[c]++;
                    part_matches = true;
                    break;
                }
            }

            if( part_matches === false )
            {
                // Der Teil der Eingabe wurde gar nicht gefunden 
                // => Antwort auf jeden Fall falsch, weil nicht was komplett falsches eingegeben werden können soll!
                return false;
            }
        }

        if( only_parts )
        {
            // die Eingabe muss auf jeden Fall richtig sein, weil die Eingabe mit mindestens einem 
            // Begriff auf der Karte übereinstimmt und der Code schon vorher abbrechen würde, wenn in der Eingabe
            // ein Begriff stehen würde, der gar nicht auf der Karte steht
            return true;
        }
        
        // onlyparts === false
        for(i=0; i < card_matches.length; i++)
        {
            if( card_matches[i] == 0 )
            {
                // Nicht alle Begriffe auf der Karte wurden in der Eingabe (richtig) erwähnt 
                return false;
            }
        }
        
        return true;
    }

    // Normalisiert Tabulatoren, Zeilenumbrüche usw.
    static normalize(value)
    {
        return value.replace(/\t/g, ' ') // Tabulatoren gegen Leerzeichen ersetzen
                    .replace(/(\r?\n|\r)+/g, ' ') // Zeilenumbrüche (einen oder mehrere) zu einem Leerzeichen zusammenfassen
                    .replace(/\s+/g, ' ') // Mehrere Leerzeichen hintereinander zu einem zusammenführen
                    .trim() // Trimmen, damit am Anfang und Ende keine unnötigen Leerzeichen sind 
    }

    // Trennt die einzelnen Begriffe wie gewünscht
    static split(value)
    {
        var words = [];
        var brackets = 0;
        var value_length = value.length;
        var last_offset = -1;
        for(var i=0; i < value_length; i++)
        {
            switch(value.charAt(i))
            {
                case '(':
                    brackets++;
                    break;

                case ')':
                    brackets--;
                    break;

                case ',':
                    if( brackets == 0)
                    {
                        words.push(value.substring(last_offset+1, i).trim());
                        last_offset = i;
                    }
                    break;
            }
        }
        words.push(value.substring(last_offset+1, value_length).trim());

        value = [];
        // Leere Zeilen aussortieren
        for(i=0; i < words.length; i++)
        {
            if( words[i].length > 0 )
            {
                value.push(words[i]);
            }
        }

        return value;        
    }

    // Sorgt dafür, dass jeder Teil der richtigen Antwort ein entsprechender Regulärer Ausdruck zum testen ist 
    static generateRegExps(card, case_insensitive, punctuation_chars_optional, easy_special_chars, brackets_optional)
    {
        // Die Sonderzeichen und ihre Vereinfachungen
        var replacements_special_chars = {
            "ª":"a","á":"a","Á":"A","à":"a","À":"A","â":"a","Â":"A","ä":"a","Ä":"A","ă":"a","Ă":"A","ā":"a",
            "Ā":"A","ã":"a","Ã":"A","å":"a","Å":"A","ą":"a","Ą":"A","́Ā":"A","̀́ā":"a","æ":"ae","Æ":"AE",
            "ć":"c","Ć":"C","ċ":"c","Ċ":"C","ĉ":"c","Ĉ":"C","č":"c","Č":"C","ç":"c","Ç":"C",
            "ď":"d","Ď":"D","đ":"d","Đ":"D","ð":"d",
            "é":"e","É":"E","è":"e","È":"E","ė":"e","Ė":"E","ê":"e","Ê":"E","ë":"e","Ë":"E","ě":"e","Ě":"E","ĕ":"e","Ĕ":"E","ē":"e",
            "Ē":"E","ę":"e","Ę":"E","ḗ":"e","Ḗ":"E",
            "ĝ":"g","Ĝ":"G","ğ":"g","Ğ":"G","ģ":"g","Ģ":"G",
            "ĥ":"h","Ĥ":"H","ħ":"h","Ħ":"H",
            "ı":"i","í":"i","Í":"I","ì":"i","Ì":"I","İ":"I","î":"i","Î":"I","ï":"i","Ï":"I","ĭ":"i",
            "Ĭ":"I","ī":"i","Ī":"I","į":"j","Į":"J","ĳ":"ij","Ĳ":"IJ",
            "ĵ":"j","Ĵ":"J",
            "ķ":"k","Ķ":"K",
            "ĺ":"l","Ĺ":"L","ľ":"l","Ľ":"L","ļ":"l","Ļ":"L","ł":"l","Ł":"L",
            "ń":"n","Ń":"N","ň":"n","Ň":"N","ñ":"n","Ñ":"N","ņ":"n","Ņ":"N","ŉ":"N","Ǹ":"N","ǹ":"n",
            "º":"o","ó":"o","Ó":"O","ò":"o","Ò":"O","ô":"o","Ô":"O","ö":"o","Ö":"O","ŏ":"o","Ŏ":"O","ō":"o",
            "Ō":"O","õ":"o","Õ":"O","ő":"o","Ő":"O","ø":"o","Ø":"O","ṓ":"o","Ṓ":"O","ṑ":"o","Ṑ":"O",
            "œ":"oe","Œ":"OE",
            "ŕ":"r","Ŕ":"R","ř":"r","Ř":"R","ŗ":"r","Ŗ":"R",
            "ś":"s","Ś":"S","ŝ":"s","Ŝ":"S","š":"s","Š":"S","ş":"s","Ş":"S","ß":"s",
            "ť":"t","Ť":"T","ţ":"t","Ţ":"T",
            "þ":"p","Þ":"P",
            "ú":"u","Ú":"U","ù":"u","Ù":"U","û":"u","Û":"U","ü":"u","Ü":"U","ŭ":"u","Ŭ":"U","ū":"u","Ū":"U",
            "ů":"u","Ů":"U","ų":"u","Ų":"U","ű":"u","Ű":"U",
            "ý":"y","Ý":"Y","ÿ":"y","Ÿ":"Y",
            "ź":"z","Ź":"Z","ż":"z","Ż":"Z","ž":"z","Ž":"Z",
        };

        // Alle Zeichen escapen, die so oder so escaped werden müssen, wenn sie vorkommen
        card = card.replace(/[\[\]\\\^\$\.\|\?\*\+\{\}]/g, function(char){
            return '\\'+char;
        });

        // Satzzeichen optional?
        if( punctuation_chars_optional )
        {
            card = card.replace(/[\.\,\:\;\?\!\"\'\¿\¡\|]/g, function(char){
                return char+'?';
            });
        } 
      
        // Klammerninhalt optional?
        if( brackets_optional === true )
        {
            card = card.replace(/\s?\(([^\)]*)\)\s?/g, function(match, bracket_content){
                var first_char = match.charAt(0);
                var last_char  = match.charAt(match.length-1);

                if( first_char == ' ' && last_char == ' ')
                {
                    // Leerzeichen links und rechts neben der Klammer: _(das)_
                    return '\\s((\\('+bracket_content+'\\)|'+bracket_content+')\\s)?';
                }
                else if( first_char != ' ' && last_char == ' ')
                {
                    // Leerzeichen nur rechts neben der Klammer: (der)_Baum
                    return '((\\('+bracket_content+'\\)|'+bracket_content+')\\s)?';
                }
                else if( first_char == ' ' && last_char != ' ')
                {
                    // Leerzeichen nur links neben der Klammer: Tür_(ab)schließen
                    return '(\\s(\\('+bracket_content+'\\)|'+bracket_content+'))?';
                }
                else
                {
                    // Kein Leerzeichen links und rechts: Te(s)t
                    return '(\\('+bracket_content+'\\)|'+bracket_content+')?';
                }
            });
        }
        else
        {
            card = card.replace(/\(([^\)]*)\)/g, function(match, bracket_content){
                return '(\\('+bracket_content+'\\)|'+bracket_content+')';
            });
        }

        // Vereinfachte Sonderzeichen?
        if( easy_special_chars )
        {
            var replace_regexp = '';
            for(var special_char in replacements_special_chars)
            {
                replace_regexp += special_char;
            }
            replace_regexp = new RegExp('['+replace_regexp+']', 'g');

            card = card.replace(replace_regexp, function(special_char){
                return '('+replacements_special_chars[special_char]+'|'+special_char+')';
            });
        }

        return new RegExp('^'+card+'$', (case_insensitive) ? 'i' : '');
    }
    
}

export default InquiryValidator;