<template>
<div>
    <p class="headline">{{$t('title')}}</p>
    
    <p>{{$t('text')}}</p>

    <p>
        <v-btn color="primary" :to="{name:'cardbox.create'}">
            <v-icon left>add</v-icon> {{$t('button')}}
        </v-btn>
    </p>    
</div>
</template>

<i18n>
{
    "de": {
        "title": "Keine Karteikästen vorhanden",
        "text": "Lege Karteikästen wie \"Englisch Unit 1\" oder \"Spanischvokabeln für den Urlaub\" an, in denen du anschließlich die Karten mit den Vokabeln anlegen und verwalten kannst.",
        "button": "Karteikasten erstellen"
    }
}
</i18n>