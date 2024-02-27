<template>
    <div style="min-height:100%">
        <slot name="notice" />

        <v-snackbar v-model="snackbar.status" 
            :timeout="snackbar.timeout ? snackbar.timeout : 5000"
            :color="snackbar.color"
            top rounded transition="fade-transition"
            >
            <v-row justify="space-around" align="start">
                <v-col cols="11" class="my-0 py-0">
                  {{ snackbar.text ? snackbar.text.replace('GraphQL error:', '').trim() : "" }}
                </v-col>
                <v-col cols="1" class="my-0 py-0">
                    <v-btn icon x-small dark text @click="closeAlert" >
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
        </v-snackbar>

        <div v-if="$slots['header']" class="primary--text text--darken-4 px-3" :style="`padding-bottom: ${headerSpace}px`">
          <v-breadcrumbs v-if="breadcrumbItems.length > 1" :items="breadcrumbItems">
            <template v-slot:divider>
              <v-icon>mdi-chevron-right</v-icon>
            </template>
          </v-breadcrumbs>
          <slot name="header" />
        </div>

        <div :class="`px-1 px-sm-2`"
             :style="`${$slots['header'] ? `margin-top: -${headerSpace}px` : ''}`">
            <slot/>
        </div>
        
    </div>
</template>

<script>
    import {mapMutations, mapGetters} from 'vuex';

    export default {
      name: "AppLayer",
      components: {},
      data(){
          return {
          }
      },
      props: {
          breadcrumbs: Array,
          headerSpace: { type: Number, default: () => 80 }
      },
      computed:{
          ...mapGetters([
              'snackbar'
          ]),
        breadcrumbItems() {
            return [
              {
                text: "Home",
                to: { path: '/' }
              }
            ].concat(this.breadcrumbs || [])
        }
      },
      methods: {
          ...mapMutations([
              'SNACKBAR'
          ]),

          closeAlert(){
              this.SNACKBAR({
                  status: false,
              })
          },
      },
    }
</script>