<template>
  <v-card :disabled="!active" flat>
    <v-img
      :src="property.cover_image"
      class="white--text align-end"
      gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
      height="150px"
    >
      <v-card-title>
        <router-link
            :to="{ name: 'property.show', params: { property: property.id, _property: property}}"
            class="text-decoration-none white--text">
          <profile-avatar :profile="property" :size="40" />
          <span class="ml-2">{{ property.name }}</span>
        </router-link>
      </v-card-title>
    </v-img>
    <v-card-subtitle class="d-flex justify-space-between align-center">
      <div>
        <v-icon>mdi-map-marker</v-icon>  {{ property.address }}
        <div v-if="role" class="grey--text"><v-icon>mdi-account</v-icon> {{ role }}</div>
        <div v-if="!active" class="red--text">Inactive</div>
      </div>
      <v-spacer></v-spacer>
      <slot name="action" />
    </v-card-subtitle>

  </v-card>
</template>

<script>
    import ProfileAvatar from "@/components/ProfileAvatar.vue";

    export default {
        name: "PropertyCard",
      components: {ProfileAvatar},
        data(){
            return {
                property: {}
            }
        },
        props: {
            _property: Object
        },
        computed: {
          role() {
            if(this._property.access) return this._property.access.role;
            return null;
          },

          active() {
            return this._property.access && this._property.access.enabled;
          }
        },
       
        watch: {
            _property: {
                immediate: true,
                handler(property){
                    this.property = property;
                }
            }
        }
    }
</script>

