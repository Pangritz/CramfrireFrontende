<template>
<div :class="['learning-status', this.background]" :style="status_styles">
    <div :class="known_classes" :style="known_styles"></div>
    <div :class="unknown_classes" :style="unknown_styles"></div>
    
    <div :class="['learning-status-caption', this.caption_color+'--text']" :style="caption_styles">{{known}}%</div>
</div>
</template>

<script>
export default {
    props: {
        height: {
            default: 20,
            type: Number
        },

        known: {
            default: 0,
            type: Number
        },

        unknown: {
            default: 0,
            type: Number
        },

        known_color: {
            default: "success",
            type: String
        },
        
        unknown_color: {
            default: "error",
            type: String
        },

        caption_color: {
            default: "white",
            type: String
        },

        background: {
            default: "grey",
            type: String
        }
    },

    computed: {
        status_styles(){
            return {
                height: this.height+'px'
            }
        },

        caption_styles(){
            return {
                "font-size": Math.floor(this.height * 0.8) + 'px',
                "line-height": this.height + 'px'
            }
        },

        known_classes(){
            return [
                'learning-status-bar',
                this.known_color,
            ];
        },

        known_styles(){
            return {
                width: this.known + '%',
            }
        },
    
        unknown_classes(){
            return [
                'learning-status-bar',
                this.unknown_color,
            ];
        },

        unknown_styles(){
            return {
                width: this.unknown + '%',
            }
        },

    }
}
</script>

<style>
.learning-status {
    position: relative;
    overflow: hidden;
}

.learning-status-caption {
    text-align: center; 
    position: absolute;
    width: 100%;
    height: 100%;
}

.learning-status-bar {
    float: left;
    height: 100%;
}
</style>