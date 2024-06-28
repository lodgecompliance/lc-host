<template>
    <v-dialog 
        v-model="dialog"
        transition="dialog-bottom-transition" 
        scrollable   
        width="700"
      >
        <v-card>
            <v-card-title class="primary white--text">
                <h4>Reservation Contract</h4>
                <v-spacer></v-spacer>
                <conver-to-pdf v-if="pdfable" v-bind="contractPDF" />
            </v-card-title>
            <v-card-text>
                <reservation-checkin
                :reservation="reservation"
                :property="property"
                :checkin="checkin"
                />
            </v-card-text>
            <v-card-actions >
              <v-btn text color="red" @click="close">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import { mapActions } from 'vuex';
    import ConverToPdf from '../../../components/Utilities/convertToPdf.vue';
    import { contract as pdfContent } from '../Helpers/pdf';
    import ReservationCheckin from "@/domain/Reservation/Widgets/ReservationCheckin.vue";

    export default {
        name: "ReservationCheckinContract",
        mixins: [],
        components: {
          ConverToPdf,
          ReservationCheckin,
        },
        data(){
            return {
                dialog: false,
                error: null,
                signature: null,
                checkingin: false,
                creditCards: null,
            }
        },
        props: {
            reservation: Object,
            checkin: Object,
            property: Object,
            pdfable: Boolean
        },
        computed: {
            contractPDF() {
                return {
                    fileName: `${this.property.name} - Guest Registration`,
                    actions: ['open', 'print', 'download'],
                    metadata: {
                        title: `Reservation Contract at ${this.property.name}`,
                        author: `Guest registration (${this.property.name})`,
                        subject: `Reservation at ${this.property.name}`,
                        creator: "Guest Registration via pdfmake",
                        producer: "Guest Registration via pdfmake",

                    },
                    content: pdfContent(this.reservation, this.checkin),
                    iconsAttrs: {
                        icon: true,
                        dark: true,
                    }
                }
            }
        },

        methods: {
            ...mapActions([
                'mutate'
            ]),

            open(){
                this.dialog = true;
            },

            close(){
                this.dialog = false;
            },

        }
    }
</script>