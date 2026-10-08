<script>
    import logo from '#lib/assets/NameFontFinal.png';
</script>
<div class="NavBar">
    <a href="/">
        <img src={logo} alt="Cameron Pocisk"/>
    </a>
    <a href="/Boids">Boids</a>
    <a href="/UserInterface">User Interface</a>
    <a href="/ComputerGraphics">Computer Grahphics</a>
    <!-- <div style="margin-left: 3%;"></div> -->
</div>
<style>
.NavBar{
    width: 100%;
    height: 70px;
    background-color: var(--color-primary);
    /* color: var(--color-secondary); */
    color: var(--color-offWhite);
    display: flex; 
    justify-content: flex-end;
    align-items: center;
    /* width: 100vw; The full Viewport with (Screen no matter what), dont need but good to see */
}
/* NavBar links */
.NavBar a{
    margin-right: 20px;
}
/* The logo */
.NavBar a img{
    height: 60px;
    width: auto;
    filter: invert();
}
/* Make the first element left alligned. */
.NavBar a:first-child {
  margin-right: auto;
  margin-left: 10px;
}

</style>
