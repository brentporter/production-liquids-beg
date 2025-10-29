<template>
  <v-app>
  <div class="app-container">
    <AppHeader />
    <div class="main-layout mt-12">
      <aside class="sidebar" style="background-color: #000000" :class="{ open: sidebarOpen }">
        <button class="sidebar-close" v-show="sidebarOpen" @click="sidebarOpen = !sidebarOpen">×</button>
        <MapControls />
      </aside>
      <main class="content justify-center overflow-y-scroll" style="">
        <button class="menu-toggle" style="color: #000000" v-show="!sidebarOpen" @click="sidebarOpen = !sidebarOpen">☰</button>
        <router-view />
      </main>
    </div>
  </div>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import MapControls from './components/MapControls.vue'
import MapView from './views/MapView.vue'

const sidebarOpen = ref(true)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
:deep(.v-data-table) {
  overflow: visible;
}

:deep(.v-table__wrapper) {
  overflow: visible;
}

.v-table{
  margin-left: 7rem;
}

.v-table thead th {
  background-color: #c7c7c7;
  font-weight: bold !important;
  color:black;
  /*  background-color: #F48FB1;
    color:black;*/
}
.v-table tbody tr:nth-child(even) {
  background-color: #c7c7c7;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.sidebar {
  position: absolute;
  width: 280px;
  background: white;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex-shrink: 0;
  left: 0;
  height: calc(100vh);
  transform: translateX(-100%);
  z-index: 99;
  color: whitesmoke;
}

.sidebar.open {
  transform: translateX(0);
}

.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.content {
  flex: 1;
  min-width: 0;
  position: relative;
  overflow: hidden;
}
.sidebar-toggle {
  background-color: #000000;
  position: absolute;
  top: 10px;
  left: 225px;
  width: 40px;
  height: 40px;
  border: none;
  font-size: 20px;
  cursor: pointer;
  z-index: 20;
}

.menu-toggle {
  position: absolute;
  top: 20px;
  left: 16px;
  z-index: 10;
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.sidebar-close {
  position: relative;
  float: left;
  top: 10px;
  left: 252px;
  background: none;
  border: none;
  font-size: 24px;
  color: whitesmoke;
  cursor: pointer;
  z-index: 20;
}
/*
.esri-ui-top-left {
  top: 3.75rem !important;
  left: 0.25rem !important;
}
*/

.esri-ui-top-left {
  top: 3.75rem !important;
  left: 4px !important;
  transition: left 0.3s ease;
}

.sidebar.open ~ .content .esri-ui-top-left {
  left: 275px !important;
}

/*.esri-ui-bottom-left {
  bottom: 2.2rem !important;
  left: 0.25rem !important;
}*/
.esri-ui-bottom-left {
  bottom: 2.2rem !important;
  left: 0.25rem !important;
  transition: left 0.3s ease;
}

.sidebar.open ~ .content .esri-ui-bottom-left {
  left: 275px !important;
}

.esri-ui-top-right {
  top: 1.75rem !important;
  right: 0.25rem !important;
}

.esri-ui-bottom-right {
  bottom: 1.75rem !important;
  right: 0.25rem !important;
}

@media (max-width: 480px) {
  .esri-ui-top-left {
    top: 2.8rem !important;
    left: 0.125rem !important;
  }
}
/* Mobile Responsive */
@media (max-width: 768px) {
  .esri-ui-top-left {
    top: 3.125rem !important;
    left: 0.125rem !important;
  }
  .sidebar {
    position: absolute;
    height: 100%;
    left: 0;
    top: 0;
    transform: translateX(-100%);
    z-index: 100;
    max-height: calc(100vh - 60px);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-close {
    display: block;
  }

  .menu-toggle {
    display: block;
  }
}

@media (max-width: 480px) {
  .esri-ui-top-left {
    top: 2.8rem !important;
    left: 0.125rem !important;
  }
  .sidebar {
    width: 100%;
  }
}
</style>