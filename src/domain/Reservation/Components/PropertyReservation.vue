<template>
     <router-link :to="{name: 'property.reservation.show', params: { property: reservation.property_id, reservation: reservation.id, _reservation: reservation }}" class="text-decoration-none" >
        <v-card outline>
            <v-card-text>
                <div class="text-center">
                    <v-avatar color="primary" size="100">
                        <v-img
                        :src="reservation.property.image"
                        ></v-img>
                    </v-avatar>
                </div>
                <h4>Guest: {{reservation.name}}</h4>
                <p  v-if="reservation.already_checkedin" class="success--text">checked in {{reservation.checkedin_at | timestamp_to_date('day mName, year. diff')}}</p>
                <p v-else class="gray--text">waiting for checkin</p>
            </v-card-text>
            <v-card-actions>
                <v-chip
                    class="ma-2"
                    :color="`${reservation.approved ? `teal` : `warning`}`"
                    text-color="white"
                    >
                    <v-avatar left>
                        <v-icon>mdi-checkbox-marked-circle</v-icon>
                    </v-avatar>
                    {{reservation.approved ? `Approved`: `Pending`}}
                </v-chip>                           
            </v-card-actions>
        </v-card>
    </router-link>
</template>

<script>
    export default {
        name: "PropertyReservation",
        data(){
            return {
                reservation: this._reservation
            }
        },
        props: ['_reservation'],
        computed:{

        },
        methods:{
            
        },
        watch: {
            _reservation: function (r){
                this.reservation = r
            }
        }
    }
</script>

<style scoped>

</style>
