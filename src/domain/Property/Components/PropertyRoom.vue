<template>
     <v-card flat :loading="loading">
        <confirmation-dialog ref="deleteConfirmation" @confirmed="deleteRoom">
            <div class="text-center mt-5">
                <p>
                    Are you sure you want to delete the room
                </p>
                <h4>{{ data_room.title }}</h4>
            </div>
        </confirmation-dialog>
        <v-card-title class="d-flex flex-nowrap justify-space-between">
            <h4 class="text-truncate">{{ data_room.name }}</h4>
            <div class="d-flex">
                <v-btn v-if="room" @click="edit = !edit" icon>
                    <v-icon v-html="edit ? 'mdi-chevron-up' : 'mdi-chevron-down'"></v-icon>
                </v-btn>
                <v-btn color="error" icon @click="$refs.deleteConfirmation.open()">
                    <v-icon size="18">mdi-delete</v-icon>
                </v-btn>
            </div>
        </v-card-title>
        <v-card-text v-if="edit">
            <property-room-form 
            :room="data_room" 
            :disabled="$attrs.disabled" 
            :property="property" 
            @updated="roomUpdated"
            @cancel="edit = false"
            />
        </v-card-text>
    </v-card>
</template>

<script>
import PropertyRoomForm from './PropertyRoomForm';
import ConfirmationDialog from '@/components/Utilities/ConfirmationDialog';

import gql from "graphql-tag";

export default {
    name: "PropertyRoom",
    props: {
        property: Object,
        room: Object,
    },
    data(){
        return {
            loading: false,
            edit: false,
            data_room: {},
        }
    },
    components: {
        PropertyRoomForm, ConfirmationDialog
    },

    methods: {
        roomUpdated(room){
            this.data_room = room;
            this.edit = false;
        },

        deleteRoom() {
            this.loading = true;
            this.$store.dispatch('mutate', {
                mutation: gql`
                    mutation deletePropertyRoom($property_id: ID!, $room_id: ID!){
                        deletePropertyRoom(property_id: $property_id, room_id: $room_id)
                    }
                `,
                variables: {
                    property_id: this.property.id,
                    room_id: this.data_room.id,
                }
            }).then(response => {
                if(response.data.deletePropertyRoom) {
                    this.$emit('deleted', this.data_room)
                    this.$store.commit('SNACKBAR', {
                        status: true,
                        text: `Room deleted`,
                        color: 'success'
                    });
                }
            })
            .catch(e => {
                this.$store.commit('TOAST_ERROR', {
                    show: true,
                    retry: () => this.deleteRoom(),
                    message: 'Could not delete room. ',
                    exception: e
                })
                this.$emit('error', e);
            })
            .finally(() => {
                this.loading = false;
            })
        }

    },
    watch: {
        room: {
            immediate: true,
            handler(room){
                this.data_room = room
            }
        }
    }
}
</script>