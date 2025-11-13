<template functional>
<div :class="{ 'only-on-print': props.only_on_print }">
    <div class="print-list-header">
        <h1 class="mb-1" v-if="props.title">{{props.title}}</h1>
        <p class="multiline-text" v-if="props.text">{{props.text}}</p>
    </div>
    <div class="print-test">
        <div class="print-list-row" v-for="card in props.cards" :key="card.id">
            <div class="print-list-column px-2 py-6">
                <div class="multiline-text">{{card.question}}</div>
                <div class="multiline-text mt-2"
                    :class="{'grey--text': props.info_color_light}"
                    v-if="props.with_info === true">{{card.question_info}}</div>
            </div>

            <div class="print-list-column px-2 py-6">
                <div class="multiline-text">{{card.solution}}</div>
                <div class="multiline-text mt-2"
                    :class="{'grey--text': props.info_color_light}"
                    v-if="props.with_info === true">{{card.solution_info}}</div>
            </div>
        </div>
    </div>
</div>
</template>

<style>
.only-on-print { display: none; }

.print-list-row { 
    overflow: auto; 
    display: flex;
    border: 1px solid #000;
    page-break-inside: avoid; /* Alte CSS Eigenschaft, aber zur Sicherheit noch dazu geschrieben, für bestmöglichen Support */
    break-inside: avoid;
}

.print-list-column { 
    float: left;
    width: 50%; 
}

.print-list-column:last-of-type { border-left: 1px solid #000; }

@media print {
    .only-on-print { display: block; }
}
</style>
