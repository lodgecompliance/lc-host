<template>
    <div class="d-flex justify-center align-center" style="height: 90vh">
        <p>{{message}}</p>
    </div>
</template>

<script>
export default {
    name: "PageLoading",
    props: {
        message: {
            type: String,
            default: () => 'Loading...'
        }
    }
}
</script>