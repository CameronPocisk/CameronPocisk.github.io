<!-- This file gets added to all of its children. Going to use it to add the navbar in automatically -->
<script>
    import './layout.css';
    import Navbar from "#lib/Navbar.svelte";
    let { children } = $props();
</script>

<Navbar/>

{@render children()}
