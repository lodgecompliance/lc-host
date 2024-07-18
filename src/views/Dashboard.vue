<template>
  <app-layer ref="app" :breadcrumbs="breadcrumbsItems">
      <div v-if="$slots['header']" class="primary lighten-4 primary--text text--darken-4 px-7 py-3 mx-n3">
        <v-breadcrumbs v-if="breadcrumbs.length" :items="breadcrumbsItems">
          <template v-slot:divider>
            <v-icon>mdi-chevron-right</v-icon>
          </template>
        </v-breadcrumbs>
        <slot name="header" />
      </div>
      <data-container :loading="loading">
        <slot />
      </data-container>
    </app-layer>
  </template>

  <script>
  import { mapActions, mapGetters } from 'vuex';
  import AppLayer from "@/AppLayer";
  import DataContainer from "@/components/DataContainer";

  export default {
    name: 'Dashboard',
    components: { DataContainer, AppLayer},
    data(){
      return {
        loading: false,
      }
    },
    props: {
      title: { type: String, default: () => "Dashboard" },
      breadcrumbs: { type: Array, default: () => []},
    },
    computed: {
      ...mapGetters([
        'current_user',
        'dashboard'
      ]),
      breadcrumbsItems() {
        return [
          {
            text: "Home",
            to: { path: '/' }
          }
        ].concat(this.breadcrumbs || [])
      },
    },
    methods: {
      ...mapActions(['getDashboardData']),
      loadData() {
        this.loading = true;
        this.getDashboardData()
        .catch(e => {
            this.$store.commit('TOAST_ERROR', {
              show: true,
              retry: () => this.loadData(),
              message: `Couldn't load dashboard data.`,
              exception: e
            })
        })
        .finally(() => {
          this.loading = false
        })
      },
    },
    mounted() {
      if(!this.current_user.profile.auth.is_admin) {
        this.$store.commit("SET_MODE", "host");
        this.$router.push({ name: 'home' })
        return;
      }
      if(!this.dashboard) this.loadData();
    },
    watch: {

    }
  }
  </script>
