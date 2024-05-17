<script lang="ts">
    import * as Alert from "$lib/components/ui/alert/";
    let {error} : {error : string} = $props()
</script>
   
<Alert.Root variant="destructive" class="bg-white">
    <Alert.Title>Oops!</Alert.Title>
    <Alert.Description
        >{error}</Alert.Description
    >
</Alert.Root>
