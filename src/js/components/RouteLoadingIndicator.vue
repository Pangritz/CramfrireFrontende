<template>
<div class="route-loading-indicator">
    <div class="route-loading-indicator-bar primary"></div>
</div>
</template>

<style>
.route-loading-indicator {
    position: absolute;
    width: 100%;
    height: 7px;
    z-index: 999;
}

.route-loading-indicator-bar {
    height: 7px;  
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    will-change: left, right;
    width: auto;
    -webkit-animation: route-loading-indicator-animation;
    animation: route-loading-indicator-animation;
    -webkit-animation-duration: 2s;
    animation-duration: 2s;
    -webkit-animation-iteration-count: infinite;
    animation-iteration-count: infinite;
    -webkit-animation-delay: -0.3s;
    animation-delay: -0.3s;
}

@-webkit-keyframes route-loading-indicator-animation {
  0% {
    left: -45%;
    right: 100%;
  }
  50% {
    left: 35%;
    right: 20%;
  }
  100% {
    left: 100%;
    right: -45%;
  }
}

@keyframes route-loading-indicator-animation {
  0% {
    left: -45%;
    right: 100%;
  }
  50% {
    left: 35%;
    right: 20%;
  }
  100% {
    left: 100%;
    right: -45%;
  }
}
</style>