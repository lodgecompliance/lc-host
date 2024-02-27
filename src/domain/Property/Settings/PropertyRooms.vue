<template>
    <section>
      <div class="d-flex flex-wrap justify-space-between">
        <slot name="heading" />
        <v-dialog width="350" v-model="createNewRoom">
          <template #activator="{ on }">
            <v-btn
                color="primary"
                title="New Room"
                depressed
                v-on="on">
              <v-icon dark> mdi-plus</v-icon> Create New
            </v-btn>
          </template>
          <property-room-form
              :property="property"
              @created="roomCreated"
              @cancel="createNewRoom = false"
          >
            <template #title>
              <v-card-title>
                Add Room
              </v-card-title>
            </template>
          </property-room-form>
        </v-dialog>
      </div>
      <data-container :loading="loading" :error="error" @retry="getPropertyRooms">
        <template v-slot:loading>
            <div  v-for="i in 4" :key="i">
                <v-skeleton-loader
                    type="card"
                    height="50"
                    class="my-2"
                ></v-skeleton-loader>
            </div>
        </template>

        <template v-if="rooms.length">
            <property-room
            v-for="room in rooms" :key="room.id"
            :property="property"
            :room="room"
            @deleted="roomDeleted"
            class="my-1" />
        </template>
        <template v-else>
            <div class="py-5 text-center">
                <p class="grey--text">No room yet</p>
            </div>
        </template>

    </data-container>
    </section>

</template>
<script>
import DataContainer from '../../../components/DataContainer.vue';
import PropertyRoomForm from "@/domain/Property/Components/PropertyRoomForm.vue";
import gql from "graphql-tag";
import PropertyRoom from "@/domain/Property/Components/PropertyRoom.vue";

export default {
    name: "PropertyRooms",
    components: {
      PropertyRoom,
      PropertyRoomForm,
      DataContainer
    },

    props: {
        property: Object
    },

    data(){
        return {
            loading: false,
            error: null,
            createNewRoom: false,
            rooms: [],
        }
    },

    methods: {
        getPropertyRooms(){
            this.loading = true;
            this.error = null;
             this.$store.dispatch('query', {
                query: gql`
                  query getPropertyById($id: ID!){
                      getPropertyById(id: $id){
                        rooms {
                            id
                            name
                            description
                            amount
                            available
                        }  
                      }
                  }`,
                variables: {
                    id: this.property.id
                }
            })
            .then(response => {
                this.rooms = response.data.getPropertyById?.rooms || []
            })
            .catch(e => {
                this.error = e
            })
            .finally(() => {
                this.loading = false;
            })
        },

        roomCreated(room){
            this.rooms.unshift(room);
            this.createNewRoom = false;
        },

       roomDeleted(room) {
            const index = this.rooms.findIndex(r => r.id === room.id);
            if(index >= 0) this.rooms.splice(index, 1);
        }

    },

    watch: {
        property: {
            immediate: true,
            handler(property){
                if(property) this.getPropertyRooms()
                else this.loading = false;
            }
        }
    }
}
</script>