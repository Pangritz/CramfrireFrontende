export default function(){
    return {
        // Objekt mit Daten des eingeloggten Nutzers, ansonsten false
        me: false,

        // Die Route, von der der checkAuth Guard auf die Login Seite weitergeleitet hat, 
        // weil der Nutzer nicht eingeloggt ist/war
        checkauth_route: null,
    }
}