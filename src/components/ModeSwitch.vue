<template>
  <v-menu v-if="applicableModes.length > 1" offset-y>
    <template v-slot:activator="{ on }">
      <v-list-item v-on="on">
        <v-list-item-avatar :color="modes[mode].color" >
          <profile-avatar size="35" :profile="profile" />
        </v-list-item-avatar>
        <v-list-item-content v-if="!$vuetify.breakpoint.xsOnly">
          <v-list-item-title>{{ current_user.profile.full_name }}</v-list-item-title>
          <v-list-item-subtitle>{{ modes[mode].label }}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action class="ml-n3">
          <v-icon>mdi-menu-down</v-icon>
        </v-list-item-action>
      </v-list-item>
    </template>
    <v-list>
      <v-subheader><v-icon>mdi-swap-horizontal</v-icon> Switch Mode</v-subheader>
      <v-divider></v-divider>
      <template v-for="mode in applicableModes">
        <v-list-item
            :key="`m-${mode}`"
            @click="setMode(mode)"
        >
          <v-list-item-avatar :color="modes[mode].color" >
            <profile-avatar size="35" :profile="profile" />
          </v-list-item-avatar>
          <v-list-item-content class="ml-2">
            <v-list-item-title>{{ modes[mode].label }}</v-list-item-title>
            <v-list-item-subtitle>{{ modes[mode].description }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>
  </v-menu>
  <v-list-item v-else>
    <v-list-item-avatar :color="modes[mode].color" >
      <profile-avatar size="35" :profile="profile" />
    </v-list-item-avatar>
    <v-list-item-content v-if="!$vuetify.breakpoint.xsOnly">
      <v-list-item-title>{{ current_user.profile.full_name }}</v-list-item-title>
      <v-list-item-subtitle>{{ modes[mode].label }}</v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
import {mapGetters, mapMutations} from "vuex";
import ProfileAvatar from "@/components/ProfileAvatar.vue";

export default {
  name: "ModeSwitch",
  components: {ProfileAvatar},
  data() {
    return {
      modes: {
        host: {
          color: "secondary",
          label: "Host",
          description: "Manage your properties and reservations as host"
        },
        admin: {
          color: "success",
          label: "Admin",
          description: "Access and manage admin dashboard"
        }
      }
    }
  },
  computed: {
    ...mapGetters([ 'mode', 'current_user', 'is_admin' ]),
    profile() {
      return {
        first_name: this.current_user.profile.first_name,
        last_name: this.current_user.profile.last_name,
        image: this.current_user.profile.image || this.avatar
      }
    },
    hasAnyProperty(){
      return this.current_user.properties && this.current_user.properties.length
    },
    applicableModes() {
      const modes = ["host"];
      if(this.is_admin) {
        modes.push("admin")
      }
      return modes;
    }
  },
  methods: {
    ...mapMutations([ "SET_MODE"]),
    setMode(mode) {
      this.SET_MODE(mode);
      if(this.$route.name !== 'home') {
        this.$router.push({ path: '/' })
      }
    }
  }
}
</script>

<style>
.theme--dark.v-badge .v-badge__badge::after {
  border-color: #FFFFFF !important;
}
</style>