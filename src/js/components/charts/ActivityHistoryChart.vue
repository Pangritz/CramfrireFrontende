<template>
<div>
    <ApiErrorMessage :error="error" v-if="error" />
    
    <CramfireLoadingIndicator v-if="loading && !error" :height="300" /> 

    <canvas ref="overview_chart" :width="width" :height="height"></canvas>
</div>
</template>

<script>
import ApiErrorMessage from "../ApiErrorMessage"
import CramfireLoadingIndicator from "../CramfireLoadingIndicator"
import http from "../../http"
import { Line } from 'chart.js'
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
            default: 2,
            type: Number
        },

        width: {
            default: 4, 
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

            history: null
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
            return http.get(`${process.env.VUE_APP_API_BASE_URL}/activity/history`)
                       .then((response) => {
                            this.history = this.createHistory(response.data.data);
                       })
                       .catch(handleApiError);
        },

        createHistory(data){
            var one_day_in_ms = 1000 * 60 * 60 * 24;
            var now = Date.now();
            var day_date, year, month, day, key;
            var history = {}, history_key;

            for(var i=0; i < 30; i++)
            {
                day_date = new Date(now - (i * one_day_in_ms));
                
                year = day_date.getUTCFullYear();
                
                month = day_date.getUTCMonth() + 1;
                month = month > 9 ? month : '0'+month;
                
                day = day_date.getUTCDate();
                day = day > 9 ? day : '0'+day;

                key = year+'-'+month+'-'+day;
                history_key = day_date.getUTCDate()+'.'+(day_date.getUTCMonth()+1);

                if( key in data === false )
                {
                    // Keine Aktivitäten an diesem Tag vorhanden
                    history[history_key] = 0;
                }
                else
                {
                    // Aktivitäten an diesem vorhanden => übernehmen
                    history[history_key] = data[key].activity_points;
                }
            }

            return history;
        },

        renderDiagram(){
            var labels = [], data = [];

            for(var key in this.history)
            { 
                labels.push(key);
                data.push(this.history[key]);
            }

            labels.reverse();
            data.reverse();
        
            new Line(this.$refs.overview_chart, {
                type: 'line',
                data: {
                    labels, 
                    datasets: [{
                        label: this.$t('chart_label'),
                        data,
                        backgroundColor: 'rgba(25, 118, 210, 0.4)',
                        borderColor: 'rgba(25, 118, 210, 0.6)',
                        borderWidth: 2,
                    }],
                }, 
                options: {
                    legend: {
                        display: this.show_legend
                    },
                }
            });
        }
    }
}
</script>

<i18n>
{
    "de": {
        "chart_label": "Aktivitätspunkte"
    }    
}
</i18n>