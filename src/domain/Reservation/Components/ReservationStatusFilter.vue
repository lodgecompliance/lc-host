<template>
  <v-select
      v-if="display === 'select'"
      :items="filters"
      item-text="label"
      item-value="value"
      v-model="statusFilter"
      deletable-chips
      v-bind="$attrs"
  >
    <template v-slot:selection="{ item }">
      <v-chip small
              close outlined
              :color="item.color"
              @click:close="statusFilter.splice(statusFilter.findIndex(s => s === item.value), 1)"
      >
        <span>{{ item.label }}</span>
      </v-chip>
    </template>
  </v-select>
  <div v-else-if="display === 'tile'">
    <v-chip
        v-for="filter in filters" :key="filter.value"
        close
        :outlined="!statusFilter.includes(filter.value)"
        :color="statusFilter.includes(filter.value) ? filter.color : 'grey'"
        @click="addFilter(filter)"
        @click:close="removeFilter(filter)"
        class="ma-1"
        v-bind="$attrs.chip"
    >
      <span>{{ filter.label }}</span>
    </v-chip>
  </div>
</template>
<script>
const STATUS_APPROVED = {
  label: 'Checkin Approved',
  value: 'checkin_approved',
  color: 'success',
}
const STATUS_NOT_CHECKIN = {
  label: 'Not Checked In',
  value: 'pending',
  color: 'warning'
}

const STATUS_CHECKIN_EXPIRED = {
  label: 'Checkin Expired',
  value: 'expired',
  color: 'error'
}

const STATUS_CHECKEDIN = {
  label: 'Checked In',
  value: 'checked_in',
  color: 'primary'
}

const STATUS_CHECKEDOUT = {
  label: 'Checked Out',
  value: 'checked_out',
  color: 'grey'
}

const STATUS_CANCELLED = {
  label: 'Cancelled',
  value: 'cancelled',
  color: 'error'
}
export default {
  name: "ReservationStatusFilter",
  data() {
    return {
      statusFilter: [],
    }
  },
  props: {
    includes: { type: Array, default: () => [] },
    display: { type: String, default: () => "select"}
  },
  computed: {
    filters() {
      const filters = [ STATUS_NOT_CHECKIN, STATUS_CHECKEDIN, STATUS_APPROVED, STATUS_CHECKIN_EXPIRED ];
      if(this.includes.includes('checkedout')) {
        filters.push(STATUS_CHECKEDOUT)
      }
      if(this.includes.includes('cancelled')) {
        filters.push(STATUS_CANCELLED)
      }
      return filters;
    },
  },
  methods: {
    addFilter(item) {
      if(this.statusFilter.findIndex(s => s === item.value) < 0) {
        this.statusFilter.push(item.value);
      }
    },
    removeFilter(item) {
      this.statusFilter.splice(this.statusFilter.findIndex(s => s === item.value), 1)
    }
  },
  watch: {
    statusFilter: {
      immediate: true,
      handler(filter) {
        this.$emit('input', filter);
      }
    }
  }
}
</script>
