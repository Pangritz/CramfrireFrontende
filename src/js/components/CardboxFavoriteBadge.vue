<template>

    <div class="cardbox-favorite-badge">
        <v-icon small>star</v-icon>
    </div>

</template>

<style lang="scss">
.cardbox-favorite-badge {
    position: absolute;
    border: 20px solid #fb8c00;
    border-right-color: transparent !important;
    border-bottom-color: transparent !important;
    background: transparent !important;

    i {
        position: absolute;
        color: #fff !important;
        left: -17px;
        top: -17px;
    }
}
</style>