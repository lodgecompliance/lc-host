<template>
    <v-container class="text-center">
        <v-row justify="center">
            <v-col cols="12" md="6" class="text-center">
              <v-skeleton-loader
                  boilerplate
                  type="list-item-avatar-three-line, image"
              ></v-skeleton-loader>
            </v-col>
        </v-row>
        
    </v-container>
    
</template>
<script>
export default {
    name: "PropertySkeleton"
}
</script>