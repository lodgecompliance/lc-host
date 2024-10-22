<template>
  <a :href="authUrl" target="_blank"><slot /></a>
</template>

<script>
import Lc from "@/lc";
export default {
  name: "AccountLink",
  props: {
    path: String,
  },
  computed: {
    authUrl(){
      return Lc.link(this.path)
    }
  }
}
</script>