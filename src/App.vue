<template>
  <!-- App.vue -->
  <v-app>
    <nav-drawer
        v-if="authenticated && app_ready && app_layout === 'full'"
        @signout="signUserOut" />
    <v-app-bar
      app
      color="white"
      light
      v-if="app_ready && app_layout === 'full'"
      elevation="0"
    >
      <v-app-bar-nav-icon
          v-if="$vuetify.breakpoint.mobile && authenticated && app_ready && app_layout === 'full'"
          @click="$store.state.navDrawer = !$store.state.navDrawer"
         ></v-app-bar-nav-icon>
      <router-link to="/" class="text--primary text-decoration-none">
        <v-toolbar-title v-if="$vuetify.breakpoint.mdAndUp || mode !== 'host'" dark>
          <span>{{ config.app.name }}</span>
        </v-toolbar-title>
      </router-link>
      <template v-if="mode === 'host'">
        <property-switch class="ml-2" />
        <v-btn
            v-if="current_user.property && $vuetify.breakpoint.mdAndUp"
            :disabled="!current_user.property.active"
            class="mx-2"
            color="primary"
            text
            @click="$refs.createReservation.open()"
        >
          <v-icon light>mdi-plus</v-icon>
          <span class="d-none d-md-inline"> New Reservation</span>
        </v-btn>
      </template>
      <v-spacer></v-spacer>
      <div class="mr-n6">
        <mode-switch v-if="$store.getters.mode" />
      </div>
    </v-app-bar>

    <!-- Sizes your content based upon application components -->
    <v-main v-if="app_ready">
      <reservation-form-dialog
          v-if="current_user.property"
          :property="current_user.property"
          ref="createReservation"
      />
      <router-view v-if="!auth_required"></router-view>
      <v-btn
          v-if="mode === 'host' && current_user.property  && $vuetify.breakpoint.mdAndDown"
          :disabled="!current_user.property.active"
          color="primary"
          dark
          fab
          bottom right fixed
          class="mb-10"
          @click="$refs.createReservation.open()"
      >
        <v-icon light>mdi-plus</v-icon>
      </v-btn>
    </v-main>
    <v-main v-else>
      <div  class="d-flex justify-center align-center" style="height: 80vh">
        <div v-if="error" >
          <error-handler :error="error" @retry=" updateExists ? refreshApp : reloadApp" />
          <div v-if="updateExists" class="text-center">
            <h2>This might be due to outdated version, please update the application</h2>
          </div>
        </div>
        <div v-else class="text-center">
          <img src="@/assets/img/logo.png" width="100px" class="loader" />
          <p>{{app_process}}</p>
        </div>
      </div>
    </v-main>

    <v-snackbar v-if="app_layout === 'full'" top right :value="updateExists" :timeout="-1" color="primary">
      <v-row justify="space-around" align="start">
        <v-col cols="9" class="my-0 py-0">
          An update is available
        </v-col>
        <v-col cols="3" class="my-0 py-0">
          <v-btn text small dark @click="refreshApp" >
            Update
          </v-btn>
        </v-col>
      </v-row>
    </v-snackbar>

    <v-footer app>
      <a
          v-if="auth.profile"
          class="d-flex align-center text-decoration-none"
          :href="authDomain"
          target="_blank"
          >
        <profile-avatar size="24" :profile="auth.profile" />
        <h6 class="ml-2">{{ auth.profile.full_name }}</h6>
      </a>
      <v-spacer></v-spacer>
      <v-btn x-small @click="updateApp" title="Reload app" icon><v-icon>mdi-refresh</v-icon></v-btn>
    </v-footer>
  </v-app>
</template>

<script>

import {mapActions, mapMutations, mapGetters} from 'vuex'
import CryptoJS from 'crypto-js';
import NavDrawer from '@/components/NavDrawer.vue';
import appHelper from '@/helper/app';
import update from './mixins/update';
import config from './config';
import ModeSwitch from "@/components/ModeSwitch";
import ProfileAvatar from "@/components/ProfileAvatar.vue";
import PropertySwitch from "@/domain/Property/Components/PropertySwitch.vue";
import ErrorHandler from "@/components/ErrorHandler.vue";
import ReservationFormDialog from "@/domain/Reservation/Components/ReservationFormDialog.vue";

export default {
  name: 'App',
  mixins: [update],
  components: {
    ReservationFormDialog,
    ErrorHandler,
    PropertySwitch,
    ProfileAvatar,
    ModeSwitch,
    NavDrawer
  },
  data(){
    return {
      authDomain: config.app.authDomain,
      error: null,
      showAuth: false,
    }
  },

  computed:{
    ...mapGetters([
      'config',
      'app_ready',
      'app_process',
      'authenticated',
      'profile_loaded',
      'app_layout',
      'current_user',
      'is_mobile',
      'is_admin',
      'system',
      'auth',
      'mode',
      'auth_required',
      'auth_params'
    ]),

    plainLayoutRoutes() {
      return ["oauth.zapier"]
    },

    layout() {
      return this.plainLayoutRoutes.includes(this.$route.name)
      ? 'plain' : 'full'
    },
  },

    methods:{

      ...mapActions([
          'syncAuthUser',
          'getSystemParams',
          'signout',
          'signedOut',
          'query',
          'mutate'
      ]),
      
      ...mapMutations([
          'SET_AUTH',
          'SET_AUTH_REQUIRED',
          'TOAST_ERROR',
          'SET_APP_STATE',
          'SET_ACTIVE_PROPERTY',
          'SNACKBAR',
          'UNSET_CURRENT_USER',
          'SET_APP_LAYOUT',
          'SET_MOBILE',
          'SET_MODE'
      ]),

      setUser(){
          this.error = null;
          this.SET_APP_STATE(!!this.auth.token && !!this.current_user.profile);
          this.syncAuthUser()
          .then(() => {
            this.SET_APP_STATE(!!this.current_user.profile);
          })
          .catch(e => {
            if(this.updateExists) this.refreshApp();
            // else this.error = e
          })
          .finally(() => {
              this.bootIntercom();
          })
      },

      bootIntercom() {
        if(config.intercom.app_id && this.auth?.profile) {
          this.$intercom.boot({
            user_id: this.auth.profile.id,
            name: this.auth.profile.full_name,
            email: this.auth.profile.email,
            user_hash: CryptoJS.HmacSHA256(this.auth.profile.id, config.intercom.secret_key).toString(),
            hide_default_launcher: false
          })
        }
      },

      signUserOut(){
        this.SET_APP_STATE(false)
        this.signout()
        .then(() => {
            this.$intercom?.shutdown();
            this.signedOut();
        }).finally(() => {
          this.SET_APP_STATE(true);
        })
      },
    },

    mounted() {
      this.getSystemParams().then(() => {
        const critical = appHelper.checkForCriticalUpdate()
        if(critical) {
          if(appHelper.useServiceWorker()) {
            this.updateCritical = critical;
            this.refreshApp()
          } else this.updateApp();
          return Promise.reject(
              "Cannot start application, critical update is required. Hold on while application is rebooted"
          )
        } else this.setUser()
      })
      .catch(e => {
        console.log(e);
      });
    },

    created() {
        this.SET_MOBILE( screen.width < 768);
        window.addEventListener('resize', (e) => {
          this.SET_MOBILE( screen.width < 768)
        })
    },

    watch: {
      $route: {
        immediate: true,
        handler() {
          this.$store.commit( 'SET_APP_LAYOUT', this.layout);
        }
      }
    }
}
</script>

<style>
  .theme--light.v-application {
    background-color: #f7f7f7 !important;
  }
   /* .theme--light.v-application {
        background-image: url('./assets/img/signin-bg.png') !important;
        background-position: center center !important;
        background-size: cover !important;
        background-repeat: no-repeat !important;
        background-attachment: fixed !important;
    } */
  .required label::after {
    content: "*";
  }

  .loader {
    animation: fadeInfadeOut 1.5s linear 0s infinite;
  }

  .striped tbody tr:nth-of-type(odd) {
    background: #F7FBFF;
  }
  .striped tbody tr:nth-of-type(even) {
    background: #FFFFFF;
  }

  .theme--light.v-data-table.striped > .v-data-table__wrapper > table > tbody > tr:not(:last-child) > td:not(.v-data-table__mobile-row),
  .theme--light.v-data-table.striped > .v-data-table__wrapper > table > tbody > tr:not(:last-child) > th:not(.v-data-table__mobile-row)
  {
    border: none;
  }
  .theme--light.v-data-table.striped > .v-data-table__wrapper > table > tbody > tr:nth-of-type(odd):hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper)
  {
    background: #F7FBFF;
  }
  .theme--light.v-data-table.striped > .v-data-table__wrapper > table > tbody > tr:nth-of-type(even):hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper)
  {
    background: #FFFFFF;
  }
  .theme--light.v-tabs-items {
    background-color: inherit !important;
  }
  @keyframes fadeInfadeOut {
    0% {
      opacity: 0.2;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.2;
    }
  }
  .text-transform-unset {
    text-transform: unset !important;
  }
  .box-shadow-unset {
    box-shadow: unset !important;
    -webkit-box-shadow: unset !important;
  }

</style>
