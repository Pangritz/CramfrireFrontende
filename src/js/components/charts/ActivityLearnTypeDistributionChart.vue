<template>
<div>
    <ApiErrorMessage :error="error" v-if="error" />
    
    <CramfireLoadingIndicator v-if="loading && !error" :height="300" /> 

    <canvas ref="learn_type_distribution_chart" :width="width" :height="height"></canvas>
</div>
</template>

<script>
import ApiErrorMessage from "../ApiErrorMessage"
import CramfireLoadingIndicator from "../CramfireLoadingIndicator"
import http from "../../http"
import { Doughnut } from 'chart.js'
import { handleApiError } from '../../structs/ApiError';

export default {
    components: {
        ApiErrorMessage,
        CramfireLoadingIndicator
    },

    props: {
        // Die Größe gibt nur an, welches Seitenverhältnis das Diagramm hat.
        // height 2 und width 4 sind also das gleiche wie height 200 und width 400
        height: {
            default: 1,
            type: Number
        },

        width: {
            default: 1, 
            type: Number
        }
    },
    
    data(){
        return {
            loading: true,
            error: false,

            dataset: null
        }
    },

    mounted(){
        this.loadData()
            .then(() => {
                this.renderDiagram();
                this.loading = false;
            })
            .catch((error) => {
                this.error = error;
                this.loading = false;
            });
    },

    methods: {
        loadData(){
            return http.get(`${process.env.VUE_APP_API_BASE_URL}/activity/learn_type_distribution`)
                       .then((response) => {
                            this.dataset = response.data.data;
                       })
                       .catch(handleApiError);
        },

        renderDiagram(){
            new Doughnut(this.$refs.learn_type_distribution_chart, {
                type: 'Doughnut',

                data: {
                    labels: [
                        this.$t('meaning_label'),
                        this.$t('spelling_label'),
                        this.$t('test_label')
                    ], 
                    datasets: [{
                        data: [
                            this.dataset.meaning,
                            this.dataset.spelling,
                            this.dataset.test
                        ],

                        backgroundColor: [
                            'rgba(25, 118, 210, 1)',
                            'rgba(251, 140, 0, 1)',
                            'rgba(255, 82, 82, 1)',
                        ]
                    }],
                },

                options: {
                    cutoutPercentage: 50
                } 
            });
        }
    }
}
</script>

<i18n>
{
    "de": {
        "meaning_label": "Bedeutung",
        "spelling_label": "Schreibweise",
        "test_label": "Vokabeltest"
    }    
}
</i18n>