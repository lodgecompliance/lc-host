<template>
  <v-card flat :loading="loading">
      <slot name="title" />
      <v-card-text>
        <v-form ref="form">
          <v-text-field
              outlined dense
              label="Name"
              :rules="[rules.required, (value) => rules.max(value, 40)]"
              type="text"
              v-model="form.name"
              counter="40"
          ></v-text-field>
          <v-textarea
            outlined dense
            label="Description"
            v-model="form.description"
            :rules="[]"
            ></v-textarea>
          <v-text-field
              outlined dense
              label="Amount"
              :prefix="property.default_currency"
              type="number"
              :rules="[rules.required, (value) => value > 0 || 'Enter a valid amount']"
              v-model="form.amount"
          >
          </v-text-field>
          <v-switch dense inset v-model="form.available" label="Available" color="primary"></v-switch>
        </v-form>
        <error-handler :error="formError" />
      </v-card-text>
      <v-card-actions>
          <v-btn text color="red" @click="$emit('cancel')">Cancel</v-btn>
          <v-btn color="primary" :loading="submitting" @click="submit" depressed>Submit</v-btn>
      </v-card-actions>
  </v-card>
</template>

<script>
import form from "@/mixins/form";
import gql from "graphql-tag";
import ErrorHandler from "@/components/ErrorHandler.vue";

export default {
    name: "PropertyRoomForm",
    mixins: [form],
    components: {ErrorHandler},
    props: {
        room: Object,
        property: Object,
    },
    data(){
        return {
            loading: false,
        }
    },

    methods: {
      setForm() {
        const room = this.room || {};
        this.form = {
          name: room.name || null,
          description: room.description || null,
          amount: room.amount || null,
          available: room.available || false
        };
      },
      submission(){
          if(!this.$refs.form.validate()) return Promise.reject();
          this.form.amount = parseFloat(this.form.amount);

          if(this.room) return this.updateRoom();
          else return this.createRoom();
      },
      createRoom(){
        return new Promise((resolve, reject) => {
          this.$store.dispatch('mutate', {
            mutation: gql`
                  mutation createPropertyRoom($property_id: ID!, $data: PropertyRoomInput!){
                      createPropertyRoom(property_id: $property_id, data: $data){
                          id
                          name
                          description
                          amount
                          available
                      }
                  }
              `,
            variables: {
              property_id: this.property.id,
              data: this.form
            }
          }).then(response => {
            this.$emit('created', response.data.createPropertyRoom);
            this.$store.commit('SNACKBAR', {
              status: true,
              text: `Room created`,
              color: 'success'
            });
            this.$refs.form.reset();
            resolve();
          }).catch(e => reject(e))
        })

      },

      updateRoom(){
            return new Promise((resolve, reject) => {
              this.$store.dispatch('mutate', {
                mutation: gql`
                  mutation updatePropertyRoom($property_id: ID!, $room_id: ID!, $data: PropertyRoomInput!){
                      updatePropertyRoom(property_id: $property_id, room_id: $room_id, data: $data){
                          id
                          name
                          description
                          amount
                      }
                  }
              `,
                variables: {
                  property_id: this.property.id,
                  room_id: this.room.id,
                  data: this.form
                }
              }).then(response => {
                this.$emit('updated', response.data.updatePropertyRoom);
                this.$store.commit('SNACKBAR', {
                  status: true,
                  text: `Room updated`,
                  color: 'success'
                });
                resolve();
              }).catch(e => reject(e))
            })
        },
    },

    watch: {
        room: {
            immediate: true,
            handler(){
                this.setForm();
            }
        },
    }
}
</script>