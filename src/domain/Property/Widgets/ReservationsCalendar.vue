<template>
    <div>
        <v-sheet
        tile
        height="54"
        class="d-flex align-center"
        >
            <v-btn
                icon
                class="ma-2"
                @click="$refs.calendar.prev()"
            >
                <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <!-- <v-btn
                outlined
                class="ma-2"
                color="grey darken-2"
                @click="setToday"
            >
            Today
          </v-btn> -->
            <div class="ma-2" v-if="rangeMoment">
                {{ rangeMoment.start.format('LL')  }}<span v-if="rangeMoment.end"> - {{ rangeMoment.end.format('LL')  }}</span> 
            </div>
            <!-- <v-select
                v-model="type"
                :items="types"
                dense
                outlined
                hide-details
                class="ma-2"
                label="Type"
            ></v-select> -->
            <!-- <v-select
                v-model="mode"
                :items="modes"
                dense
                outlined
                hide-details
                label="event-overlap-mode"
                class="ma-2"
            ></v-select> -->
            <v-spacer></v-spacer>
            <v-select
                v-model="weekday"
                :items="weekdays"
                dense
                outlined
                hide-details
                label="Weekdays"
                class="ma-2"
            ></v-select>
            <v-btn
                icon
                class="ma-2"
                @click="$refs.calendar.next()"
            >
                <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
        </v-sheet>
        <v-sheet height="600">
        <v-calendar
            ref="calendar"
            color="primary"
            v-model="value"
            :weekdays="weekday"
            :type="type"
            :events="events"
            :event-overlap-mode="mode"
            :event-overlap-threshold="30"
            :event-color="getEventColor"
            @change="setRange"
            @click:event="showEvent"
        ></v-calendar>
            <!-- 
            @click:more="viewDay"
            @click:date="viewDay" 
            -->
        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
        >
          <v-card
            min-width="350px"
            flat
          >
            <v-toolbar
              :color="selectedEvent.color"
              dark
            >
            <v-btn
                icon dark
                @click="selectedOpen = false"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
              <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn v-if="selectedEvent.reservation" 
              icon :to="{name: 'property.reservation.show', params: { property: selectedEvent.reservation.property_id, reservation: selectedEvent.reservation.id, _reservation: selectedEvent.reservation}}">
                <v-icon>mdi-eye</v-icon>
              </v-btn>
              <v-btn v-if="selectedEvent.reservation" 
              icon :to="{name: 'property.reservation.show', params: { property: selectedEvent.reservation.property_id, reservation: selectedEvent.reservation.id, _reservation: selectedEvent.reservation}, query: {edit: 1}}">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </v-toolbar>
            <v-card-text v-if="selectedEvent.reservation">
              <reservation-details :reservation="selectedEvent.reservation" />
              <reservation-status :reservation="selectedEvent.reservation" />
            </v-card-text>
          </v-card>
        </v-menu>
        </v-sheet>
    </div>
</template>

<script>

import moment from 'moment';
import ReservationDetails from '../../Reservation/Components/ReservationDetails.vue';
import ReservationStatus from '../../Reservation/Components/ReservationStatus.vue';

const STATUS_APPROVED = {
    label: 'Checkin Approved',
    color: 'success',
}
const STATUS_NOT_CHECKIN = {
    label: 'Not Checked In',
    color: 'warning'
}

const STATUS_CHECKIN_EXPIRED = {
    label: 'Checkin Expired',
    color: 'red'
}

const STATUS_CHECKEDIN = {
    label: 'Checked In',
    color: 'primary'
}

export default {
    name: "PropertyReservationsCalendar",
    components: { ReservationDetails, ReservationStatus },

    data(){
        return {
            type: 'month',
            types: ['month', 'week', 'day', '4day'],
            mode: 'stack',
            modes: ['stack', 'column'],
            weekday: [0, 1, 2, 3, 4, 5, 6],
            weekdays: [
                { text: 'Sun - Sat', value: [0, 1, 2, 3, 4, 5, 6] },
                { text: 'Mon - Sun', value: [1, 2, 3, 4, 5, 6, 0] },
                { text: 'Mon - Fri', value: [1, 2, 3, 4, 5] },
                { text: 'Mon, Wed, Fri', value: [1, 3, 5] },
            ],
            value: '',
            events: [],
            selectedEvent: {},
            selectedElement: null,
            selectedOpen: false,
            range: null,
        }
    },
    props: {
        reservations: Array,
        search: String
    },

    computed: {
        rangeMoment() {
            if(!this.range) return null;
            return {
                start: moment(this.range.start.date),
                end: this.range.end ? moment(this.range.end.date) : null,
            }
        }
    },
    methods: {

        setRange({ start, end }) {
            this.range = { start, end };
        },

        // Get events for the time range
        getEvents () {
            this.events = this.reservations.filter(reservation => this.range.end ? moment(reservation.checkin_date).isBetween(this.range.start.date, this.range.end.date, 'day') : moment(reservation.checkin_date).isSame(this.range.start.date, 'day'))
            .map(reservation => {
                return  {
                    name: `${reservation.name} (${reservation.status.label})`,
                    start: reservation.checkin_date,
                    end: reservation.checkout_date,
                    color: reservation.status.color,
                    timed: true,
                    reservation
                }
            })
        },

        getEventColor (event) {
            return event.color
        },

        viewDay ({ date }) {
            this.type = 'day';
            this.setRange({ start: date, end: null })
        },

        setToday() {
            this.viewDay({ date: new Date() })
        },

        showEvent ({ nativeEvent, event }) {
            const open = () => {
                this.selectedEvent = event
                this.selectedElement = nativeEvent.target
                requestAnimationFrame(() => requestAnimationFrame(() => this.selectedOpen = true))
            }

            if (this.selectedOpen) {
                this.selectedOpen = false
                requestAnimationFrame(() => requestAnimationFrame(() => open()))
            } else {
                open()
            }
            nativeEvent.stopPropagation()
        },

     },

    mounted () {
      this.$refs.calendar.checkChange()
    },

    watch: {
        range: {
            immediate: false,
            handler(range) {
                this.getEvents(range)
            }
        },
        reservations: {
            immediate: false,
            handler() {
                this.getEvents(this.range)
            }
        }
    }

}
</script>