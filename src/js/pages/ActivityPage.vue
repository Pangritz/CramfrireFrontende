<template>
<v-layout wrap>
    <v-flex xs12>
        <PageTitle :text="$t('page_title')" icon="bar_chart">
            <span class="title" :class="{'d-block': $vuetify.breakpoint.xs}">{{$t('page_subtitle')}}</span>
        </PageTitle>

        <div class="text-center title mt-12" v-if="no_activity">
            <div><v-icon large color="red">warning</v-icon></div>
            <div>{{$t('no_activity_hint')}}</div>
        </div>
    </v-flex>

    <v-flex xs12 sm6 md4 pb-6 mb-6 v-if="!no_activity">
        <div class="headline mb-2">{{$t('activity_points_title')}}</div>
        <ActivityPointsChart />
    </v-flex>

    <v-flex xs12 sm6 md4 offset-md4 pb-6 mb-6 v-if="!no_activity">
        <div class="headline mb-2">{{$t('learn_type_distribution_title')}}</div>
        <ActivityLearnTypeDistributionChart />
    </v-flex>

    <v-flex xs12 v-if="!no_activity">
        <div class="headline mb-2">{{$t('history_title')}}</div>
        <ActivityHistoryChart :show_legend="false" />
    </v-flex>

</v-layout>
</template>

<script>
import ActivityHistoryChart from "../components/charts/ActivityHistoryChart"
import ActivityLearnTypeDistributionChart from "../components/charts/ActivityLearnTypeDistributionChart"
import ActivityPointsChart from "../components/charts/ActivityPointsChart"
import PageTitle from "../components/PageTitle"
import http from "../http"

export default {
    
    components: {
        ActivityHistoryChart,
        ActivityLearnTypeDistributionChart,
        ActivityPointsChart,
        PageTitle,
    },

    data(){
        return {
            no_activity: false,
        }
    },

    mounted(){
        //TODO: Hier wird ein Request doppel durchgeführt. Das sollte in Zukunft möglichst nicht notwendig sein.
        // Am besten für die Aktivitäten ein Vuex Store Modul erstellen und von dort das Ergebnis des Requests des Diagrams für die Aktivitätspunkte abfragen.
        http.get(`${process.env.VUE_APP_API_BASE_URL}/activity/points`)
            .then((response) => {
                if( response.data.data.activity_points === 0 )
                {
                    this.no_activity = true;
                }
            })
            .catch(() => {});
    }    
    
}
</script>

<i18n>
{
    "de": {
        "page_title": "Aktivitätsübersicht",
        "page_subtitle": "Letzten 30 Tage",

        "activity_points_title": "Aktivitätspunkte",
        "learn_type_distribution_title": "Nutzung der Lernarten",
        "history_title": "Aktivität",

        "no_activity_hint": "Keine Aktivitäten in den letzten 30 Tagen vorhanden."
    }
}
</i18n>