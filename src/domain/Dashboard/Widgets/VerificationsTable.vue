<template>
  <v-data-table
      :headers="tableHeaders"
      :items="verifications"
      :search="search"
      v-on="$listeners"
      v-bind="$attrs"
  >
    <template v-slot:item.reference="{ item }">
      {{ item.reference | nullable }}
    </template>
    <template v-slot:item.user.full_name="{ item }">
      <router-link
          v-if="item.user"
          :to="{name: 'dashboard.user.show', params: {id: item.user.id}}"
          class="text-decoration-none"
      >
        <v-avatar size="30" class="mr-1">
          <img :alt="item.user.full_name"
               :src="item.user.image"
          >
        </v-avatar>
        {{ item.user.full_name }}
      </router-link>
    </template>

    <template v-slot:item.timestamp="{ item }">
      {{ momentFromTimestamp(item.timestamp).format('MMM D, YYYY') }}
    </template>

    <template v-slot:item.provider="{ item }">
      {{ item.provider | nullable }}
    </template>

    <template v-slot:item.document_type="{ item }">
      {{item.document_type | replace_underscore | ucfirstword | nullable}}
    </template>

    <template v-slot:item.status="{ item }">
      <v-chip
          v-if="item.status"
          small
          :color="statusColor[item.status.toLowerCase()] ? statusColor[item.status.toLowerCase()] : 'warning'" dark outlined>
        {{ item.status | ucfirstword }}
      </v-chip>
      <span v-else>{{ item.status | nullable }}</span>
    </template>

  </v-data-table>
</template>
<script>

import table from "@/mixins/table";
export default {
  name: "VerificationsTable",
  mixins: [table],
  components: { },
  data(){
    return {
      headers: [
        { text: 'Reference', align: 'start', value: 'reference', sortable: false },
        { text: 'User Account', align: 'left', value: 'user.full_name' },
        { text: 'Verification Date', align: 'center', value: 'timestamp' },
        { text: 'Provider', value: 'provider', sortable: false  },
        { text: 'Document Type', value: 'document_type', sortable: false  },
        { text: 'Status', value: 'status', sortable: false  },
      ],
      statusColor: {
        successful: "success",
        verified: "success",
        failed: "error"
      }
    }
  },
  props: {
    search: String,
    verifications: Array,
    columns: {type: Array, default: () => ["reference", "user.full_name", "timestamp", "provider", "document_type", "status"]}
  },
  watch: {
    reservations: {
      immediate: true,
      handler(verifications) {
        this.data = verifications || []
      }
    }
  }
}
</script>