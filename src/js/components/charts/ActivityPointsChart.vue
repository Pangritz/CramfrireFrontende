<template>
<div>
    <ApiErrorMessage :error="error" v-if="error" />
    
    <CramfireLoadingIndicator v-if="loading && !error" :height="300" /> 

    <div class="activity-points-chart-wrapper">
        <canvas ref="points_chart" :width="width" :height="height"></canvas>
        <div class="activity-points-wrapper">
            <div class="activity-points-all">{{points}}</div>
            <div>{{$t('points_today_label')}}</div>
            <div class="activity-points-today">{{points_today}}</div>
        </div>
    </div>
    
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
        },

        show_legend: {
            default: true,
            type: Boolean
        }
    },
    
    data(){
        return {
            loading: true,
            error: false,

            points: 0,
            points_today: 0,
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
            return http.get(`${process.env.VUE_APP_API_BASE_URL}/activity/points`)
                       .then((response) => {
                            this.points = response.data.data.activity_points;
                            this.points_today = response.data.data.activity_points_today;
                       })
                       .catch(handleApiError);
        },

        renderDiagram(){
            if( this.points !== 0 )
            {            
                // Diagramm rendern
                new Doughnut(this.$refs.points_chart, {
                    type: 'Doughnut',

                    data: {
                        labels: [this.$t('legend_today')],

                        datasets: [{
                            data: [
                                this.points_today, // Aktivitätspunkte nur von heute
                                this.points - this.points_today, // Alle ohne Heute
                            ],

                            backgroundColor: [
                                'rgba(25, 118, 210, 1)',
                                'rgba(25, 118, 210, 0.5)',
                            ],
                            borderWidth: 0,
                        }],
                    },

                    options: {
                        cutoutPercentage: 80,
                        legend: {
                            display: this.show_legend
                        },
                        tooltips: {
                            enabled: false
                        }
                    } 
                });
            }
            else
            {
                // ein "leeres" Diagramm rendern, welches 0 Punkte darstellen soll
                new Doughnut(this.$refs.points_chart, {
                    type: 'Doughnut',

                    data: {
                        datasets: [{
                            data: [1],
                            backgroundColor: ['#d1d1d1'],
                            borderWidth: 0,
                        }],
                    },

                    options: {
                        cutoutPercentage: 80,
                        legend: {
                            display: false
                        },
                        tooltips: {
                            enabled: false
                        }
                    } 
                });
            }
        }
    }
}
</script>

<style>
.activity-points-chart-wrapper { position: relative; }
.activity-points-wrapper {
    position: absolute;
    width: 100%;
    text-align: center;
    top: 50%;
    transform: translateY(-50%);

    font-size: 20px;
}
.activity-points-all { 
    font-size: 42px;
    font-weight: bold;
}

.activity-points-today {
    font-weight: bold;
}
</style>

<i18n>
{
    "de": {
        "chart_label": "Aktivitätspunkte",
        "points_today_label": "Davon heute:",
        "legend_today": "Heute"
    }    
}
</i18n>